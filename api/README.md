---
title: Sleep AI Predictor API
emoji: 🌙
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
short_description: Flask REST API for sleep quality prediction using ML
---

# Sleep AI Predictor — Flask API

A production-ready REST API that predicts sleep quality (Good / Average / Poor) using a trained scikit-learn model.

## API Endpoint

### `POST /predict`

**Request Body (JSON):**

```json
{
  "age": 28,
  "gender": "Male",
  "occupation": "Software Engineer",
  "sleep_duration": 7.0,
  "physical_activity": 60,
  "stress_level": 5,
  "bmi_category": "Normal",
  "heart_rate": 70,
  "daily_steps": 8000,
  "blood_pressure": "120/80"
}
```

**Response (JSON):**

```json
{
  "score": 92,
  "category": "Good",
  "suggestions": ["Keep up the great work! Your routine is balanced."]
}
```

### `GET /` (Health Check)

Returns `200 OK` with a simple status message.
