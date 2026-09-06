from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
from model_engine import load_artifacts, train_and_save_model

app = FastAPI(title="EduGuard AI Risk Inference API", version="1.0")

# Load model artifacts at startup
model, explainer = load_artifacts()

class StudentData(BaseModel):
    current_attendance: float = Field(..., ge=0, le=100)
    attendance_trend: float = Field(..., ge=-100, le=100)
    internal_marks: float = Field(..., ge=0, le=100)
    backlogs: int = Field(..., ge=0)
    assignment_completion_rate: float = Field(..., ge=0, le=100)
    lms_activity_score: float = Field(..., ge=0, le=100)

FEATURE_MAP = {
    'current_attendance': 'Low Overall Attendance',
    'attendance_trend': 'Declining Attendance Trend',
    'internal_marks': 'Low Academic/Internal Performance',
    'backlogs': 'Active Academic Backlogs',
    'assignment_completion_rate': 'Incomplete Assignment Submissions',
    'lms_activity_score': 'Low LMS Activity & Engagement'
}

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "EduGuard ML Engine"}

@app.post("/predict")
def predict_risk(data: StudentData):
    try:
        input_dict = data.dict()
        df_input = pd.DataFrame([input_dict])
        
        # Calculate Dropout Risk Probability (0-100)
        prob = model.predict_proba(df_input)[0][1]
        risk_score = round(float(prob * 100), 2)
        
        # Determine Category
        if risk_score <= 30:
            category = "LOW"
        elif risk_score <= 60:
            category = "MEDIUM"
        elif risk_score <= 80:
            category = "HIGH"
        else:
            category = "CRITICAL"
            
        # Extract SHAP values for Explainable AI
        shap_values = explainer(df_input)
        vals = shap_values.values[0]
        
        # Normalize positive risk drivers into percentages
        positive_factors = {feat: val for feat, val in zip(df_input.columns, vals) if val > 0}
        total_pos = sum(positive_factors.values()) if positive_factors else 1.0
        
        reasons = []
        for feat, val in sorted(positive_factors.items(), key=lambda x: x[1], reverse=True):
            impact = round((val / total_pos) * 100, 1)
            reasons.append({
                "factor": FEATURE_MAP.get(feat, feat),
                "impact_percentage": impact,
                "raw_feature": feat
            })
            
        # Fallback if no positive drivers identified
        if not reasons:
            reasons.append({"factor": "Normal Fluctuations", "impact_percentage": 100.0, "raw_feature": "none"})

        # Actionable Rules Engine
        recommendations = []
        if input_dict['current_attendance'] < 60 or input_dict['attendance_trend'] < -15:
            recommendations.append("Schedule mandatory attendance counseling session with mentor.")
        if input_dict['internal_marks'] < 50 or input_dict['backlogs'] > 0:
            recommendations.append("Assign subject peer-tutor and enroll in remedial academic modules.")
        if input_dict['assignment_completion_rate'] < 50 or input_dict['lms_activity_score'] < 40:
            recommendations.append("Issue deadline extension guidance and follow up on assignment blockers.")
        if not recommendations:
            recommendations.append("Maintain standard bi-weekly mentor check-ins.")

        return {
            "risk_score": risk_score,
            "risk_category": category,
            "reasons": reasons,
            "recommended_interventions": recommendations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))