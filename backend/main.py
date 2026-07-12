from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random

app = FastAPI(title="MSME Financial Health Card API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EnterpriseData(BaseModel):
    gstin: str
    upi_vpa: str
    consent_id: str
    epfo_reg_no: str

class HealthScoreResponse(BaseModel):
    overall_score: int
    health_status: str
    metrics: dict
    strengths: list[str]
    risks: list[str]
    insights: list[str]

@app.get("/")
def read_root():
    return {"message": "Welcome to MSME Financial Health API"}

@app.post("/api/analyze-health", response_model=HealthScoreResponse)
def analyze_health(data: EnterpriseData):
    # Mocking data aggregation and ML scoring based on the alternate data
    # In a real scenario, we would use OCEN/AA ecosystem APIs to fetch data
    
    # Simulate some ML computed metrics
    cash_flow_health = random.randint(50, 100)
    gst_compliance = random.randint(70, 100)
    epfo_stability = random.randint(40, 95)
    upi_volume = random.randint(60, 100)
    
    overall_score = int(0.4 * cash_flow_health + 0.3 * gst_compliance + 0.15 * epfo_stability + 0.15 * upi_volume)
    
    if overall_score >= 80:
        health_status = "Excellent"
    elif overall_score >= 60:
        health_status = "Good"
    elif overall_score >= 40:
        health_status = "Fair"
    else:
        health_status = "High Risk"
        
    strengths = []
    risks = []
    
    if gst_compliance > 85:
        strengths.append("High GST Compliance indicating consistent tax filing.")
    else:
        risks.append("Irregular GST filings observed.")
        
    if cash_flow_health > 75:
        strengths.append("Strong and steady cash flow via AA.")
    else:
        risks.append("High variance in monthly cash flow.")
        
    if upi_volume > 80:
        strengths.append("High digital transaction footprint.")
        
    if epfo_stability < 60:
        risks.append("Employee turnover or missing EPF contributions.")

    return HealthScoreResponse(
        overall_score=overall_score,
        health_status=health_status,
        metrics={
            "cash_flow_health": cash_flow_health,
            "gst_compliance": gst_compliance,
            "epfo_stability": epfo_stability,
            "upi_volume": upi_volume
        },
        strengths=strengths,
        risks=risks,
        insights=[
            f"Expected credit limit up to ₹{random.randint(1, 10) * 100000}",
            "Recommended product: Supply Chain Finance" if cash_flow_health > 70 else "Recommended product: Invoice Discounting"
        ]
    )
