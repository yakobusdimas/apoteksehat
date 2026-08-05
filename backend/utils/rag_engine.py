"""
RAG Engine for Apotek Sehat.
Handles Retrieval of medicine context and smart fallback responses.
"""

import os
from config import get_config

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

# ── Smart Fallback Responses ────────────────────────────────────────────────
_FALLBACK_RESPONSES = {
    'vitamin': (
        "💊 **Rekomendasi Vitamin:**\n\n"
        "Kami punya beberapa pilihan vitamin yang bisa Anda pertimbangkan:\n"
        "• **Vitamin C** — untuk daya tahan tubuh\n"
        "• **Vitamin B Complex** — untuk metabolisme energi\n"
        "• **Multivitamin** — untuk kebutuhan harian lengkap\n\n"
        "Untuk rekomendasi yang lebih spesifik, silakan sebutkan kebutuhan Anda,\n"
        "misal: 'Vitamin untuk daya tahan tubuh' atau 'Suplemen untuk anak'."
    ),
    'default': (
        "Mohon maaf, saya akan coba bantu dengan informasi yang saya miliki.\n\n"
        "Untuk pertanyaan tentang:\n"
        "• **Obat & gejala** — sebutkan keluhan Anda (misal: 'Obat untuk demam')\n"
        "• **Dosis & efek samping** — sebutkan nama obat (misal: 'Dosis paracetamol')\n"
        "• **Vitamin & suplemen** — sebutkan kebutuhan Anda (misal: 'Vitamin untuk imunitas')\n\n"
        "Silakan coba pertanyaan yang lebih spesifik agar saya bisa membantu lebih baik! 😊"
    ),
}


def _get_fallback_response(query: str) -> str:
    """Return a helpful fallback response based on keywords in query."""
    query_lower = query.lower()

    if any(w in query_lower for w in ['vitamin', 'suplemen', 'multivitamin']):
        return _FALLBACK_RESPONSES['vitamin']
    
    return _FALLBACK_RESPONSES['default']


def search_medicines_context(query: str) -> str:
    """
    Search for medicines in PostgreSQL based on keywords in the query.
    Returns a formatted string containing medicine context.
    """
    try:
        from models import Medicine
        from sqlalchemy import or_
    except ImportError:
        return ""
    
    augmented_query = query.lower()
    for id_term, en_term in SYMPTOM_TRANSLATION.items():
        if id_term in augmented_query:
            augmented_query += f" {en_term}"
    
    keywords = [w.lower() for w in augmented_query.replace('?', ' ').replace(',', ' ').split() if len(w) > 2]
    if not keywords:
        return ""
    
    filters = []
    for kw in keywords:
        filters.append(Medicine.name.ilike(f'%{kw}%'))
        filters.append(Medicine.indication.ilike(f'%{kw}%'))
        filters.append(Medicine.benefits.ilike(f'%{kw}%'))
        filters.append(Medicine.description.ilike(f'%{kw}%'))
    
    results = Medicine.query.filter(or_(*filters)).limit(5).all()
    if not results:
        return ""
    
    context_lines = ["--- DATA OBAT TERSEDIA ---"]
    for med in results:
        context_lines.append(
            f"Nama Obat: {med.name} | Kategori: {med.category} | Harga: Rp{med.price} | Stok: {med.stock}\n"
            f"Indikasi: {med.indication}\n"
            f"Dosis: {med.dosage}\n"
            f"Efek Samping: {med.side_effects}\n"
        )
    return "\n".join(context_lines)


def generate_llm_response(query: str) -> str:
    """
    Generate response using Groq LLM (Llama-3.3 70B) or Gemini LLM if available, 
    otherwise fall back to smart keyword-based responses.
    """
    import urllib.request
    import json

    config = get_config()
    groq_key = os.getenv('GROQ_API_KEY') or (getattr(config, 'GROQ_API_KEY', None))
    gemini_key = config.GEMINI_API_KEY if hasattr(config, 'GEMINI_API_KEY') else os.getenv('GEMINI_API_KEY')

    context = search_medicines_context(query)
    prompt_system = (
        "Kamu adalah 'Apoteker AI' resmi dari 'Apotek Sehat'. Jawablah dengan hangat, ramah, dan sangat manusiawi.\n\n"
        "TUGAS DAN ATURAN UTAMA:\n"
        "1. BATASAN DOMAIN: Jawab pertanyaan seputar kesehatan, obat-obatan, dosis, cara minum, efek samping, indikasi, dan suplemen.\n"
        "2. BERIKAN DOSIS & CARA PAKAI DENGAN JELAS: Untuk obat-obatan Indonesia (seperti Oskadon, Bodrex, Panadol, Inzana, Mixagrip, Paracetamol, dll), berikan dosis dan cara pakai yang jelas dan langsung (contoh: 'Dewasa: 1 tablet 3-4 kali sehari sesudah makan'). JANGAN PERNAH menyuruh pengguna untuk 'membaca kemasan' atau menjawab tidak tahu jika obat tersebut adalah obat umum.\n"
        "3. JIKA DI LUAR DOMAIN: Jika pengguna bertanya tentang topik di luar kesehatan (politik, hobi, coding, dll), tolak secara halus.\n"
        "4. TANPA SIMBOL BINTANG MARKDOWN: Dilarang menggunakan tanda bintang bold (**) atau italic (*). Gunakan teks biasa yang rapi dan bersih.\n\n"
        f"Data Obat Terkait dari Database Apotek Sehat:\n{context if context else 'Obat umum Indonesia.'}"
    )

    # 1. 🚀 PRIORITAS 1: GROQ LLM (Super Cepat & Ramah)
    if groq_key and groq_key.startswith('gsk_'):
        try:
            url = "https://api.groq.com/openai/v1/chat/completions"
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": prompt_system},
                    {"role": "user", "content": query}
                ],
                "temperature": 0.5,
                "max_tokens": 500
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {groq_key}",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                res_data = json.loads(resp.read().decode('utf-8'))
                text = res_data['choices'][0]['message']['content']
                clean_text = text.replace('**', '').replace('*', '').strip()
                if clean_text:
                    return clean_text
        except Exception as e:
            print(f"[RAG] Groq API error: {e}")

    # 2. 🌟 PRIORITAS 2: GEMINI LLM
    if gemini_key and gemini_key.startswith('AIzaSy'):
        try:
            from google import genai as google_genai
            client = google_genai.Client(api_key=gemini_key)
            prompt_full = f"{prompt_system}\n\nPertanyaan Pelanggan: \"{query}\"\n\nBerikan jawaban ramah dan ilmiah:"
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt_full,
            )
            text = response.text.replace('**', '').replace('*', '').strip()
            if text:
                return text
        except Exception as e:
            print(f"[RAG] Gemini fallback error: {e}")
    
    # 3. 💡 Smart fallback jika tanpa API key
    return _get_fallback_response(query).replace('**', '').replace('*', '')
