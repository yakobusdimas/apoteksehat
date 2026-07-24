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
import re

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
    'mata': 'eye',
    'mata merah': 'red eye',
    'mata berair': 'watery eyes',
    'sakit mata': 'eye pain',
    'telinga': 'ear',
    'kuping': 'ear telinga',
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

def _extract_symptom_phrase(user_message: str) -> str:
    """Extract clean, natural symptom phrase from user message."""
    if not user_message:
        return "keluhan Anda"

    msg_lower = user_message.lower().strip()

    # Priority list of multi-word & single-word symptoms
    symptom_keywords = [
        'batuk berdahak', 'batuk kering', 'hidung tersumbat', 'hidung mampet',
        'asam lambung', 'perut kembung', 'sakit kepala', 'sakit perut',
        'sakit gigi', 'nyeri sendi', 'nyeri otot', 'sakit tenggorokan',
        'mata merah', 'mata berair', 'sakit mata', 'sakit telinga',
        'kulit kering', 'luka bakar', 'gatal-gatal', 'batuk pilek',
        'demam', 'panas', 'pusing', 'batuk', 'pilek', 'flu', 'mual',
        'muntah', 'diare', 'mencret', 'maag', 'gatal', 'ruam', 'luka',
        'sariawan', 'migrain', 'vitamin', 'suplemen', 'infeksi', 'nyeri'
    ]

    matched = []
    for kw in symptom_keywords:
        if kw in msg_lower:
            if not any(kw in existing for existing in matched):
                matched.append(kw)

    if matched:
        if len(matched) == 1:
            return matched[0]
        elif len(matched) == 2:
            return f"{matched[0]} dan {matched[1]}"
        else:
            return ", ".join(matched[:-1]) + f", serta {matched[-1]}"

    # Fallback: strip common conversational prefixes
    prefixes = [
        'saya mau beli obat', 'mau beli obat', 'rekomendasi obat', 'carikan obat',
        'obat untuk', 'obat buat', 'tolong obat', 'ada obat', 'apa obat',
        'saya merasa', 'saya mengalami', 'saya terkena', 'saya sakit', 'saya'
    ]
    cleaned = msg_lower
    for p in prefixes:
        if cleaned.startswith(p):
            cleaned = cleaned[len(p):].strip()

    cleaned = re.sub(r'^[,\.\s]+', '', cleaned)
    return cleaned if len(cleaned) > 2 else "keluhan Anda"


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
        ingredients = med.get('ingredients', '').lower() if isinstance(med.get('ingredients'), str) else ' '.join(med.get('ingredients', []))
        description = med.get('description', '').lower()
        composition = med.get('composition', '').lower()

        text_to_check = f"{med_name} {ingredients} {description} {composition}"

        for allergen in user_allergies_lower:
            if allergen in text_to_check:
                warnings.append({
                    'medicineId': med.get('id'),
                    'medicineName': med.get('name'),
                    'matchedAllergen': allergen,
                    'warning': f"⚠️ Peringatan Alergi: Obat '{med.get('name')}' mengandung bahan '{allergen}' yang Anda alergi!"
                })
                break

    return warnings


def _build_medicine_response(med):
    """Build consistent medicine response format compatible with frontend."""
    ingredients_str = med.get('ingredients') or med.get('composition') or ''
    benefits_str = med.get('benefits') or med.get('uses') or ''
    indication_str = med.get('indication') or med.get('uses') or ''
    category_raw = med.get('category') or med.get('kategori_id') or ''
    category_str = (category_raw[0] if isinstance(category_raw, list) else category_raw) or 'Lainnya'

    ingredients_list = [i.strip() for i in ingredients_str.split(',') if i.strip()] if isinstance(ingredients_str, str) else ingredients_str
    benefits_list = [b.strip() for b in benefits_str.split(',') if b.strip()] if isinstance(benefits_str, str) else benefits_str

    return {
        'id': med.get('id'),
        'name': med.get('name', ''),
        'category': category_str,
        'price': med.get('price', 0),
        'stock': med.get('stock', 0),
        'description': med.get('description') or med.get('composition') or '',
        'indication': indication_str,
        'dosage': med.get('dosage', 'Sesuai anjuran pada kemasan/dokter'),
        'ingredients': ingredients_list if ingredients_list else [ingredients_str],
        'benefits': benefits_list if benefits_list else [benefits_str],
        'sideEffects': [str(med.get('side_effects', ''))],
        'expiry': med.get('expiry', ''),
        'type': med.get('type', 'Obat'),
        'photo': med.get('photo') or med.get('image_url', ''),
    }


def _get_intent_response(intent: str, user_message: str, user_allergies: list = None):
    """Get response for predicted intent with warm, polite, and safe formatting."""
    intents_data = get_intents()
    synonyms_data = get_synonyms()
    
    # Use database so medicines have correct 'id' for frontend
    try:
        from models import Medicine
        medicines_db = [m.to_dict() for m in Medicine.query.filter_by(is_active=True).all()]
    except Exception as e:
        import traceback
        print("EXCEPTION IN GET_INTENT_RESPONSE:", e)
        traceback.print_exc()
        medicines_db = get_medicines()

    if user_allergies is None:
        user_allergies = []

    symptom_phrase = _extract_symptom_phrase(user_message)

    for intent_data in intents_data:
        if intent_data['tag'] == intent:
            responses = intent_data.get('responses', [])
            raw_template = random.choice(responses) if responses else ""

            # Check if intent needs medicine recommendation
            if intent in ('tanya_obat', 'efek_samping', 'dosis', 'kegunaan',
                         'kontraindikasi', 'interaksi_obat', 'ketersediaan', 'harga'):
                relevant = _find_relevant_medicines(user_message, medicines_db, synonyms_data, intent)

                # Filter out medicines containing active allergens if specified
                if user_allergies:
                    user_allergies_lower = [a.strip().lower() for a in user_allergies if a.strip()]
                    safe_medicines = []
                    for m in relevant:
                        text_check = f"{m.get('name','')} {m.get('ingredients','')} {m.get('description','')} {m.get('composition','')}".lower()
                        if not any(alg in text_check for alg in user_allergies_lower):
                            safe_medicines.append(m)
                    if safe_medicines:
                        relevant = safe_medicines

                if relevant:
                    med_names = ", ".join([m.get("name", "") for m in relevant[:3]])

                    response_text = (
                        f"Halo Kak! 😊 Terima kasih sudah berkonsultasi di Apotek Sehat.\n\n"
                        f"Untuk membantu meredakan keluhan **{symptom_phrase}**, berikut adalah pilihan obat yang aman dan direkomendasikan:\n"
                        f"• {med_names}\n\n"
                        f"💡 **Petunjuk & Saran Apoteker:**\n"
                        f"1. Pastikan minum obat sesuai dosis yang tertera pada kemasan.\n"
                        f"2. Perbanyak istirahat dan minum air putih hangat.\n"
                        f"3. Jika gejala tidak membaik dalam 3 hari, sangat disarankan untuk berkonsultasi ke dokter."
                    )

                    # Check allergy warnings
                    allergy_warnings = _check_allergies(relevant, user_allergies)
                    if allergy_warnings:
                        response_text += "\n\n⚠️ **Catatan Alergi:** Beberapa rekomendasi obat disesuaikan untuk menghindari bahan alergi yang Anda sebutkan."

                    return {
                        'response': response_text,
                        'medicines': [_build_medicine_response(m) for m in relevant],
                        'allergy_warnings': allergy_warnings if allergy_warnings else None,
                    }
                else:
                    return f"Halo Kak! 😊 Mohon maaf, saat ini stok obat yang spesifik untuk keluhan **{symptom_phrase}** sedang tidak tersedia di sistem kami. Kakak bisa berkonsultasi langsung dengan apoteker/dokter kami untuk alternatif terbaik."

            # Non-medicine recommendation intents (greeting, bye, etc.)
            if raw_template:
                return raw_template

    return synonyms_data.get('response_templates', {}).get('low_confidence', ['Maaf Kak, boleh jelaskan lagi keluhannya?'])[0]


def _find_relevant_medicines(message: str, medicines: list, synonyms: dict, intent: str) -> list:
    """Find medicines relevant to user query with accurate symptom matching."""
    message_lower = message.lower()

    # Add English translations to augment matching
    augmented_message = message_lower
    for id_term, en_term in SYMPTOM_TRANSLATION.items():
        if id_term in message_lower:
            augmented_message += f" {en_term}"

    results = []

    stopwords = {
        'obat', 'untuk', 'yang', 'buat', 'cara', 'mengatasi', 'mengobati', 'menyembuhkan',
        'sakit', 'saya', 'mau', 'beli', 'apa', 'tolong', 'carikan', 'rekomendasi', 'dan',
        'atau', 'dengan', 'ada', 'itu', 'ini', 'apakah', 'bagaimana', 'bisa', 'dong', 'mas',
        'mbak', 'dok', 'kak', 'tolong', 'minta', 'lagi', 'kena', 'kenapa'
    }

    import re
    # Hapus tanda baca dari message untuk pencarian keyword yang akurat
    clean_augmented = re.sub(r'[^a-z0-9\s]', ' ', augmented_message)
    words = set([w for w in clean_augmented.split() if w not in stopwords and len(w) >= 3])

    for med in medicines:
        name_lower = med.get('name', '').lower()
        indication = (med.get('indication') or med.get('uses') or '').lower()
        description = (med.get('description') or med.get('composition') or '').lower()
        benefits = (med.get('benefits') or med.get('uses') or '').lower()
        category_raw = med.get('category') or med.get('kategori_id') or ''
        category = (category_raw[0] if isinstance(category_raw, list) else category_raw).lower()

        content_score = 0
        if words:
            for w in words:
                pattern = r'\b' + re.escape(w) + r'\b'
                if re.search(pattern, name_lower):
                    content_score += 5
                if re.search(pattern, indication):
                    content_score += 4
                if re.search(pattern, benefits):
                    content_score += 3
                if re.search(pattern, category):
                    content_score += 2
                if re.search(pattern, description):
                    content_score += 1

        # Cek sinonim menggunakan key yang ada (penyakit_synonyms atau symptom_mapping)
        syn_map = synonyms.get('penyakit_synonyms') or synonyms.get('symptom_mapping', {})
        for syn, terms in syn_map.items():
            if any(t in message_lower for t in terms) or syn in message_lower:
                if syn in indication or syn in benefits or any(t in indication or t in benefits for t in terms):
                    content_score += 3

        if content_score > 0:
            results.append({**med, 'relevance_score': content_score})

    results.sort(key=lambda x: (-x['relevance_score'], x.get('price', 999999)))
    return results[:5]


@chat_bp.route('/api/chat', methods=['POST'])
def chat():
    """Main chatbot endpoint — recommend medicines based on symptoms with allergy awareness."""
    from models import Medicine
    model = get_model()
    # Use database so medicines have correct 'id' for frontend
    medicines = [m.to_dict() for m in Medicine.query.filter_by(is_active=True).all()]

    if model is None or not medicines:
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

        # Combine history context for NLP intent extraction
        history = data.get('history', [])
        context_text = user_message
        if isinstance(history, list) and history:
            # Only consider the last few user messages for symptom context
            user_history = [str(h.get('content', '')) for h in history if isinstance(h, dict) and h.get('role') == 'user']
            if user_history:
                context_text = " ".join(user_history) + " " + user_message

        # Preprocess & predict using the new Hybrid NLP Models
        from utils.nlp import get_vectorizer, get_label_encoder
        vectorizer = get_vectorizer()
        le = get_label_encoder()
        
        processed = preprocess_text(context_text)
        
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
