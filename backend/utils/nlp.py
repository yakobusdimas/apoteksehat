"""
NLP utilities for chatbot — text preprocessing with Indonesian stemming.
"""

import re
import os
import json
import pickle

# Try to import Sastrawi (optional — fallback to simple preprocessing)
try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    _factory = StemmerFactory()
    stemmer = _factory.create_stemmer()
except ImportError:
    stemmer = None


def preprocess_text(text: str) -> str:
    """Preprocess user input for NLP model."""
    if not text:
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = ' '.join(text.split())
    if stemmer:
        text = stemmer.stem(text)
    return text


# ── Model Loader ───────────────────────────────────────────────────────────

_model = None
_vectorizer = None
_label_encoder = None
_medicines = None
_intents = None
_synonyms = None


def load_model(config):
    """Load ML model and data files."""
    global _model, _vectorizer, _label_encoder, _medicines, _intents, _synonyms

    if _model is not None:
        return  # Already loaded

    import logging
    logger = logging.getLogger('apotek')
    logger.info("[*] Loading model and data...")

    # Load models
    model_path = os.getenv('MODEL_PATH', config.MODEL_PATH)
    vectorizer_path = os.getenv('VECTORIZER_PATH', config.VECTORIZER_PATH)
    le_path = os.getenv('LABEL_ENCODER_PATH', config.LABEL_ENCODER_PATH)

    import joblib
    try:
        _model = joblib.load(model_path)
        _vectorizer = joblib.load(vectorizer_path)
        _label_encoder = joblib.load(le_path)
    except Exception as e:
        logger.error(f"Joblib failed to load models: {e}, falling back to pickle")
        with open(model_path, 'rb') as f:
            _model = pickle.load(f)
        with open(vectorizer_path, 'rb') as f:
            _vectorizer = pickle.load(f)
        with open(le_path, 'rb') as f:
            _label_encoder = pickle.load(f)

    # Load medicines
    medicines_path = os.getenv('MEDICINES_PATH', config.MEDICINES_PATH)
    with open(medicines_path, 'r', encoding='utf-8') as f:
        _medicines = json.load(f)['medicines']

    # Load intents
    intents_path = os.getenv('INTENTS_PATH', config.INTENTS_PATH)
    with open(intents_path, 'r', encoding='utf-8') as f:
        _intents = json.load(f)['intents']

    # Load synonyms
    synonyms_path = os.getenv('SYNONYMS_PATH', config.SYNONYMS_PATH)
    with open(synonyms_path, 'r', encoding='utf-8') as f:
        _synonyms = json.load(f)

    logger.info(f"[OK] Resources loaded: {len(_medicines)} medicines, {len(_intents)} intents")


def get_model():
    return _model

def get_vectorizer():
    return _vectorizer

def get_label_encoder():
    return _label_encoder

def get_medicines():
    return _medicines


def get_intents():
    return _intents


def get_synonyms():
    return _synonyms
