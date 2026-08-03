"""
Script untuk menjalankan eksperimen training_experiments.ipynb
Membandingkan: Logistic Regression, SVM, Random Forest, Naive Bayes
Metrik: Accuracy, Precision, Recall, F1-Score
"""

import json
import os
import re
import pickle
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    stemmer = StemmerFactory().create_stemmer()
    print("[OK] Sastrawi loaded successfully!")
except ImportError:
    print("[WARN] Sastrawi not installed, skipping stemming.")
    stemmer = None

# ── 1. Load Data ──────────────────────────────────────────────────────────────
script_dir = os.path.dirname(os.path.abspath(__file__))
intents_path = os.path.join(script_dir, 'data', 'intents.json')

with open(intents_path, 'r', encoding='utf-8') as f:
    intents_data = json.load(f)

print(f"\n[FILE] Loaded {len(intents_data['intents'])} intents.\n")

data = []
for intent in intents_data['intents']:
    tag = intent['tag']
    for pattern in intent['patterns']:
        data.append({'text': pattern, 'intent': tag})

df = pd.DataFrame(data)
print(f"Total samples: {len(df)}")
print(f"Total classes: {df['intent'].nunique()}\n")

# ── 2. Text Preprocessing ────────────────────────────────────────────────────
def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    if stemmer:
        return stemmer.stem(' '.join(text.split()))
    return ' '.join(text.split())

df['clean_text'] = df['text'].apply(preprocess_text)

# ── 3. Train / Test Split ─────────────────────────────────────────────────────
X = df['clean_text']
y = df['intent']

try:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
except ValueError:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

print(f"Training samples : {len(X_train)}")
print(f"Testing  samples : {len(X_test)}\n")

# ── 4. Model Definition & Comparison ─────────────────────────────────────────
models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Random Forest':       RandomForestClassifier(n_estimators=100, random_state=42),
    'SVM (Linear)':        SVC(kernel='linear', C=1.5, probability=True, random_state=42),
    'Naive Bayes':         MultinomialNB()
}

results = []
separator = "=" * 65

print(separator)
print("  PERBANDINGAN ALGORITMA ML")
print(separator)

for name, model in models.items():
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=8000, ngram_range=(1, 2))),
        ('clf', model)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(
        y_test, y_pred, average='weighted', zero_division=0
    )

    results.append({
        'Model': name,
        'Accuracy':  round(acc * 100, 2),
        'Precision': round(prec * 100, 2),
        'Recall':    round(rec * 100, 2),
        'F1-Score':  round(f1 * 100, 2),
    })

    print(f"\n--- {name} ---")
    print(classification_report(y_test, y_pred, zero_division=0))

# ── 5. Hasil Ringkasan ────────────────────────────────────────────────────────
results_df = pd.DataFrame(results).sort_values(by='Accuracy', ascending=False).reset_index(drop=True)

print(separator)
print("  HASIL RINGKASAN (%) – diurutkan dari Accuracy tertinggi")
print(separator)
print(results_df.to_string(index=False))
print(separator)

best = results_df.iloc[0]
print(f"\n[BEST] ALGORITMA TERBAIK  : {best['Model']}")
print(f"   Accuracy  : {best['Accuracy']}%")
print(f"   Precision : {best['Precision']}%")
print(f"   Recall    : {best['Recall']}%")
print(f"   F1-Score  : {best['F1-Score']}%")
print()
