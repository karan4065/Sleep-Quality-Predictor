# Sleep Quality Predictor 🌙

A full-stack Machine Learning project that predicts your sleep quality based on your screen time, sleep time, and physical activity. It also provides personalized suggestions for improvement.

## 📂 Project Structure

```text
Sleep.ai/
├── api/                  # Python Flask API to serve the ML model
│   ├── app.py            # Flask server & /predict route
│   └── requirements.txt  # Python dependencies
├── backend/              # Node.js/Express backend
│   ├── models/           # Mongoose schemas (History.js)
│   ├── index.js          # Express server & API routes
│   ├── .env              # Environment variables
│   └── package.json      # Node dependencies
├── frontend/             # React (Vite) frontend application
│   ├── src/
│   │   ├── App.jsx       # Main application component & form
│   │   ├── index.css     # Premium dark-mode styling
│   │   └── main.jsx      # React entry point
│   ├── index.html        # HTML template
│   └── package.json      # React dependencies
├── ml/                   # Machine Learning scripts
│   ├── dataset_generator.py # Generates synthetic sleep data
│   ├── train.py          # Trains the Linear Regression model
│   └── sleep_model.pkl   # Saved model (Generated after training)
└── README.md             # This documentation
```

## 🚀 Setup & Installation Guide

### Prerequisites
Make sure you have installed:
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (running locally or MongoDB Atlas URI)

### 1. Machine Learning Setup
First, generate the dataset and train the model:
```bash
cd Sleep.ai/ml
pip install -r ../api/requirements.txt
python dataset_generator.py  # Generates sleep_data.csv (600 rows)
python train.py              # Trains model and saves sleep_model.pkl
```

### 2. Python Flask API
The Flask API loads the model and exposes the `/predict` endpoint.
```bash
cd Sleep.ai/api
# Make sure dependencies are installed: pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### 3. Node.js Backend
The Express backend connects to MongoDB, calls the Flask API, and stores history.
```bash
cd Sleep.ai/backend
npm install
# Make sure MongoDB is running, or update MONGODB_URI in backend/.env
npm run dev
# Runs on http://localhost:3001
```

### 4. React Frontend
The Vite + React frontend provides a beautiful, dynamic UI.
```bash
cd Sleep.ai/frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## ☁️ Deployment Guide

### A. Deploying Python API (Flask) on Render
1. Go to [Render.com](https://render.com) and create a new **Web Service**.
2. Connect your GitHub repository.
3. Set Root Directory to `api/` (or copy ml/ files inside api/ for simplicity).
4. Environment: `Python`
5. Build Command: `pip install -r requirements.txt`
6. Start Command: `gunicorn app:app` (You may need to add `gunicorn` to requirements.txt).

### B. Deploying Node.js Backend on Render or Railway
1. Create a new Web Service.
2. Root Directory: `backend/`
3. Environment: `Node`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. **Important Variables:** Add `MONGODB_URI` (from MongoDB Atlas) and `FLASK_API_URL` (URL from step A).

### C. Deploying React Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and create a new project.
2. Connect your GitHub repo.
3. Root Directory: `frontend/`
4. Framework Preset: `Vite`
5. Add an environment variable in frontend if you dynamically set backend URL (e.g., `VITE_API_URL=https://your-node-backend.onrender.com/api`).
6. Click **Deploy**.

## ✨ Features
- **Predictive ML:** Uses Scikit-learn Linear Regression.
- **Smart Analytics:** Automatically scores your sleep 0-100 and classifies as Good, Average, or Poor.
- **Actionable Insights:** Suggests recommendations based on the actual inputs.
- **Progress Tracking:** Saves your results to MongoDB and visualizes trends using Chart.js.
- **Premium UI:** Glassmorphism design with responsive grid layouts.
