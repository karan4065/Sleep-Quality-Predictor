import pandas as pd
from sklearn.linear_model import LinearRegression
import pickle

def train_model():
    # Load the dataset
    try:
        df = pd.read_csv("sleep_data.csv")
    except FileNotFoundError:
        print("Error: sleep_data.csv not found. Please run dataset_generator.py first.")
        return

    # Features and Target
    X = df[["screen_time_hours", "sleep_time_hours", "physical_activity_minutes"]]
    y = df["sleep_quality_score"]

    # Initialize and train the model
    model = LinearRegression()
    model.fit(X, y)

    # Save the model
    with open("sleep_model.pkl", "wb") as f:
        pickle.dump(model, f)
        
    print("Model trained and saved successfully as sleep_model.pkl")

if __name__ == "__main__":
    train_model()
