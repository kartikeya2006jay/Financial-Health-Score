<div align="center">
  <a href="https://github.com/kartikeya2006jay/Financial-Health-Score">
    <img src="banner.png" alt="MSME Financial Health Score Banner" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
  </a>

  <h1 align="center">🔮 AI/ML MSME Financial Health Card</h1>

  <p align="center">
    <strong>Empowering NTC & NTB Enterprises with Alternate Data Credit Scoring.</strong>
    <br />
    <br />
    <a href="#-killer-features">Killer Features</a>
    ·
    <a href="#-architecture">Architecture</a>
    ·
    <a href="#-getting-started">Getting Started</a>
    ·
    <a href="#-tech-stack">Tech Stack</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/scikit_learn-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit Learn" />
    <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  </p>
</div>

<hr />

## 🌟 The Problem
Bank MSME credit evaluation heavily relies on traditional financial documents. Unfortunately, **New-to-Credit (NTC)** and **New-to-Bank (NTB)** enterprises lack these, leading to high rejection rates and slower financial inclusion, despite generating massive volumes of rich **alternate data** (GST, UPI, Account Aggregator, EPFO).

## 🚀 Our Solution
An **AI/ML-Driven Financial Health Card** that aggregates alternate data, computes a multidimensional risk score, and presents the insights in an intuitive, glassmorphic UI meant for real-world enterprise underwriters.

<br />

## 🏆 Killer Features (Hackathon Highlights)

| Feature | Description | Impact |
| :--- | :--- | :--- |
| **🧠 Explainable AI (XAI)** | Instead of a random "black box" score, our ML model (Random Forest) simulates SHAP values to explicitly tell underwriters *why* a score was given (e.g. `+15% due to high UPI volume`). | Builds trust with banking institutions. |
| **🕸️ Supply Chain Graph** | Analyzes mock GST data to map the MSME's top buyers (outflows) and suppliers (inflows). | Proves network resilience beyond just cash flow. |
| **📄 PDF Generation** | One-click export of the glassmorphic dashboard into a bank-ready, A4 PDF report. | Ready to be attached to loan applications immediately. |
| **⚡ Account Aggregator Flow** | Simulates the ULI/OCEN data fetch using identifiers like GSTIN and VPA. | Aligns perfectly with India's Digital Public Infrastructure. |

<br />

## 📐 Architecture & Tech Stack

<div align="center">
  <table>
    <tr>
      <td align="center"><b>Frontend</b></td>
      <td align="center"><b>Backend</b></td>
      <td align="center"><b>AI / ML Core</b></td>
    </tr>
    <tr>
      <td>React.js<br/>Vite<br/>Glassmorphism UI<br/>Lucide Icons</td>
      <td>FastAPI<br/>Uvicorn<br/>Pydantic (Validation)</td>
      <td>Scikit-Learn (Random Forest)<br/>Pandas & Numpy<br/>Feature Importance (XAI)</td>
    </tr>
  </table>
</div>

<br />

## 🛠️ Getting Started

Follow these steps to run the project locally.

### 1. Clone the repository
```bash
git clone git@github.com:kartikeya2006jay/Financial-Health-Score.git
cd Financial-Health-Score
```

### 2. Run the AI Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # (or fastApi, uvicorn, scikit-learn, pandas)
uvicorn main:app --reload --port 8000
```
> **Note:** The backend automatically trains the Random Forest model on 1,000 synthetic MSME data points instantly upon startup!

### 3. Run the Frontend (Vite)
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000` to view the application!

<br />

<div align="center">
  <i>Built with ❤️ for the Hackathon</i>
</div>
