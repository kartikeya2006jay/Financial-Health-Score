from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import hashlib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

app = FastAPI(title="MSME Financial Health Card API - ML Edition")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ML Model Initialization ---
print("Training AI Model...")
# Generate synthetic dataset for MSMEs
np.random.seed(42)
n_samples = 1000
X_dummy = pd.DataFrame({
    'cash_flow_health': np.random.randint(30, 100, n_samples),
    'gst_compliance': np.random.randint(40, 100, n_samples),
    'epfo_stability': np.random.randint(20, 100, n_samples),
    'upi_volume': np.random.randint(40, 100, n_samples)
})
# Target variable: True Health Score
y_dummy = (0.4 * X_dummy['cash_flow_health'] + 
           0.3 * X_dummy['gst_compliance'] + 
           0.15 * X_dummy['epfo_stability'] + 
           0.15 * X_dummy['upi_volume']) + np.random.normal(0, 3, n_samples)
y_dummy = np.clip(y_dummy, 0, 100)

rf_model = RandomForestRegressor(n_estimators=50, random_state=42)
rf_model.fit(X_dummy, y_dummy)
baseline_score = rf_model.predict(X_dummy.mean().values.reshape(1, -1))[0]
print("AI Model Trained Successfully!")
# -------------------------------

class EnterpriseData(BaseModel):
    gstin: str
    upi_vpa: str
    consent_id: str
    epfo_reg_no: str

class XAIContribution(BaseModel):
    feature: str
    impact: float
    message: str

class SupplyChainNode(BaseModel):
    name: str
    volume: int
    type: str
    lat: float
    lng: float

class HealthScoreResponse(BaseModel):
    overall_score: int
    health_status: str
    metrics: dict
    strengths: list[str]
    risks: list[str]
    insights: list[str]
    xai_explanations: list[XAIContribution]
    supply_chain: list[SupplyChainNode]

@app.get("/")
def read_root():
    return {"message": "Welcome to MSME Financial Health API"}

@app.post("/api/analyze-health", response_model=HealthScoreResponse)
def analyze_health(data: EnterpriseData):
    # Use GSTIN to create a deterministic hash seed for the random number generator
    # This ensures the exact same input ALWAYS yields the exact same "real" data
    seed_val = int(hashlib.sha256(data.gstin.encode('utf-8')).hexdigest(), 16) % (10**8)
    random.seed(seed_val)
    
    # Deterministic fetched metrics based on the enterprise ID
    cash_flow_health = random.randint(30, 95)
    gst_compliance = random.randint(40, 100)
    epfo_stability = random.randint(20, 95)
    upi_volume = random.randint(30, 100)
    
    input_features = np.array([[cash_flow_health, gst_compliance, epfo_stability, upi_volume]])
    
    # ML Prediction
    predicted_score = rf_model.predict(input_features)[0]
    overall_score = int(predicted_score)
    
    if overall_score >= 80:
        health_status = "Excellent"
    elif overall_score >= 60:
        health_status = "Good"
    elif overall_score >= 40:
        health_status = "Fair"
    else:
        health_status = "High Risk"
        
    # Explainable AI (XAI) - Calculating Mock SHAP values (feature contribution)
    # We compare the input to the mean of the training data
    means = X_dummy.mean()
    contributions = [
        {"feature": "Cash Flow", "diff": cash_flow_health - means['cash_flow_health'], "weight": 0.4},
        {"feature": "GST Compliance", "diff": gst_compliance - means['gst_compliance'], "weight": 0.3},
        {"feature": "EPFO Stability", "diff": epfo_stability - means['epfo_stability'], "weight": 0.15},
        {"feature": "UPI Volume", "diff": upi_volume - means['upi_volume'], "weight": 0.15}
    ]
    
    xai_explanations = []
    for c in contributions:
        impact = round(c['diff'] * c['weight'], 1)
        if impact > 0:
            msg = f"Boosted score by +{impact}% due to strong {c['feature']} metrics."
        else:
            msg = f"Reduced score by {impact}% due to below-average {c['feature']}."
        
        xai_explanations.append(XAIContribution(feature=c['feature'], impact=impact, message=msg))
    
    # Sort XAI by absolute impact
    xai_explanations.sort(key=lambda x: abs(x.impact), reverse=True)

    strengths = [x.message for x in xai_explanations if x.impact > 0]
    risks = [x.message for x in xai_explanations if x.impact < 0]
    
    # Supply Chain Generation (GST based) with geo-coordinates
    suppliers = ["Tata Steel", "Reliance Polymers", "Local Wholesale Co.", "Tech Components India"]
    buyers = ["L&T Construction", "Maruti Suzuki", "Flipkart Retail", "City Traders"]
    
    supply_chain = []
    for _ in range(3):
        supply_chain.append(SupplyChainNode(
            name=random.choice(suppliers),
            volume=random.randint(5, 50) * 100000,
            type="Supplier",
            lat=random.uniform(11.0, 28.0),
            lng=random.uniform(72.0, 85.0)
        ))
    for _ in range(3):
        supply_chain.append(SupplyChainNode(
            name=random.choice(buyers),
            volume=random.randint(10, 80) * 100000,
            type="Buyer",
            lat=random.uniform(11.0, 28.0),
            lng=random.uniform(72.0, 85.0)
        ))

    return HealthScoreResponse(
        overall_score=overall_score,
        health_status=health_status,
        metrics={
            "cash_flow_health": cash_flow_health,
            "gst_compliance": gst_compliance,
            "epfo_stability": epfo_stability,
            "upi_volume": upi_volume
        },
        strengths=strengths[:3],
        risks=risks[:3],
        insights=[
            f"Expected credit limit up to ₹{random.randint(5, 50) * 100000}",
            "Recommended product: Supply Chain Finance" if cash_flow_health > 70 else "Recommended product: Invoice Discounting",
            "High supply chain diversification detected."
        ],
        xai_explanations=xai_explanations,
        supply_chain=supply_chain
    )
