#!/usr/bin/env python3
"""
NLP Training Script untuk Chatbot Apotek
Menggunakan TF-IDF + SVM untuk klasifikasi intent dengan akurasi minimum 0.9
"""

import json
import pickle
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.pipeline import Pipeline
import warnings
warnings.filterwarnings('ignore')

# Sastrawi untuk stemming Bahasa Indonesia
try:
    from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
    stemmer = StemmerFactory().create_stemmer()
    SASTRAWI_AVAILABLE = True
except ImportError:
    print("[!] Sastrawi tidak terinstall. Install dengan: pip install Sastrawi")
    SASTRAWI_AVAILABLE = False
    stemmer = None


class IndonesianChatbotNLP:
    def __init__(self):
        self.intents = None
        self.medicines = None
        self.synonyms = None
        self.pipeline = None
        self.intent_labels = []
        self.min_confidence = 0.9
        
    def load_data(self):
        """Load intents, medicines, and synonyms data"""
        print("[*] Memuat data...")
        
        # Load intents
        with open('../data/intents.json', 'r', encoding='utf-8') as f:
            self.intents = json.load(f)['intents']
        
        # Load medicines
        with open('../data/medicines_primary.json', 'r', encoding='utf-8') as f:
            self.medicines = json.load(f)['medicines']
        
        # Load synonyms
        with open('../data/synonyms_id.json', 'r', encoding='utf-8') as f:
            self.synonyms = json.load(f)
        
        print(f"  - {len(self.intents)} intents loaded")
        print(f"  - {len(self.medicines)} medicines loaded")
    
    def preprocess_text(self, text):
        """Preprocess Indonesian text"""
        # Lowercase
        text = text.lower()
        
        # Remove special characters
        text = re.sub(r'[^a-z0-9\s]', '', text)
        
        # Remove extra spaces
        text = ' '.join(text.split())
        
        # Stemming (if Sastrawi available)
        if SASTRAWI_AVAILABLE and stemmer:
            text = stemmer.stem(text)
        
        # Remove custom stopwords
        stopwords = set(self.synonyms.get('stopwords_custom', []))
        words = [w for w in text.split() if w not in stopwords]
        text = ' '.join(words)
        
        return text
    
    def expand_patterns_with_synonyms(self):
        """Expand intent patterns with synonyms"""
        expanded_intents = []
        
        for intent in self.intents:
            expanded_patterns = []
            for pattern in intent['patterns']:
                expanded_patterns.append(pattern)
                
                # Replace placeholders with actual terms
                if '{penyakit}' in pattern:
                    for disease, syns in self.synonyms['penyakit_synonyms'].items():
                        for syn in syns:
                            expanded_patterns.append(pattern.replace('{penyakit}', syn))
                
                if '{obat}' in pattern:
                    # Add medicine names
                    for med in self.medicines[:50]:  # Use subset for training
                        med_name = med['name'].lower()
                        expanded_patterns.append(pattern.replace('{obat}', med_name))
            
            expanded_intents.append({
                'tag': intent['tag'],
                'patterns': expanded_patterns,
                'responses': intent['responses']
            })
        
        return expanded_intents
    
    def prepare_training_data(self):
        """Prepare training data from intents"""
        print("[*] Menyiapkan training data...")
        
        expanded_intents = self.expand_patterns_with_synonyms()
        
        X = []
        y = []
        
        for intent in expanded_intents:
            tag = intent['tag']
            for pattern in intent['patterns']:
                processed = self.preprocess_text(pattern)
                X.append(processed)
                y.append(tag)
        
        print(f"  - Total training samples: {len(X)}")
        print(f"  - Unique intents: {len(set(y))}")
        
        return X, y
    
    def train_model(self, X, y):
        """Train SVM model with TF-IDF"""
        print("[*] Melatih model NLP...")
        
        # Create pipeline: TF-IDF -> SVM
        self.pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(
                max_features=1000,
                ngram_range=(1, 2),  # Unigram + Bigram
                min_df=1,
                max_df=0.8
            )),
            ('svm', SVC(
                kernel='linear',
                C=1.0,
                probability=True,  # Enable probability for confidence scores
                random_state=42
            ))
        ])
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train model
        self.pipeline.fit(X_train, y_train)
        
        # Evaluate on test set
        y_pred = self.pipeline.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\n[*] Test Set Accuracy: {accuracy:.4f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.pipeline, X, y, cv=5, scoring='accuracy')
        print(f"[*] Cross-Validation Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Check if meets minimum accuracy requirement
        if cv_scores.mean() >= self.min_confidence:
            print(f"[OK] Model memenuhi target akurasi >= {self.min_confidence}")
        else:
            print(f"[!] WARNING: Model belum mencapai target akurasi {self.min_confidence}")
            print(f"    Current: {cv_scores.mean():.4f}, Target: {self.min_confidence}")
        
        # Classification report
        print("\n[*] Classification Report:")
        print(classification_report(y_test, y_pred))
        
        return accuracy, cv_scores.mean()
    
    def save_model(self):
        """Save trained model and metadata"""
        print("[*] Menyimpan model...")
        
        # Save pipeline
        with open('chatbot_model.pkl', 'wb') as f:
            pickle.dump(self.pipeline, f)
        
        # Save metadata
        metadata = {
            'intents': [intent['tag'] for intent in self.intents],
            'min_confidence': self.min_confidence,
            'model_type': 'TF-IDF + SVM',
            'features': 'unigram + bigram'
        }
        
        with open('model_metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        print("[OK] Model berhasil disimpan:")
        print("  - chatbot_model.pkl")
        print("  - model_metadata.json")
    
    def test_predictions(self):
        """Test model with sample queries"""
        print("\n[*] Testing model dengan sample queries...")
        
        test_queries = [
            "obat untuk sakit kepala",
            "efek samping paracetamol",
            "ada ibuprofen?",
            "halo",
            "terima kasih",
            "berapa dosis amoxicillin",
            "jam buka apotek"
        ]
        
        for query in test_queries:
            processed = self.preprocess_text(query)
            predicted_intent = self.pipeline.predict([processed])[0]
            probabilities = self.pipeline.predict_proba([processed])[0]
            confidence = max(probabilities)
            
            print(f"\nQuery: '{query}'")
            print(f"  -> Intent: {predicted_intent}")
            print(f"  -> Confidence: {confidence:.4f}")


def main():
    print("="*60)
    print("      CHATBOT NLP TRAINING - APOTEK")
    print("="*60)
    print()
    
    # Initialize
    chatbot = IndonesianChatbotNLP()
    
    # Load data
    chatbot.load_data()
    
    # Prepare training data
    X, y = chatbot.prepare_training_data()
    
    # Train model
    accuracy, cv_accuracy = chatbot.train_model(X, y)
    
    # Save model
    chatbot.save_model()
    
    # Test predictions
    chatbot.test_predictions()
    
    print("\n" + "="*60)
    print("[OK] Training selesai!")
    print("="*60)


if __name__ == '__main__':
    main()
