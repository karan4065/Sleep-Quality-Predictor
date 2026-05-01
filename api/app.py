from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../ml/sleep_model.pkl')
try:
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
except FileNotFoundError:
    model = None
    print(f"Warning: Model not found at {MODEL_PATH}. Please train the model first.")

def get_category_and_suggestions(score, screen_time, sleep_time, activity):
    suggestions = []
    
    if score >= 75:
        category = "Good"
        suggestions.append("Keep up the great work! Your routine is balanced.")
    elif score >= 50:
        category = "Average"
        suggestions.append("Your sleep quality is okay, but there's room for improvement.")
    else:
        category = "Poor"
        suggestions.append("Your sleep quality is low. Consider adjusting your daily habits.")
        
    if sleep_time < 7:
        suggestions.append("Try to get at least 7-8 hours of sleep per night.")
    if screen_time > 4:
        suggestions.append("Reduce screen time, especially before bed, to improve sleep.")
    if activity < 30:
        suggestions.append("Incorporate at least 30 minutes of physical activity into your day.")
        
    return category, suggestions

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server."}), 500
        
    try:
        data = request.json
        screen_time = float(data.get('screen_time', 0))
        sleep_time = float(data.get('sleep_time', 0))
        activity = float(data.get('physical_activity', 0))
        
        # Make prediction
        prediction = model.predict([[screen_time, sleep_time, activity]])
        score = max(0, min(100, round(prediction[0])))
        
        category, suggestions = get_category_and_suggestions(score, screen_time, sleep_time, activity)
        
        return jsonify({
            "score": score,
            "category": category,
            "suggestions": suggestions
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)
