import json
import os

cells = []

def add_markdown(text):
    cells.append({
        "cell_type": "markdown",
        "metadata": {},
        "source": [text]
    })

def add_code(text):
    cells.append({
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [text]
    })

add_markdown("# Chatbot Model Training Experiments 🤖\n\nNotebook ini bertujuan untuk mengeksplorasi data `intents.json`, melakukan pemrosesan teks, serta melatih dan membandingkan beberapa model Machine Learning untuk klasifikasi NLP.")

add_markdown("## 0. Install Dependencies\\nJalankan cell ini jika library belum ter-install di environment Anda.")
add_code("!pip install pandas matplotlib seaborn scikit-learn Sastrawi")

add_markdown("## 1. Import Libraries")
add_code("""import json
import os
import re
import pickle
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score

try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    stemmer = StemmerFactory().create_stemmer()
    print("Sastrawi loaded successfully!")
except ImportError:
    print("Sastrawi not installed. Run !pip install Sastrawi")
    stemmer = None
""")

add_markdown("## 2. Load Data (intents.json)")
add_code("""# Load data
intents_path = os.path.join('data', 'intents.json')

with open(intents_path, 'r', encoding='utf-8') as f:
    intents_data = json.load(f)

print(f"Loaded {len(intents_data['intents'])} intents.")

# Extract to list
data = []
for intent in intents_data['intents']:
    tag = intent['tag']
    for pattern in intent['patterns']:
        data.append({'text': pattern, 'intent': tag})

df = pd.DataFrame(data)
display(df.head())
""")

add_markdown("## 3. Exploratory Data Analysis (EDA)")
add_code("""# Check intent distribution
plt.figure(figsize=(12, 6))
sns.countplot(y='intent', data=df, order=df['intent'].value_counts().index)
plt.title('Distribusi Data per Intent')
plt.xlabel('Jumlah Contoh Kalimat (Patterns)')
plt.ylabel('Intent')
plt.tight_layout()
plt.show()
""")

add_markdown("## 4. Text Preprocessing")
add_code("""def preprocess_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9\\s]', '', text)
    if stemmer:
        return stemmer.stem(' '.join(text.split()))
    return ' '.join(text.split())

# Apply preprocessing
df['clean_text'] = df['text'].apply(preprocess_text)
display(df[['text', 'clean_text', 'intent']].head())
""")

add_markdown("## 5. Train / Test Split")
add_code("""X = df['clean_text']
y = df['intent']

# Split 80:20 (stratify to keep class distribution balanced if possible)
try:
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
except ValueError:
    # Fallback if some classes have only 1 sample
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples:  {len(X_test)}")
""")

add_markdown("## 6. Model Definition & Comparison\n\nKita mendefinisikan 4 model algoritma:")
add_code("""models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
    'SVM (Linear)': SVC(kernel='linear', C=1.5, probability=True, random_state=42),
    'Naive Bayes': MultinomialNB()
}

results = []

for name, model in models.items():
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=8000, ngram_range=(1, 2))),
        ('clf', model)
    ])
    
    # Train
    pipeline.fit(X_train, y_train)
    
    # Predict
    y_pred = pipeline.predict(X_test)
    
    # Evaluate
    acc = accuracy_score(y_test, y_pred)
    results.append({'Model': name, 'Accuracy': acc})
    
    print(f"--- {name} ---")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("\\n")

results_df = pd.DataFrame(results).sort_values(by='Accuracy', ascending=False)
display(results_df)
""")

add_markdown("## 7. Evaluasi Model Terbaik (Confusion Matrix)")
add_code("""best_model_name = results_df.iloc[0]['Model']
best_model = models[best_model_name]

best_pipeline = Pipeline([
    ('tfidf', TfidfVectorizer(max_features=8000, ngram_range=(1, 2))),
    ('clf', best_model)
])

best_pipeline.fit(X_train, y_train)
y_pred_best = best_pipeline.predict(X_test)

# Plot Confusion Matrix
cm = confusion_matrix(y_test, y_pred_best)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=False, cmap='Blues')
plt.title(f'Confusion Matrix - {best_model_name}')
plt.ylabel('True Label')
plt.xlabel('Predicted Label')
plt.show()
""")

add_markdown("## 8. Export Model ke `chatbot_model.pkl`\n\nSetelah menemukan algoritma yang paling optimal, kita simpan kembali *pipeline* modelnya untuk digunakan oleh backend API.")
add_code("""model_path = os.path.join('model', 'chatbot_model.pkl')
os.makedirs(os.path.dirname(model_path), exist_ok=True)

# Train on all data for production
best_pipeline.fit(X, y)

with open(model_path, 'wb') as f:
    pickle.dump(best_pipeline, f)

print(f"✅ Model {best_model_name} berhasil disimpan ke {model_path}!")

# Test predict
test_texts = ['obat pusing apa', 'kaki saya luka', 'lambung perih dan mual']
for t in test_texts:
    p = preprocess_text(t)
    pred = best_pipeline.predict([p])[0]
    prob = max(best_pipeline.predict_proba([p])[0]) if hasattr(best_pipeline, "predict_proba") else 0.0
    print(f"'{t}' -> {pred} ({prob:.2f})")
""")

notebook = {
    "cells": cells,
    "metadata": {
        "kernelspec": {
            "display_name": "Python 3",
            "language": "python",
            "name": "python3"
        },
        "language_info": {
            "name": "python",
            "version": "3.12"
        }
    },
    "nbformat": 4,
    "nbformat_minor": 4
}

out_path = os.path.join('c:\\\\Users\\\\yakob\\\\OneDrive\\\\Documents\\\\APOTEK\\\\model_training', 'training_experiments.ipynb')
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(notebook, f, indent=2)

print(f"Notebook generated at: {out_path}")
