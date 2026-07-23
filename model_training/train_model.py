#!/usr/bin/env python3
"""
Train chatbot model automatically.
Run: python train_model.py

This script:
- Loads intents.json
- Preprocesses text with Sastrawi stemmer
- Trains Logistic Regression classifier with TF-IDF
- Saves model to chatbot_model.pkl
- Can be run on startup or via cron
"""

import json
import re
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
# pyrefly: ignore [missing-import]
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory

def preprocess_text(text: str) -> str:
    """Preprocess text with Sastrawi stemmer."""
    try:
        stemmer = StemmerFactory().create_stemmer()
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return stemmer.stem(' '.join(text.split()))
    except ImportError:
        # Fallback if Sastrawi not available
        text = text.lower()
        text = re.sub(r'[^a-z0-9\s]', '', text)
        return ' '.join(text.split())

def train_model():
    """Train and save the model."""
    intents_path = os.path.join(os.path.dirname(__file__), 'data', 'intents.json')
    model_path = os.path.join(os.path.dirname(__file__), 'model', 'chatbot_model.pkl')
    
    # Load intents
    with open(intents_path, 'r', encoding='utf-8') as f:
        intents_data = json.load(f)
    
    # Prepare training data
    X, y = [], []
    for intent in intents_data['intents']:
        for pattern in intent['patterns']:
            X.append(preprocess_text(pattern))
            y.append(intent['tag'])
    
    print(f"Training model with {len(X)} samples, {len(set(y))} classes...")
    
    # Train pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=8000, ngram_range=(1, 2), min_df=1, max_df=0.95)),
        ('lr', LogisticRegression(max_iter=1000, C=1.5, random_state=42))
    ])
    pipeline.fit(X, y)
    
    # Save model
    os.makedirs(os.path.dirname(model_path), exist_ok=True)
    with open(model_path, 'wb') as f:
        pickle.dump(pipeline, f)
    
    print(f"Model saved to {model_path}")
    
    # Quick test
    test_queries = ['halo', 'apa obat untuk demam', 'obat batuk', 'efek samping paracetamol']
    print("\nSample predictions:")
    for q in test_queries:
        p = preprocess_text(q)
        intent = pipeline.predict([p])[0]
        conf = max(pipeline.predict_proba([p])[0])
        print(f"  {q!r} -> {intent} ({conf:.3f})")

if __name__ == '__main__':
    train_model()
