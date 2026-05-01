import csv
import random

def generate_dataset(filename="sleep_data.csv", num_rows=600):
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["screen_time_hours", "sleep_time_hours", "physical_activity_minutes", "sleep_quality_score"])
        
        for _ in range(num_rows):
            # Generate random inputs
            screen_time = round(random.uniform(1.0, 14.0), 1)
            sleep_time = round(random.uniform(3.0, 12.0), 1)
            activity = random.randint(0, 180)
            
            # Base logic for sleep quality score
            # Higher sleep time is better, lower screen time is better, higher activity is better (to a point)
            score = 50 + (sleep_time * 5) - (screen_time * 3) + (activity * 0.1)
            
            # Add some random noise
            noise = random.uniform(-5, 5)
            score += noise
            
            # Bound the score between 0 and 100
            score = max(0, min(100, round(score)))
            
            writer.writerow([screen_time, sleep_time, activity, score])

if __name__ == "__main__":
    generate_dataset()
    print("Dataset generated successfully: sleep_data.csv")
