#!/usr/bin/env python3
"""
Flask REST API untuk Chatbot Apotek
Endpoint: POST /api/chat, GET /api/health, GET /api/medicines
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import json
import re

app = Flask(__name__)

# ── Environment Configuration ──────────────────────────────────────────
FLASK_DEBUG = os.getenv('FLASK_DEBUG', 'false').lower() in ('1', 'true', 'yes')
PORT = int(os.getenv('PORT', '5000'))
CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174,http://localhost:3000')
MIN_CONFIDENCE = float(os.getenv('MIN_CONFIDENCE', '0.9'))
MAX_MESSAGE_LENGTH = int(os.getenv('MAX_MESSAGE_LENGTH', '500'))

# Enable CORS with configurable origins
_cors_origins_list = [o.strip() for o in CORS_ORIGINS.split(',') if o.strip()]
CORS(app, resources={
    r"/api/*": {
        "origins": _cors_origins_list,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load model and data
MODEL_PATH = '../model_training/model/chatbot_model.pkl'
MEDICINES_PATH = '../model_training/data/medicines_primary.json'
INTENTS_PATH = '../model_training/data/intents.json'
SYNONYMS_PATH = '../model_training/data/synonyms_id.json'

# Global variables
model = None
medicines = None
intents = None
synonyms = None

SYMPTOM_TRANSLATION = {
    'demam': 'fever',
    'panas': 'fever',
    'pusing': 'headache',
    'sakit kepala': 'headache',
    'batuk': 'cough',
    'pilek': 'sneezing',
    'alergi': 'allerg',
    'gatal': 'skin',
    'mual': 'nausea',
    'muntah': 'vomiting',
    'diare': 'diarrhea',
    'mencret': 'diarrhea',
    'lambung': 'stomach',
    'sakit perut': 'abdominal pain',
    'nyeri': 'pain',
    'infeksi': 'infection',
    'bakteri': 'bacterial',
    'jamur': 'fungal',
    'vitamin': 'vitamin',
    'kalsium': 'calcium'
}

def load_resources():
    """Load model and data files"""
    global model, medicines, intents, synonyms

    print("[*] Loading model and data...")

    # Load trained model
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    # Load medicines
    with open(MEDICINES_PATH, 'r', encoding='utf-8') as f:
        medicines = json.load(f)['medicines']

    # Load intents
    with open(INTENTS_PATH, 'r', encoding='utf-8') as f:
        intents = json.load(f)['intents']

    # Load synonyms
    with open(SYNONYMS_PATH, 'r', encoding='utf-8') as f:
        synonyms = json.load(f)

    print("[OK] Resources loaded successfully")


def error_response(message, status_code=400):
    """Standardized error response"""
    return jsonify({
        'status': 'error',
        'message': message
    }), status_code


def preprocess_text(text):
    """Preprocess user input"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = ' '.join(text.split())
    return text

def find_medicine_by_name(query):
    """Find medicine by name or partial match"""
    query_lower = query.lower()
    
    # Exact match
    for med in medicines:
        if query_lower in med['name'].lower():
            return med
    
    # Check composition
    for med in medicines:
        if query_lower in med['composition'].lower():
            return med
    
    return None

def find_medicines_by_category(disease):
    """Find medicines for a disease/symptom"""
    disease_lower = disease.lower()
    
    # Augment disease with English translation for DB search
    augmented_disease = disease_lower
    for id_term, en_term in SYMPTOM_TRANSLATION.items():
        if id_term in disease_lower:
            augmented_disease += f" {en_term}"
            
    matches = []
    
    # Split augmented disease into keywords
    keywords = [w for w in augmented_disease.split() if len(w) > 3] or [disease_lower]
    
    for med in medicines:
        uses_lower = med['uses'].lower()
        if any(kw in uses_lower for kw in keywords):
            matches.append(med)
    
    # Also check synonyms
    for syn_key, syn_list in synonyms['penyakit_synonyms'].items():
        if disease_lower in [s.lower() for s in syn_list]:
            for med in medicines:
                if any(s in med['uses'].lower() for s in syn_list):
                    if med not in matches:
                        matches.append(med)
    
    return matches[:5]  # Return top 5

def get_intent_response(intent_tag, query):
    """Get response based on intent"""
    # Find intent
    intent_obj = None
    for intent in intents:
        if intent['tag'] == intent_tag:
            intent_obj = intent
            break
    
    if not intent_obj:
        return "Maaf, saya tidak mengerti pertanyaan Anda."
    
    # Handle different intent types
    if intent_tag == 'tanya_obat':
        # Extract disease from query
        diseases = find_medicines_by_category(query)
        if diseases:
            med_list = ", ".join([m['name'] for m in diseases[:3]])
            response = intent_obj['responses'][0]
            response = response.replace('{penyakit}', query)
            response = response.replace('{obat_list}', med_list)
            return {
                'response': response,
                'medicines': diseases[:3]
            }
        else:
            return "Maaf, kami tidak menemukan obat untuk kondisi tersebut. Silakan konsultasi dengan apoteker."
    
    elif intent_tag in ['efek_samping', 'dosis', 'ketersediaan', 'komposisi', 'kegunaan']:
        # Extract medicine name
        medicine = find_medicine_by_name(query)
        if medicine:
            response = intent_obj['responses'][0]
            response = response.replace('{obat}', medicine['name'])
            response = response.replace('{side_effects}', medicine['side_effects'])
            response = response.replace('{composition}', medicine['composition'])
            response = response.replace('{uses}', medicine['uses'])
            return {
                'response': response,
                'medicine': medicine
            }
        else:
            return "Maaf, obat yang Anda cari tidak ada dalam database kami."
    
    else:
        # Simple response intents (salam, perpisahan, etc.)
        import random
        return random.choice(intent_obj['responses'])

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    # ── Resource check ────────────────────────────────────────────
    if model is None or medicines is None:
        return error_response(
            'Model atau data belum dimuat. Coba beberapa saat lagi.',
            503
        )

    try:
        # ── Parse & validate request body ─────────────────────────
        data = request.get_json(silent=True)
        if data is None:
            return error_response('Request body harus berupa JSON valid.')

        user_message = data.get('message', '')

        if not user_message or not isinstance(user_message, str):
            return error_response('Field "message" wajib diisi dan berupa teks.')

        # Trim whitespace
        user_message = user_message.strip()
        if not user_message:
            return error_response('Pesan tidak boleh kosong.')

        if len(user_message) > MAX_MESSAGE_LENGTH:
            return error_response(
                f'Pesan terlalu panjang. Maksimal {MAX_MESSAGE_LENGTH} karakter.'
            )

        # ── Preprocess & predict ───────────────────────────────────
        processed = preprocess_text(user_message)
        predicted_intent = model.predict([processed])[0]
        probabilities = model.predict_proba([processed])[0]
        confidence = max(probabilities)

        # ── Rule-based direct override for Dosage, Side Effects, & Ingredients ──
        lower_msg = user_message.lower()
        
        # 1. Dosis / Aturan Pakai
        if any(w in lower_msg for w in ['dosis', 'aturan pakai', 'cara minum', 'berapa kali', 'aturan minum']):
            matched_med = find_medicine_by_name(user_message)
            if not matched_med:
                # Coba cari kata kunci obat dalam pesan
                words = [w for w in lower_msg.split() if len(w) > 3 and w not in ['dosis', 'penggunaan', 'obat', 'aturan', 'pakai', 'cara', 'minum', 'berapa', 'kali']]
                for w in words:
                    matched_med = find_medicine_by_name(w)
                    if matched_med: break
            
            if matched_med:
                dosage_info = matched_med.get('dosage') or matched_med.get('note') or 'Sesuai aturan pakai pada kemasan.'
                res_text = f"💡 **Informasi Dosis & Aturan Pakai {matched_med['name']}:**\n{dosage_info}\n\n⚠️ *Selalu baca petunjuk pada kemasan atau konsultasikan dengan apoteker/dokter jika sakit berlanjut.*"
                return jsonify({
                    'status': 'success',
                    'response': res_text,
                    'intent': 'dosis',
                    'confidence': 0.99,
                    'data': matched_med
                })

        # 2. Efek Samping / Efek / Bahaya
        if any(w in lower_msg for w in ['efek samping', 'efek', 'bahaya', 'efeknya']):
            matched_med = find_medicine_by_name(user_message)
            if not matched_med:
                words = [w for w in lower_msg.split() if len(w) > 3 and w not in ['efek', 'samping', 'bahaya', 'efeknya', 'obat', 'dari', 'apakah']]
                for w in words:
                    matched_med = find_medicine_by_name(w)
                    if matched_med: break

            if matched_med:
                side_fx = matched_med.get('side_effects') or 'Efek samping jarang terjadi jika dikonsumsi sesuai dosis.'
                res_text = f"ℹ️ **Informasi Efek Samping {matched_med['name']}:**\n{side_fx}\n\n⚠️ *Hentikan penggunaan dan hubungi medis jika mengalami reaksi alergi berat.*"
                return jsonify({
                    'status': 'success',
                    'response': res_text,
                    'intent': 'efek_samping',
                    'confidence': 0.99,
                    'data': matched_med
                })

        # ── Confidence check ───────────────────────────────────────
        if confidence < MIN_CONFIDENCE:
            response = synonyms['response_templates']['low_confidence'][0]
            return jsonify({
                'status': 'success',
                'response': response,
                'intent': 'tidak_tahu',
                'confidence': round(float(confidence), 4)
            })

        # ── Get response ───────────────────────────────────────────
        response_data = get_intent_response(predicted_intent, user_message)

        if isinstance(response_data, dict):
            return jsonify({
                'status': 'success',
                'response': response_data['response'],
                'intent': predicted_intent,
                'confidence': round(float(confidence), 4),
                'data': response_data.get('medicines') or response_data.get('medicine')
            })
        else:
            return jsonify({
                'status': 'success',
                'response': response_data,
                'intent': predicted_intent,
                'confidence': round(float(confidence), 4)
            })

    except Exception as e:
        print(f"[ERROR] Chat endpoint error: {str(e)}")
        # Don't leak internal details in production
        if FLASK_DEBUG:
            detail = str(e)
        else:
            detail = 'Terjadi kesalahan pada server. Silakan coba lagi.'
        return jsonify({
            'status': 'error',
            'message': detail,
            'intent': 'tidak_tahu',
            'confidence': 0.0
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint with environment info"""
    return jsonify({
        'status': 'ok',
        'model_loaded': model is not None,
        'total_medicines': len(medicines) if medicines else 0,
        'environment': 'development' if FLASK_DEBUG else 'production',
        'min_confidence': MIN_CONFIDENCE
    })

@app.route('/api/medicines', methods=['GET'])
def list_medicines():
    """List all medicines"""
    return jsonify({
        'status': 'success',
        'total': len(medicines),
        'medicines': medicines
    })

if __name__ == '__main__':
    # Load resources before starting server
    load_resources()

    # Run Flask app
    print("\n" + "="*60)
    print("    CHATBOT API SERVER - APOTEK SEHAT")
    print("="*60)
    print(f"  Environment : {'DEVELOPMENT' if FLASK_DEBUG else 'PRODUCTION'}")
    print(f"  Server      : http://localhost:{PORT}")
    print(f"  Endpoint    : POST http://localhost:{PORT}/api/chat")
    print(f"  Debug Mode  : {FLASK_DEBUG}")
    print("="*60 + "\n")

    app.run(host='0.0.0.0', port=PORT, debug=FLASK_DEBUG)
