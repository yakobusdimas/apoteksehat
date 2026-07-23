import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from models import db, Order, OrderItem, Medicine

def get_collaborative_recommendations(user_id, num_recommendations=5):
    """
    Generate medicine recommendations for a user based on Item-Based Collaborative Filtering.
    """
    # 1. Fetch all order items and their associated users
    # We join OrderItem and Order to get user_id, medicine_id, and quantity
    query = db.session.query(
        Order.user_id,
        OrderItem.medicine_id,
        OrderItem.quantity
    ).join(Order, Order.id == OrderItem.order_id).filter(
        OrderItem.medicine_id.isnot(None)
    )
    
    data = query.all()
    if not data:
        return get_popular_medicines(num_recommendations)
        
    df = pd.DataFrame(data, columns=['user_id', 'medicine_id', 'quantity'])
    
    # Aggregate quantities if a user bought the same medicine multiple times
    user_item_matrix = df.groupby(['user_id', 'medicine_id'])['quantity'].sum().unstack(fill_value=0)
    
    # If the current user has no history, return popular medicines
    if user_id not in user_item_matrix.index:
        return get_popular_medicines(num_recommendations)
        
    # Calculate item-item cosine similarity matrix
    # Transpose to get items as rows
    item_item_sim = cosine_similarity(user_item_matrix.T)
    item_item_sim_df = pd.DataFrame(item_item_sim, index=user_item_matrix.columns, columns=user_item_matrix.columns)
    
    # Get the user's purchase history
    user_history = user_item_matrix.loc[user_id]
    bought_medicines = user_history[user_history > 0].index.tolist()
    
    if not bought_medicines:
        return get_popular_medicines(num_recommendations)
        
    # Calculate weighted recommendation scores
    scores = pd.Series(dtype=float)
    for med_id in bought_medicines:
        # Get similarities of this medicine with all others, weighted by how much the user bought it
        sim_scores = item_item_sim_df[med_id] * user_history[med_id]
        scores = scores.add(sim_scores, fill_value=0)
        
    # Remove medicines the user has already bought (optional, but usually good for discovering new ones)
    scores = scores.drop(bought_medicines, errors='ignore')
    
    # Sort and get top N
    recommended_med_ids = scores.sort_values(ascending=False).head(num_recommendations).index.tolist()
    
    if not recommended_med_ids:
        # Fallback if no new recommendations can be made
        return get_popular_medicines(num_recommendations)
        
    # Fetch medicine details
    medicines = Medicine.query.filter(Medicine.id.in_(recommended_med_ids)).all()
    # Sort them according to the recommended order
    med_dict = {med.id: med for med in medicines}
    
    result = [med_dict[med_id].to_dict() for med_id in recommended_med_ids if med_id in med_dict]
    return result

def get_popular_medicines(num_recommendations=5):
    """Fallback: Return the most popular medicines based on total sold."""
    query = db.session.query(
        OrderItem.medicine_id, 
        db.func.sum(OrderItem.quantity).label('total_sold')
    ).group_by(OrderItem.medicine_id).order_by(db.desc('total_sold')).limit(num_recommendations)
    
    popular_ids = [row.medicine_id for row in query.all() if row.medicine_id is not None]
    
    if not popular_ids:
        # Extreme fallback: just return random/first 5 medicines
        medicines = Medicine.query.limit(num_recommendations).all()
        return [med.to_dict() for med in medicines]
        
    medicines = Medicine.query.filter(Medicine.id.in_(popular_ids)).all()
    med_dict = {med.id: med for med in medicines}
    return [med_dict[med_id].to_dict() for med_id in popular_ids if med_id in med_dict]
