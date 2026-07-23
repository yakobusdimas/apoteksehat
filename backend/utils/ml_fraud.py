import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np
from models import db, Order, OrderItem

def check_order_fraud(total_amount, total_items, user_id=None):
    """
    Checks if a new order is potentially fraudulent using Isolation Forest.
    If there is not enough historical data, relies on simple threshold rules.
    """
    # 1. Fetch historical orders
    # We aggregate total amount and item count per order
    query = db.session.query(
        Order.id,
        Order.total.label('total_amount'),
        db.func.sum(OrderItem.quantity).label('total_items')
    ).join(OrderItem, Order.id == OrderItem.order_id).group_by(Order.id, Order.total)
    
    data = query.all()
    
    # Simple rule-based fallback if we have very few historical orders (< 10)
    if len(data) < 10:
        if total_items > 50 or total_amount > 5000000:
            return True, "Jumlah item atau total harga melebihi batas wajar (Rule-based)"
        return False, "Normal (Rule-based)"
        
    df = pd.DataFrame(data, columns=['order_id', 'total_amount', 'total_items'])
    
    # 2. Train Isolation Forest
    # Contamination is the expected proportion of outliers. We set it to 1% (0.01)
    X = df[['total_amount', 'total_items']].values
    
    model = IsolationForest(contamination=0.01, random_state=42)
    model.fit(X)
    
    # 3. Predict the new order
    # Predict returns 1 for inliers (normal) and -1 for outliers (fraud)
    new_order_data = np.array([[float(total_amount), int(total_items)]])
    prediction = model.predict(new_order_data)
    
    is_fraud = bool(prediction[0] == -1)
    
    # Let's also check if it's way beyond the max historical just to be safe
    # Because Isolation forest might sometimes not flag edge cases if training size is small
    max_hist_items = df['total_items'].max()
    max_hist_amount = df['total_amount'].max()
    
    reason = "Normal"
    if is_fraud:
        reason = "Terdeteksi anomali oleh AI (Isolation Forest)"
        
    # Hybrid rule: if it's 3x larger than anything we've ever seen, flag it anyway
    if total_items > max_hist_items * 3 or total_amount > max_hist_amount * 3:
        is_fraud = True
        reason = "Terdeteksi anomali ekstrim (Hybrid AI-Rule)"
        
    return is_fraud, reason
