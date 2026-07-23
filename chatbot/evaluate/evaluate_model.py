#!/usr/bin/env python3
"""
Script Evaluasi Model Chatbot
Menguji akurasi model dengan test cases dan menghasilkan laporan
"""

import json
import pickle
import re
import os
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import numpy as np

# Resolve paths relative to script location
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(SCRIPT_DIR, '../../model_training/model/chatbot_model.pkl')
TEST_CASES_PATH = os.path.join(SCRIPT_DIR, 'test_cases.json')

def preprocess_text(text):
    """Preprocess text (same as training)"""
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = ' '.join(text.split())
    return text

def load_model():
    """Load trained model"""
    print("[*] Loading model...")
    try:
        with open(MODEL_PATH, 'rb') as f:
            model = pickle.load(f)
        print("[OK] Model loaded")
        return model
    except FileNotFoundError:
        print(f"[!] Error: Model file not found at {MODEL_PATH}")
        print("    Please ensure the model is trained and the path is correct.")
        exit(1)

def load_test_cases():
    """Load test cases"""
    print("[*] Loading test cases...")
    try:
        with open(TEST_CASES_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"[OK] {len(data['test_cases'])} test cases loaded")
        return data['test_cases']
    except FileNotFoundError:
        print(f"[!] Error: Test cases file not found at {TEST_CASES_PATH}")
        exit(1)

def evaluate_model(model, test_cases):
    """Evaluate model with test cases"""
    print("\n" + "="*60)
    print("         EVALUASI MODEL CHATBOT")
    print("="*60 + "\n")
    
    results = []
    y_true = []
    y_pred = []
    confidences = []
    
    passed = 0
    failed = 0
    
    for test in test_cases:
        query = test['query']
        expected_intent = test['expected_intent']
        min_confidence = test['min_confidence']
        
        # Preprocess and predict
        processed = preprocess_text(query)
        predicted_intent = model.predict([processed])[0]
        probabilities = model.predict_proba([processed])[0]
        confidence = max(probabilities)
        
        # Check if correct
        is_correct = predicted_intent == expected_intent
        meets_confidence = confidence >= min_confidence
        test_passed = is_correct and meets_confidence
        
        if test_passed:
            passed += 1
            status = "[PASS]"
        else:
            failed += 1
            status = "[FAIL]"
        
        results.append({
            'id': test['id'],
            'query': query,
            'expected': expected_intent,
            'predicted': predicted_intent,
            'confidence': confidence,
            'passed': test_passed
        })
        
        y_true.append(expected_intent)
        y_pred.append(predicted_intent)
        confidences.append(confidence)
        
        # Print individual result
        print(f"{status} Test #{test['id']:02d}: {query}")
        print(f"      Expected: {expected_intent} | Predicted: {predicted_intent} | Confidence: {confidence:.4f}")
        if not test_passed:
            if not is_correct:
                print(f"      -> Intent mismatch!")
            if not meets_confidence:
                print(f"      -> Low confidence (< {min_confidence})!")
        print()
    
    # Calculate overall metrics
    accuracy = accuracy_score(y_true, y_pred)
    avg_confidence = np.mean(confidences)
    
    print("="*60)
    print("         HASIL EVALUASI")
    print("="*60)
    print(f"Total Test Cases: {len(test_cases)}")
    print(f"Passed: {passed} ({passed/len(test_cases)*100:.1f}%)")
    print(f"Failed: {failed} ({failed/len(test_cases)*100:.1f}%)")
    print(f"\nAccuracy: {accuracy:.4f} ({accuracy*100:.1f}%)")
    print(f"Average Confidence: {avg_confidence:.4f}")
    
    # Check if meets requirement
    if accuracy >= 0.9:
        print("\n[OK] Model MEMENUHI target akurasi >= 0.9")
    else:
        print(f"\n[!] Model BELUM MEMENUHI target akurasi >= 0.9")
        print(f"    Current: {accuracy:.4f}, Target: 0.9000")
    
    # Detailed classification report
    print("\n" + "="*60)
    print("         CLASSIFICATION REPORT")
    print("="*60)
    print(classification_report(y_true, y_pred, zero_division=0))
    
    # Confusion matrix
    print("="*60)
    print("         CONFUSION MATRIX")
    print("="*60)
    cm = confusion_matrix(y_true, y_pred, labels=list(set(y_true + y_pred)))
    print(cm)
    
    # Save results
    with open('evaluation_results.json', 'w', encoding='utf-8') as f:
        json.dump({
            'summary': {
                'total_tests': len(test_cases),
                'passed': passed,
                'failed': failed,
                'accuracy': float(accuracy),
                'avg_confidence': float(avg_confidence),
                'meets_requirement': bool(accuracy >= 0.9)
            },
            'results': [{
                'id': r['id'],
                'query': r['query'],
                'expected': r['expected'],
                'predicted': r['predicted'],
                'confidence': float(r['confidence']),
                'passed': bool(r['passed'])
            } for r in results]
        }, f, ensure_ascii=False, indent=2)
    
    print("\n[OK] Results saved to evaluation_results.json")
    print("="*60)
    
    return accuracy, results

def main():
    # Load model and test cases
    model = load_model()
    test_cases = load_test_cases()
    
    # Evaluate
    accuracy, results = evaluate_model(model, test_cases)
    
    print("\n[OK] Evaluation complete!")

if __name__ == '__main__':
    main()
