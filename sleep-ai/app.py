import streamlit as st
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from utils import load_models, predict_sleep_quality

# Page configuration
st.set_page_config(
    page_title="Sleep.ai Predictor",
    page_icon="🌙",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load cached models
model, preprocessor = load_models()

# --- Sidebar Navigation ---
st.sidebar.title("Navigation")
page = st.sidebar.radio("Go to", ["Home", "Sleep Predictor", "About Project"])

st.sidebar.markdown("---")
st.sidebar.info("🌙 **Sleep.ai**\n\nAI-powered sleep quality prediction app.")

# --- Home Page ---
if page == "Home":
    st.title("🌙 Welcome to Sleep.ai")
    st.markdown("### Predict your sleep quality based on health and lifestyle factors.")
    st.write("Good sleep is essential for your physical and mental well-being. Using advanced Machine Learning, **Sleep.ai** analyzes your daily habits to predict the quality of your sleep.")
    
    st.info("👈 Navigate to the **Sleep Predictor** page from the sidebar to get started.")
    
    st.divider()
    
    st.subheader("Why Track Your Sleep?")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("🧠 **Cognitive Function**\n\nImproves memory, focus, and decision making.")
    with col2:
        st.markdown("❤️ **Physical Health**\n\nReduces the risk of heart disease and boosts immunity.")
    with col3:
        st.markdown("😊 **Mental Well-being**\n\nLowers stress, anxiety, and improves overall mood.")

# --- Sleep Predictor Page ---
elif page == "Sleep Predictor":
    st.title("🛌 Sleep Quality Predictor")
    
    # Check if models loaded successfully
    if model is None or preprocessor is None:
        st.error("⚠️ Model or preprocessor not found!")
        st.write("Please ensure `model.pkl` and `preprocessor.pkl` are in the same directory as `app.py`.")
        st.stop()
        
    st.write("Fill in your details below. The model will analyze your inputs and predict whether your sleep quality is Good, Average, or Poor.")
    
    # Input Form
    with st.form("prediction_form"):
        st.subheader("Your Details")
        
        col1, col2 = st.columns(2)
        
        with col1:
            age = st.number_input("1. Age", min_value=10, max_value=100, value=25)
            gender = st.selectbox("2. Gender", ["Male", "Female", "Other"])
            occupation = st.selectbox("3. Occupation", ["Software Engineer", "Doctor", "Sales Representative", "Teacher", "Nurse", "Engineer", "Accountant", "Scientist", "Lawyer", "Salesperson", "Manager", "Other"])
            sleep_duration = st.number_input("4. Sleep Duration (hours)", min_value=2.0, max_value=14.0, value=7.0, step=0.1)
            physical_activity = st.number_input("5. Physical Activity Level (mins/day)", min_value=0, max_value=300, value=60)
            
        with col2:
            stress_level = st.slider("6. Stress Level (1-10)", min_value=1, max_value=10, value=5)
            bmi_category = st.selectbox("7. BMI Category", ["Underweight", "Normal", "Overweight", "Obese"])
            heart_rate = st.number_input("8. Heart Rate (bpm)", min_value=40, max_value=150, value=70)
            daily_steps = st.number_input("9. Daily Steps", min_value=0, max_value=50000, value=5000)
            blood_pressure = st.text_input("10. Blood Pressure (e.g., 120/80)", value="120/80")
            
        submitted = st.form_submit_button("Predict Sleep Quality", type="primary", use_container_width=True)

    if submitted:
        # Input Validation
        if not blood_pressure or '/' not in blood_pressure:
            st.error("Please enter a valid Blood Pressure format (e.g., 120/80).")
        else:
            with st.spinner("Analyzing your profile..."):
                # Prepare data
                input_df = pd.DataFrame({
                    'Age': [age],
                    'Gender': [gender],
                    'Occupation': [occupation],
                    'Sleep Duration': [sleep_duration],
                    'Physical Activity Level': [physical_activity],
                    'Stress Level': [stress_level],
                    'BMI Category': [bmi_category],
                    'Heart Rate': [heart_rate],
                    'Daily Steps': [daily_steps],
                    'Blood Pressure': [blood_pressure]
                })
                
                # Predict
                prediction = predict_sleep_quality(model, preprocessor, input_df)
                
            if prediction is not None:
                st.divider()
                st.subheader("Results")
                
                # Normalize prediction output to handle different string/numeric targets
                pred_str = str(prediction).lower()
                
                # Logic to display result clearly
                if "good" in pred_str or prediction == 2 or prediction == "Good":
                    st.success("### 🌟 Prediction: Good Sleep")
                    st.write("Awesome! Your lifestyle and health metrics indicate excellent sleep quality.")
                elif "average" in pred_str or prediction == 1 or prediction == "Average" or "normal" in pred_str:
                    st.warning("### 📊 Prediction: Average Sleep")
                    st.write("Your sleep is average. Consider tweaking your habits, like lowering stress or adding more physical activity, to improve it.")
                else:
                    st.error("### ⚠️ Prediction: Poor Sleep")
                    st.write("Your health metrics suggest poor sleep quality. You might want to evaluate your stress levels, diet, and daily routines.")
                    
                # Visualize some insights based on user input
                st.subheader("Your Input Snapshot")
                fig, ax = plt.subplots(figsize=(6, 3))
                metrics = ['Sleep Duration (h)', 'Stress Level', 'Physical Activity (mins/10)']
                values = [sleep_duration, stress_level, physical_activity/10] # scaled down for visualization
                sns.barplot(x=values, y=metrics, palette='viridis', ax=ax)
                ax.set_title("Quick Profile Analysis")
                st.pyplot(fig)

# --- About Page ---
elif page == "About Project":
    st.title("ℹ️ About Sleep.ai")
    
    st.markdown("""
    **Sleep.ai** is an intelligent web application designed to predict a user's sleep quality based on various lifestyle and medical indicators.
    
    ### How it Works
    We trained a Machine Learning model to recognize patterns between daily habits and the resulting sleep quality. 
    By feeding the model your health data, it preprocesses the inputs and compares them against learned patterns to output a prediction.
    
    ### Features Used by the Model:
    1. **Age** & **Gender**
    2. **Occupation**
    3. **Sleep Duration**
    4. **Physical Activity Level** (Minutes per day)
    5. **Stress Level** (Scale of 1-10)
    6. **BMI Category**
    7. **Heart Rate** (Beats per minute)
    8. **Daily Steps**
    9. **Blood Pressure** (Systolic/Diastolic)
    
    ### Model Details
    - **Caching Pipeline**: The model and preprocessor are cached using `@st.cache_resource` for maximum speed and to avoid reloading on every prediction.
    - **Robust Preprocessing**: The system uses a dedicated preprocessor (`preprocessor.pkl`) to handle both numerical scaling and categorical encoding before prediction.
    
    *Developed as a Machine Learning demonstration project.*
    """)
