"""
Chatbot route: NLP-based medicine recommendation with safety checks.
Uses pre-trained model (.pkl) for inference + RAG fallback + allergy awareness.
"""

from flask import Blueprint, request, jsonify, g
from config import get_config
from utils.nlp import preprocess_text, load_model, get_model, get_medicines, get_intents, get_synonyms
from middleware import token_required
from models import User
import os
import random
import json
import time
import hashlib

chat_bp = Blueprint('chat', __name__)
config = get_config()

# Kamus terjemahan gejala (ID -> EN) — diperluas untuk 14 kategori baru
# Fix Bug #9: hanya 16 kata sebelumnya, sekarang 45+ kata
SYMPTOM_TRANSLATION = {
    # Nyeri & Demam
    'demam': 'fever',
    'panas': 'fever',
    'pusing': 'headache',
    'sakit kepala': 'headache',
    'nyeri': 'pain',
    'pegal': 'muscle pain',
    'nyeri otot': 'muscle pain',
    'nyeri sendi': 'joint pain',
    'sakit gigi': 'toothache',
    'migrain': 'migraine',
    # Batuk & Flu
    'batuk': 'cough',
    'batuk berdahak': 'productive cough',
    'batuk kering': 'dry cough',
    'pilek': 'runny nose',
    'hidung tersumbat': 'nasal congestion',
    'hidung mampet': 'nasal congestion',
    'bersin': 'sneezing',
    'flu': 'influenza',
    'sesak': 'shortness of breath',
    'sesak napas': 'shortness of breath',
    'napas': 'respiratory',
    # Lambung & Pencernaan
    'mual': 'nausea',
    'muntah': 'vomiting',
    'diare': 'diarrhea',
    'mencret': 'diarrhea',
    'sakit perut': 'abdominal pain',
    'perut kembung': 'bloating',
    'kembung': 'bloating',
    'lambung': 'stomach',
    'maag': 'gastric',
    'asam lambung': 'acid reflux',
    'sembelit': 'constipation',
    'susah bab': 'constipation',
    # Alergi & Kulit
    'alergi': 'allergy',
    'gatal': 'itching',
    'gatal-gatal': 'skin itching',
    'ruam': 'rash',
    'biduran': 'urticaria',
    'kulit kering': 'dry skin',
    'luka': 'wound',
    'luka bakar': 'burn',
    'jamur': 'fungal',
    'panu': 'tinea versicolor',
    'kurap': 'ringworm',
    # Mata & Telinga
    'mata merah': 'red eye',
    'mata berair': 'watery eyes',
    'sakit mata': 'eye pain',
    'telinga': 'ear',
    'sakit telinga': 'ear pain',
    'tuli': 'hearing',
    # Mulut & Tenggorokan
    'sakit tenggorokan': 'sore throat',
    'tenggorokan': 'throat',
    'sariawan': 'canker sore',
    'bau mulut': 'bad breath',
    'gusi': 'gum',
    # Vitamin & Suplemen
    'vitamin': 'vitamin',
    'kalsium': 'calcium',
    'stamina': 'energy supplement',
    'lemah': 'weakness',
    'lesu': 'fatigue',
    # Infeksi
    'infeksi': 'infection',
    'bakteri': 'bacterial',
    'radang': 'inflammation',
}

def _check_allergies(medicines_list: list, user_allergies: list) -> list:
    """Check medicines against user allergies and return warnings."""
    if not user_allergies or not medicines_list:
        return []

    user_allergies_lower = [a.strip().lower() for a in user_allergies if a.strip()]
    if not user_allergies_lower:
        return []

    warnings = []
    for med in medicines_list:
        med_name = med.get('name', '').lower()
        ingredients = med.get('ingredients', '').lower()
        description = med.get('description', '').lower()
        side_effects = med.get('side_effects', '').lower()

        text_to_check = f"{med_name} {ingredients} {description}"

        for allergen in user_allergies_lower:
            if allergen in text_to_check:
                warnings.append({
                    'medicineId': med.get('id'),
                    'medicineName': med.get('name'),
                    'matchedAllergen': allergen,
                    'warning': f"⚠️ Obat ini mengandung '{allergen}' yang Anda alergi. Konsultasikan alternatif dengan apoteker."
                })
                break

    return warnings


def _build_medicine_response(med):
    """Build consistent medicine response format compatible with frontend."""
    # Support both field formats from JSON
    ingredients_str = med.get('ingredients') or med.get('composition') or ''
    benefits_str = med.get('benefits') or med.get('uses') or ''
    indication_str = med.get('indication') or med.get('uses') or ''
    category_raw = med.get('category') or med.get('kategori_id') or ''
    category_str = (category_raw[0] if isinstance(category_raw, list) else category_raw) or 'Lainnya'

    ingredients_list = [i.strip() for i in ingredients_str.split(',') if i.strip()] if ingredients_str else []
    benefits_list = [b.strip() for b in benefits_str.split(',') if b.strip()] if benefits_str else []

    return {
        'id': med.get('id'),
        'name': med.get('name', ''),
        'category': category_str,
        'price': med.get('price', 0),
        'stock': med.get('stock', 0),
        'description': med.get('description') or med.get('composition') or '',
        'indication': indication_str,
        'dosage': med.get('dosage', 'Sesuai anjuran dokter'),
        'ingredients': ingredients_list if ingredients_list else [ingredients_str],
        'benefits': benefits_list if benefits_list else [benefits_str],
        'sideEffects': [str(med.get('side_effects', ''))],
        'expiry': med.get('expiry', ''),
        'type': med.get('type', 'Tablet'),
        'photo': med.get('photo') or med.get('image_url', ''),
    }


def _get_intent_response(intent: str, user_message: str, user_allergies: list = None):
    """Get response for predicted intent with allergy safety check."""
    intents_data = get_intents()
    synonyms_data = get_synonyms()
    medicines_db = get_medicines()

    if user_allergies is None:
        user_allergies = []

    for intent_data in intents_data:
        if intent_data['tag'] == intent:
            responses = intent_data.get('responses', [])
            response_text = random.choice(responses) if responses else "Maaf, saya tidak memiliki jawaban untuk itu."

            # Check if intent needs medicine recommendation
            if intent in ('tanya_obat', 'efek_samping', 'dosis', 'kegunaan',
                         'kontraindikasi', 'interaksi_obat', 'ketersediaan', 'harga'):
                relevant = _find_relevant_medicines(user_message, medicines_db, synonyms_data, intent)
                if relevant:
                    med_names = ", ".join([m.get("name", "") for m in relevant[:3]])
                    
                    response_text = response_text.replace('{penyakit}', user_message)
                    response_text = response_text.replace('{obat_list}', med_names)
                    response_text = response_text.replace('{obat}', relevant[0].get('name', ''))
                    response_text = response_text.replace('{side_effects}', relevant[0].get('side_effects', ''))
                    response_text = response_text.replace('{composition}', relevant[0].get('composition') or relevant[0].get('ingredients', ''))
                    response_text = response_text.replace('{uses}', relevant[0].get('uses') or relevant[0].get('indication', ''))
                    response_text = response_text.replace('{dosage}', relevant[0].get('dosage', ''))

                    # Check allergies
                    allergy_warnings = _check_allergies(relevant, user_allergies)

                    # Filter out allergic medicines from recommendations text
                    if allergy_warnings:
                        response_text += "\n\n⚠️ Perhatian: Beberapa obat mengandung komponen yang Anda alergi. Silakan perhatikan peringatan di bawah ini."

                    return {
                        'response': response_text,
                        'medicines': [_build_medicine_response(m) for m in relevant],
                        'allergy_warnings': allergy_warnings if allergy_warnings else None,
                    }
                else:
                    return "Maaf, saat ini saya tidak menemukan obat yang cocok untuk keluhan tersebut. Silakan konsultasikan dengan apoteker."

            return response_text

    return synonyms_data.get('response_templates', {}).get('low_confidence', ['Maaf, saya tidak memahami.'])[0]


def _find_relevant_medicines(message: str, medicines: list, synonyms: dict, intent: str) -> list:
    """Find medicines relevant to user query."""
    message_lower = message.lower()
    
    # Tambahkan terjemahan bahasa Inggris ke dalam pesan agar cocok dengan database
    augmented_message = message_lower
    for id_term, en_term in SYMPTOM_TRANSLATION.items():
        if id_term in message_lower:
            augmented_message += f" {en_term}"
            
    results = []

    for med in medicines:
        score = 0
        name_lower = med.get('name', '').lower()
        # Support both JSON field formats: new (indication/benefits) and original (uses/composition/kategori_id)
        indication = (med.get('indication') or med.get('uses') or '').lower()
        description = (med.get('description') or med.get('composition') or '').lower()
        benefits = (med.get('benefits') or med.get('uses') or '').lower()
        category_raw = med.get('category') or med.get('kategori_id') or ''
        category = (category_raw[0] if isinstance(category_raw, list) else category_raw).lower()
        side_effects = med.get('side_effects', '').lower()

        stopwords = {'obat', 'untuk', 'yang', 'buat', 'cara', 'mengatasi', 'mengobati', 'menyembuhkan', 'sakit', 'saya', 'mau', 'beli', 'apa', 'tolong', 'carikan', 'rekomendasi', 'dan', 'atau', 'dengan', 'ada', 'itu', 'ini', 'apakah', 'bagaimana', 'bisa'}
        words = set([w for w in augmented_message.split() if w not in stopwords and len(w) > 3])
        
        content_score = 0
        if not words:
            pass
        else:
            if any(w in indication for w in words): content_score += 3
            if any(w in benefits for w in words): content_score += 2
            if any(w in description for w in words): content_score += 1
            if any(w in name_lower for w in words): content_score += 2
            if any(w in category for w in words): content_score += 1

        syn_map = synonyms.get('symptom_mapping', {})
        for syn, terms in syn_map.items():
            if any(t in message_lower for t in terms):
                if any(t in indication or t in benefits for t in terms):
                    content_score += 2

        # -------------------------------------------------------------
        # COLLABORATIVE FILTERING / HYBRID SYSTEM
        # -------------------------------------------------------------
        cf_score = 0
        
        # User personalization based on past purchase categories
        user_id = getattr(g, 'current_user_id', None)
        try:
            if user_id and 'past_categories' not in locals():
                from models import Order, OrderItem, db
                past_items = db.session.query(OrderItem.medicine_name).join(Order).filter(Order.user_id == user_id).all()
                past_names = [i[0].lower() for i in past_items]
                
                past_categories = set()
                for pm in past_names:
                    for m in medicines:
                        if m.get('name', '').lower() == pm:
                            c_raw = m.get('category') or m.get('kategori_id') or ''
                            c_val = (c_raw[0] if isinstance(c_raw, list) else c_raw).lower()
                            past_categories.add(c_val)
                            
            if user_id and 'past_categories' in locals() and category in past_categories:
                cf_score += 1.5  # Item-based CF category boost
        except Exception:
            pass

        total_score = content_score + cf_score

        if total_score > 0:
            results.append({**med, 'relevance_score': total_score})

    results.sort(key=lambda x: (-x['relevance_score'], x.get('price', 999999)))
    return results[:5]


@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint — recommend medicines based on symptoms with allergy awareness."""
    model = get_model()
    medicines = get_medicines()

    if model is None or medicines is None:
        return jsonify({
            'status': 'error',
            'message': 'Model atau data belum dimuat. Coba beberapa saat lagi.'
        }), 503

    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({'status': 'error', 'message': 'Request body harus berupa JSON valid.'}), 400

        user_message = data.get('message', '')
        if not user_message or not isinstance(user_message, str):
            return jsonify({'status': 'error', 'message': 'Field "message" wajib diisi dan berupa teks.'}), 400

        user_message = user_message.strip()
        if not user_message:
            return jsonify({'status': 'error', 'message': 'Pesan tidak boleh kosong.'}), 400

        if len(user_message) > config.MAX_MESSAGE_LENGTH:
            return jsonify({
                'status': 'error',
                'message': f'Pesan terlalu panjang. Maksimal {config.MAX_MESSAGE_LENGTH} karakter.'
            }), 400

        # Extract allergies from request (optional)
        user_allergies = data.get('allergies', [])
        if not user_allergies:
            try:
                user_obj = User.query.filter_by(id=g.current_user_id).first()
                if user_obj and user_obj.allergies:
                    user_allergies = json.loads(user_obj.allergies)
            except (ImportError, Exception):
                pass

        # Preprocess & predict using the new Hybrid NLP Models
        from utils.nlp import get_vectorizer, get_label_encoder
        vectorizer = get_vectorizer()
        le = get_label_encoder()
        
        processed = preprocess_text(user_message)
        
        if vectorizer and le:
            # Enhanced Logistic Regression pipeline
            X = vectorizer.transform([processed])
            pred_encoded = model.predict(X)
            predicted_intent = le.inverse_transform(pred_encoded)[0]
            probabilities = model.predict_proba(X)[0]
            confidence = max(probabilities)
        else:
            # Fallback for old monolithic model
            predicted_intent = model.predict([processed])[0]
            probabilities = model.predict_proba([processed])[0]
            confidence = max(probabilities)

        # Tiered confidence handling
        if confidence >= 0.85:
            # High confidence — direct answer
            response_data = _get_intent_response(predicted_intent, user_message, user_allergies)
            return jsonify({
                'status': 'success',
                'response': response_data if isinstance(response_data, str) else response_data.get('response', ''),
                'intent': predicted_intent,
                'confidence': round(float(confidence), 4),
                'data': response_data.get('medicines') if isinstance(response_data, dict) else None,
                'allergyWarnings': response_data.get('allergy_warnings') if isinstance(response_data, dict) else None,
            })

        elif confidence >= config.MIN_CONFIDENCE:
            # Medium confidence — cautious answer
            response_data = _get_intent_response(predicted_intent, user_message, user_allergies)
            return jsonify({
                'status': 'success',
                'response': response_data if isinstance(response_data, str) else response_data.get('response', ''),
                'intent': predicted_intent,
                'confidence': round(float(confidence), 4),
                'data': response_data.get('medicines') if isinstance(response_data, dict) else None,
                'allergyWarnings': response_data.get('allergy_warnings') if isinstance(response_data, dict) else None,
            })

        else:
            # Low confidence — fallback to RAG or ask for clarification
            from utils.rag_engine import generate_llm_response
            rag_response = generate_llm_response(user_message)
            return jsonify({
                'status': 'success',
                'response': f"Maaf, saya kurang yakin memahami '{user_message}'.\n\n{rag_response}",
                'intent': 'ai_rag_fallback',
                'confidence': round(float(confidence), 4),
                'suggestions': [
                    "Apa obat untuk demam?",
                    "Bagaimana dosis anak pilek?",
                    "Ada vitamin terbaik?",
                ],
            })

    except Exception as e:
        import logging
        logger = logging.getLogger('apotek')
        logger.error(f"Chat endpoint error: {str(e)}", exc_info=True)

        if config.FLASK_DEBUG:
            detail = str(e)
        else:
            detail = 'Terjadi kesalahan pada server. Silakan coba lagi.'

        return jsonify({
            'status': 'error',
            'message': detail,
            'intent': 'tidak_tahu',
            'confidence': 0.0,
        }), 500


@chat_bp.route('/api/chat/quick-suggestions', methods=['GET'])
def quick_suggestions():
    """Return suggested questions based on common intents."""
    return jsonify({
        'status': 'success',
        'suggestions': [
            {'text': 'Apa obat untuk demam?', 'intent': 'demam'},
            {'text': 'Bagaimana dosis anak pilek?', 'intent': 'pilek_anak'},
            {'text': 'Ada vitamin terbaik?', 'intent': 'vitamin'},
            {'text': 'Efek samping paracetamol?', 'intent': 'efek_samping'},
            {'text': 'Obat mag yang aman?', 'intent': 'lambung'},
        ]
    })
