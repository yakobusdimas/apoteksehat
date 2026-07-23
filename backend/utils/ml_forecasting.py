import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
from datetime import datetime, timedelta, timezone
from models import db, Order, OrderItem, Medicine

def get_stock_forecast(days_ahead=30):
    """
    Predicts stock requirements for the next `days_ahead` based on historical sales.
    Uses simple Linear Regression on daily aggregated sales data.
    """
    # 1. Fetch historical sales data
    # Aggregate quantity sold per day per medicine
    query = db.session.query(
        OrderItem.medicine_id,
        Medicine.name,
        Medicine.stock,
        db.func.date(Order.created_at).label('sale_date'),
        db.func.sum(OrderItem.quantity).label('daily_sold')
    ).join(Order, Order.id == OrderItem.order_id) \
     .join(Medicine, Medicine.id == OrderItem.medicine_id) \
     .filter(Order.status != 'cancelled') \
     .group_by(OrderItem.medicine_id, Medicine.name, Medicine.stock, db.func.date(Order.created_at))
    
    data = query.all()
    
    if not data:
        return []
        
    df = pd.DataFrame(data, columns=['medicine_id', 'name', 'current_stock', 'sale_date', 'daily_sold'])
    df['sale_date'] = pd.to_datetime(df['sale_date'])
    
    # We will train a simple model for each medicine
    forecasts = []
    
    for med_id, group in df.groupby('medicine_id'):
        med_name = group['name'].iloc[0]
        current_stock = group['current_stock'].iloc[0]
        
        # Sort by date
        group = group.sort_values('sale_date')
        
        # We need a continuous time series. Let's create a date range from first sale to today
        min_date = group['sale_date'].min()
        max_date = datetime.now(timezone.utc).replace(tzinfo=None) # naive for pandas merge
        
        if (max_date - min_date).days < 3:
            # Not enough data points to do meaningful regression, use simple average
            avg_daily = group['daily_sold'].mean()
            predicted_demand = int(avg_daily * days_ahead)
            forecasts.append({
                'medicine_id': med_id,
                'name': med_name,
                'current_stock': current_stock,
                'predicted_demand': predicted_demand,
                'status': 'Aman' if current_stock >= predicted_demand else 'Kritis',
                'suggestion': f'Perlu restock minimal {predicted_demand - current_stock} unit' if current_stock < predicted_demand else 'Stok cukup'
            })
            continue
            
        # Create full date range
        idx = pd.date_range(min_date, max_date)
        ts = group.set_index('sale_date')['daily_sold']
        ts = ts.reindex(idx, fill_value=0) # Fill missing days with 0 sales
        
        # Prepare for Linear Regression
        # X will be the integer number of days since start
        X = np.arange(len(ts)).reshape(-1, 1)
        y = ts.values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Predict for the next `days_ahead` days
        future_X = np.arange(len(ts), len(ts) + days_ahead).reshape(-1, 1)
        predictions = model.predict(future_X)
        
        # We can't have negative sales
        predictions = np.maximum(predictions, 0)
        
        predicted_demand = int(np.sum(predictions))
        
        forecasts.append({
            'medicine_id': med_id,
            'name': med_name,
            'current_stock': current_stock,
            'predicted_demand': predicted_demand,
            'status': 'Aman' if current_stock >= predicted_demand else 'Kritis',
            'suggestion': f'Perlu restock minimal {predicted_demand - current_stock} unit' if current_stock < predicted_demand else 'Stok cukup'
        })
        
    # Sort forecasts so critical ones are at the top
    forecasts.sort(key=lambda x: (x['status'] == 'Aman', x['current_stock'] - x['predicted_demand']))
    
    return forecasts
