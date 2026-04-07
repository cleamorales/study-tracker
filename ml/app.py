from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd
from features import engineer_features, get_feature_columns

app = Flask(__name__)
CORS(app)

# load all models
with open('models/productivity_model.pkl', 'rb') as f:
    productivity_model = pickle.load(f)
with open('models/burnout_model.pkl', 'rb') as f:
    burnout_model = pickle.load(f)
with open('models/focus_model.pkl', 'rb') as f:
    focus_model = pickle.load(f)
with open('models/performance_model.pkl', 'rb') as f:
    performance_model = pickle.load(f)
with open('models/scaler.pkl', 'rb') as f:
    scaler = pickle.load(f)

@app.route('/')
def index():
    return jsonify({ 'message': 'ML API is running' })

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    sessions = data.get('sessions', [])

    if len(sessions) == 0:
        return jsonify({ 'error': 'No sessions provided' }), 400

    try:
        df = engineer_features(sessions)
        feature_cols = get_feature_columns()
        X = df[feature_cols].tail(1)
        X_scaled = scaler.transform(X)

        productivity = productivity_model.predict(X_scaled)[0]
        burnout = burnout_model.predict(X_scaled)[0]
        focus = focus_model.predict(X_scaled)[0]
        performance = performance_model.predict(X_scaled)[0]

        return jsonify({
            'productivity_score': round(float(productivity), 2),
            'burnout_risk': int(burnout),
            'predicted_focus': round(float(focus), 2),
            'high_performance': int(performance)
        })

    except Exception as e:
        return jsonify({ 'error': str(e) }), 500

@app.route('/health')
def health():
    return jsonify({ 'status': 'ok' })

if __name__ == '__main__':
    app.run(port=5001, debug=True)