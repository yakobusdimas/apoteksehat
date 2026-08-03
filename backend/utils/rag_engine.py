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
    Generate response using Gemini LLM if available, 
    otherwise fall back to smart keyword-based responses.
    """
    config = get_config()
    api_key = config.GEMINI_API_KEY if hasattr(config, 'GEMINI_API_KEY') else os.getenv('GEMINI_API_KEY')

    if api_key:
        try:
            from google import genai as google_genai
            client = google_genai.Client(api_key=api_key)

            context = search_medicines_context(query)
            prompt = f"""Kamu adalah asisten apoteker ramah dari 'Apotek Sehat'.
Jawablah pertanyaan pelanggan berikut dengan bahasa Indonesia yang alami, sopan, dan mudah dipahami.

PERATURAN PENTING:
1. JANGAN MENGGUNAKAN SIMBOL MARKDOWN SEPERTI BOLD (**) ATAU ITALIC (*). Gunakan teks biasa yang rapi.
2. Gunakan baris baru dan poin strip (-) jika membuat daftar agar mudah dibaca.
3. Rujuk informasi dari Data Obat di bawah ini jika relevan.

Data Obat Terkait:
{context if context else 'Tidak ada obat spesifik yang cocok.'}

Pertanyaan Pelanggan:
"{query}"

Berikan jawaban yang jelas, hangat, dan bermanfaat (maksimal 3 paragraf)."""

            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            # Cleanup any leftover asterisks
            text = response.text.replace('**', '').replace('*', '')
            return text
        except Exception as e:
            print(f"[RAG] Gemini fallback error: {e}")
    
    # Smart fallback without Gemini
    return _get_fallback_response(query).replace('**', '').replace('*', '')
