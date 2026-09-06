from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import os
import pickle

MODEL_FILE = "eduguard_xgb.pkl"
EXPLAINER_FILE = "eduguard_explainer.pkl"

def generate_synthetic_data(n_samples=2000):
    np.random.seed(42)
    attendance_trend = np.random.uniform(-30, 10, n_samples)
    current_attendance = np.clip(75 + attendance_trend + np.random.normal(0, 5, n_samples), 30, 100)
    internal_marks = np.clip(np.random.normal(65, 15, n_samples), 20, 100)
    backlogs = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.6, 0.2, 0.1, 0.06, 0.04])
    assignment_completion_rate = np.clip(current_attendance * 0.9 + np.random.normal(0, 10, n_samples), 10, 100)
    lms_activity_score = np.clip(assignment_completion_rate * 0.8 + np.random.normal(0, 10, n_samples), 5, 100)
    
    # FIX: Use np.where instead of python 'if/else' for array evaluation
    trend_penalty = np.where(attendance_trend < 0, -attendance_trend * 0.3, 0)
    
    risk_score = (
        (100 - current_attendance) * 0.35 +
        (100 - internal_marks) * 0.25 +
        (backlogs * 12) +
        (100 - assignment_completion_rate) * 0.15 +
        trend_penalty
    )
    dropout = (risk_score > 45).astype(int)
    
    df = pd.DataFrame({
        'current_attendance': current_attendance,
        'attendance_trend': attendance_trend,
        'internal_marks': internal_marks,
        'backlogs': backlogs,
        'assignment_completion_rate': assignment_completion_rate,
        'lms_activity_score': lms_activity_score,
        'dropout': dropout
    })
    return df

def train_and_save_model():
    df = generate_synthetic_data()
    X = df.drop(columns=['dropout'])
    y = df['dropout']
    
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=4,
        learning_rate=0.05,
        eval_metric='logloss',
        random_state=42
    )
    model.fit(X, y)
    
    explainer = shap.TreeExplainer(model)
    
    with open(MODEL_FILE, 'wb') as f:
        pickle.dump(model, f)
    with open(EXPLAINER_FILE, 'wb') as f:
        pickle.dump(explainer, f)
    print("Model and SHAP Explainer successfully trained and saved.")

def load_artifacts():
    if not os.path.exists(MODEL_FILE) or not os.path.exists(EXPLAINER_FILE):
        train_and_save_model()
    with open(MODEL_FILE, 'rb') as f:
        model = pickle.load(f)
    with open(EXPLAINER_FILE, 'rb') as f:
        explainer = pickle.load(f)
    return model, explainer

if __name__ == "__main__":
    train_and_save_model()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"status": "EduGuard AI Backend is Running!"}

@app.get("/health")
def health():
    return {"status": "healthy"}