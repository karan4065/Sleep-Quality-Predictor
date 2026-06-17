import pandas as pd
import numpy as np
import pickle
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier

def generate_mock_models():
    print("Generating mock dataset...")
    # Generate mock dataset matching the 10 features
    n_samples = 100
    
    data = {
        'Age': np.random.randint(20, 60, n_samples),
        'Gender': np.random.choice(['Male', 'Female'], n_samples),
        'Occupation': np.random.choice(['Software Engineer', 'Doctor', 'Teacher', 'Nurse'], n_samples),
        'Sleep Duration': np.random.uniform(4.0, 9.0, n_samples),
        'Physical Activity Level': np.random.randint(20, 120, n_samples),
        'Stress Level': np.random.randint(1, 10, n_samples),
        'BMI Category': np.random.choice(['Normal', 'Overweight', 'Obese'], n_samples),
        'Heart Rate': np.random.randint(60, 90, n_samples),
        'Daily Steps': np.random.randint(3000, 10000, n_samples),
        'Blood Pressure': np.random.choice(['120/80', '130/85', '140/90'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Mock target: Good, Average, Poor
    # Make a simple rule for mock target
    def get_sleep_quality(row):
        if row['Sleep Duration'] > 7 and row['Stress Level'] < 5:
            return 'Good'
        elif row['Sleep Duration'] < 5 or row['Stress Level'] > 7:
            return 'Poor'
        return 'Average'
        
    y = df.apply(get_sleep_quality, axis=1)
    
    print("Building preprocessing pipeline...")
    # Define categorical and numerical columns
    categorical_cols = ['Gender', 'Occupation', 'BMI Category', 'Blood Pressure']
    numerical_cols = ['Age', 'Sleep Duration', 'Physical Activity Level', 'Stress Level', 'Heart Rate', 'Daily Steps']
    
    # Preprocessing
    numerical_transformer = StandardScaler()
    categorical_transformer = OneHotEncoder(handle_unknown='ignore')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numerical_transformer, numerical_cols),
            ('cat', categorical_transformer, categorical_cols)
        ])
    
    print("Training model...")
    # Fit preprocessor
    X_processed = preprocessor.fit_transform(df)
    
    # Train model
    model = RandomForestClassifier(n_estimators=10, random_state=42)
    model.fit(X_processed, y)
    
    print("Saving models...")
    # Save preprocessor
    with open('preprocessor.pkl', 'wb') as f:
        pickle.dump(preprocessor, f)
        
    # Save model
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
        
    print("Successfully generated 'preprocessor.pkl' and 'model.pkl'!")

if __name__ == "__main__":
    generate_mock_models()
