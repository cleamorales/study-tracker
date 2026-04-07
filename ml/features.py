import pandas as pd
import numpy as np

def engineer_features(sessions):
    df = pd.DataFrame(sessions)
    
    if df.empty:
        return df

    df['created_at'] = pd.to_datetime(df['created_at'])
    df['hour_of_day'] = df['created_at'].dt.hour
    df['day_of_week'] = df['created_at'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)

    # rolling averages over last 7 sessions
    df = df.sort_values('created_at')
    df['avg_focus_7'] = df['focus_rating'].rolling(7, min_periods=1).mean()
    df['avg_duration_7'] = df['duration_minutes'].rolling(7, min_periods=1).mean()
    df['session_count_7'] = df['focus_rating'].rolling(7, min_periods=1).count()

    # mood encoding
    mood_map = {
        'great': 5,
        'good': 4,
        'neutral': 3,
        'tired': 2,
        'stressed': 1
    }
    df['mood_score'] = df['mood'].map(mood_map).fillna(3)

    # productivity score (target variable)
    df['productivity_score'] = (
        df['focus_rating'] * 0.5 +
        df['mood_score'] * 0.3 +
        (df['duration_minutes'] / 60).clip(0, 2) * 0.2
    )

    # burnout risk (1 = at risk, 0 = fine)
    df['burnout_risk'] = (
        (df['mood_score'] <= 2) |
        (df['avg_focus_7'] < 2.5) |
        (df['session_count_7'] >= 6)
    ).astype(int)

    # high performance day (1 = high, 0 = low)
    df['high_performance'] = (df['productivity_score'] >= 3.5).astype(int)

    return df

def get_feature_columns():
    return [
        'hour_of_day',
        'day_of_week',
        'is_weekend',
        'avg_focus_7',
        'avg_duration_7',
        'session_count_7',
        'mood_score',
        'duration_minutes',
        'focus_rating'
    ]