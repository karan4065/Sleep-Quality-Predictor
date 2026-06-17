from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load the trained model and preprocessor
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../sleep-ai/model.pkl')
PREPROCESSOR_PATH = os.path.join(os.path.dirname(__file__), '../sleep-ai/preprocessor.pkl')

if not os.path.exists(MODEL_PATH):
    MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model.pkl')
if not os.path.exists(PREPROCESSOR_PATH):
    PREPROCESSOR_PATH = os.path.join(os.path.dirname(__file__), 'preprocessor.pkl')

try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    with open(PREPROCESSOR_PATH, 'rb') as f:
        preprocessor = pickle.load(f)
except FileNotFoundError as e:
    model = None
    preprocessor = None
    print(f"Warning: Models not found at {MODEL_PATH} or {PREPROCESSOR_PATH}.")

def get_suggestions(category):
    suggestions = []
    if category == "Good":
        suggestions.append("Keep up the great work! Your routine is balanced.")
        suggestions.append("Maintain your current physical activity and stress management routines.")
    elif category == "Average":
        suggestions.append("Your sleep quality is okay, but there's room for improvement.")
        suggestions.append("Try reducing screen time before bed or increasing your daily steps.")
        suggestions.append("Consider practicing relaxation techniques to lower stress levels.")
    else:
        suggestions.append("Your sleep quality is low. Consider adjusting your daily habits.")
        suggestions.append("Ensure you're getting at least 7-8 hours of sleep per night.")
        suggestions.append("Monitor your stress and diet, and consider consulting a healthcare professional if poor sleep persists.")
    return suggestions

# Health check route for Hugging Face Spaces
@app.route('/', methods=['GET'])
def health():
    status = "ok" if model is not None else "model_not_loaded"
    return jsonify({"status": status, "service": "Sleep AI Predictor API"})

@app.route('/predict', methods=['POST'])
def predict():
    if model is None or preprocessor is None:
        return jsonify({"error": "Model or preprocessor not loaded on server."}), 500
        
    try:
        data = request.json
        
        # Prepare DataFrame for the preprocessor
        input_df = pd.DataFrame([{
            'Age': float(data.get('age', 25)),
            'Gender': data.get('gender', 'Male'),
            'Occupation': data.get('occupation', 'Software Engineer'),
            'Sleep Duration': float(data.get('sleep_duration', 7.0)),
            'Physical Activity Level': float(data.get('physical_activity', 60)),
            'Stress Level': float(data.get('stress_level', 5)),
            'BMI Category': data.get('bmi_category', 'Normal'),
            'Heart Rate': float(data.get('heart_rate', 70)),
            'Daily Steps': float(data.get('daily_steps', 5000)),
            'Blood Pressure': data.get('blood_pressure', '120/80')
        }])
        
        # Preprocess and Predict
        processed_data = preprocessor.transform(input_df)
        prediction = model.predict(processed_data)[0] # Will be Good, Average, or Poor
        
        category = prediction
        
        # Map category to a score for the UI
        score_map = {"Good": 92, "Average": 65, "Poor": 35}
        score = score_map.get(category, 50)
        
        suggestions = get_suggestions(category)
        
        return jsonify({
            "score": score,
            "category": category,
            "suggestions": suggestions
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    # Default to 7860 for Hugging Face Spaces Docker containers
    port = int(os.environ.get('PORT', 7860))
    app.run(host='0.0.0.0', port=port, debug=False)
