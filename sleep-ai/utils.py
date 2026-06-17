import pickle
import streamlit as st
import pandas as pd
import numpy as np

@st.cache_resource
def load_models():
    """
    Loads the pre-trained machine learning model and preprocessor.
    Using @st.cache_resource ensures they are only loaded once, 
    optimizing performance and avoiding retraining/reloading.
    """
    try:
        with open('model.pkl', 'rb') as file:
            model = pickle.load(file)
        with open('preprocessor.pkl', 'rb') as file:
            preprocessor = pickle.load(file)
        return model, preprocessor
    except FileNotFoundError as e:
        return None, None

def predict_sleep_quality(model, preprocessor, data):
    """
    Validates, preprocesses, and predicts sleep quality.
    """
    try:
        # Preprocess the input data
        # Note: data should be a Pandas DataFrame matching the original training columns
        processed_data = preprocessor.transform(data)
        
        # Make prediction
        prediction = model.predict(processed_data)
        
        # Return the first (and only) prediction
        return prediction[0]
    except Exception as e:
        st.error(f"Error during prediction pipeline: {e}")
        return None
