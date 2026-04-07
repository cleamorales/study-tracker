import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, accuracy_score
from features import engineer_features, get_feature_columns
np.random.seed(42)

def generate_synthetic_data(n=500):
    dates = pd.date_range(start='2024-01-01', periods=n, freq='D')
    data = {
        'created_at': dates,
        'duration_minutes': np.random.randint(20, 180, n),
        'focus_rating': np.random.randint(1, 6, n),
        'mood': np.random.choice(['great', 'good', 'neutral', 'tired', 'stressed'], n,
                                  p=[0.15, 0.30, 0.30, 0.15, 0.10]),
    }
    return pd.DataFrame(data)

def train_models():
    print('Generating synthetic training data...')
    df = generate_synthetic_data(500)
    df = engineer_features(df)

    feature_cols = get_feature_columns()
    X = df[feature_cols]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # 1. Productivity score predictor
    y_productivity = df['productivity_score']
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_productivity, test_size=0.2)
    productivity_model = RandomForestRegressor(n_estimators=100)
    productivity_model.fit(X_train, y_train)
    score = mean_squared_error(y_test, productivity_model.predict(X_test))
    print(f'Productivity model MSE: {score:.3f}')

    # 2. Burnout risk predictor
    y_burnout = df['burnout_risk']
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_burnout, test_size=0.2)
    burnout_model = LogisticRegression()
    burnout_model.fit(X_train, y_train)
    score = accuracy_score(y_test, burnout_model.predict(X_test))
    print(f'Burnout model accuracy: {score:.3f}')

    # 3. Focus level predictor
    y_focus = df['focus_rating'].astype(float)
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_focus, test_size=0.2)
    focus_model = RandomForestRegressor(n_estimators=100)
    focus_model.fit(X_train, y_train)
    score = mean_squared_error(y_test, focus_model.predict(X_test))
    print(f'Focus model MSE: {score:.3f}')

    # 4. High vs low performance classifier
    y_performance = df['high_performance']
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_performance, test_size=0.2)
    performance_model = RandomForestClassifier(n_estimators=100)
    performance_model.fit(X_train, y_train)
    score = accuracy_score(y_test, performance_model.predict(X_test))
    print(f'Performance classifier accuracy: {score:.3f}')

    # save all models and scaler
    with open('models/productivity_model.pkl', 'wb') as f:
        pickle.dump(productivity_model, f)
    with open('models/burnout_model.pkl', 'wb') as f:
        pickle.dump(burnout_model, f)
    with open('models/focus_model.pkl', 'wb') as f:
        pickle.dump(focus_model, f)
    with open('models/performance_model.pkl', 'wb') as f:
        pickle.dump(performance_model, f)
    with open('models/scaler.pkl', 'wb') as f:
        pickle.dump(scaler, f)

    print('All models saved to models/ folder!')

if __name__ == '__main__':
    train_models()