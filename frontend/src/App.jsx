import { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, AlertTriangle, Lightbulb, Activity, TrendingUp, Users, DollarSign } from 'lucide-react';
import './App.css';

function App() {
  const [formData, setFormData] = useState({
    gstin: '',
    upi_vpa: '',
    consent_id: '',
    epfo_reg_no: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/api/analyze-health', formData);
      setResult(response.data);
    } catch (error) {
      console.error("Error analyzing health:", error);
      alert("Failed to connect to the analysis engine. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Excellent': return 'excellent';
      case 'Good': return 'good';
      case 'Fair': return 'fair';
      default: return 'high-risk';
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>MSME Health Card</h1>
        <p>AI-Driven Financial Assessment using Alternate Data</p>
      </header>

      <main className="main-content">
        {!result ? (
          <form className="glass-panel form-container" onSubmit={handleSubmit}>
            <h2>Enter Enterprise Details</h2>
            <div className="form-group">
              <label htmlFor="gstin">GSTIN</label>
              <input type="text" id="gstin" name="gstin" placeholder="e.g. 27AAAAA0000A1Z5" value={formData.gstin} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="upi_vpa">UPI VPA (Virtual Payment Address)</label>
              <input type="text" id="upi_vpa" name="upi_vpa" placeholder="e.g. merchant@upi" value={formData.upi_vpa} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="consent_id">Account Aggregator Consent ID</label>
              <input type="text" id="consent_id" name="consent_id" placeholder="Enter AA Consent ID" value={formData.consent_id} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="epfo_reg_no">EPFO Registration Number</label>
              <input type="text" id="epfo_reg_no" name="epfo_reg_no" placeholder="Enter EPFO Reg No" value={formData.epfo_reg_no} onChange={handleChange} required />
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Analyzing Data...' : 'Generate Health Score'}
            </button>
          </form>
        ) : (
          <div className="dashboard">
            <div className="glass-panel score-card">
              <h2>Overall Health Score</h2>
              <div 
                className={`score-circle ${getStatusClass(result.health_status)}`}
                style={{ '--score': result.overall_score }}
              >
                <span className="score-value">{result.overall_score}</span>
                <span className="score-label" style={{ 
                  color: result.health_status === 'Excellent' ? 'var(--success-color)' : 
                         result.health_status === 'Good' ? 'var(--accent-color)' : 
                         result.health_status === 'Fair' ? 'var(--warning-color)' : 'var(--danger-color)'
                }}>
                  {result.health_status}
                </span>
              </div>
              <button className="submit-btn" onClick={() => setResult(null)}>Analyze Another</button>
            </div>

            <div className="metrics-grid">
              <div className="glass-panel metric-card">
                <h3><Activity size={16} /> Cash Flow Health (AA)</h3>
                <div className="value">{result.metrics.cash_flow_health}/100</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.metrics.cash_flow_health}%` }}></div>
                </div>
              </div>
              <div className="glass-panel metric-card">
                <h3><ShieldCheck size={16} /> GST Compliance</h3>
                <div className="value">{result.metrics.gst_compliance}/100</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.metrics.gst_compliance}%`, background: 'var(--success-color)' }}></div>
                </div>
              </div>
              <div className="glass-panel metric-card">
                <h3><Users size={16} /> EPFO Stability</h3>
                <div className="value">{result.metrics.epfo_stability}/100</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.metrics.epfo_stability}%`, background: 'var(--warning-color)' }}></div>
                </div>
              </div>
              <div className="glass-panel metric-card">
                <h3><TrendingUp size={16} /> UPI Volume</h3>
                <div className="value">{result.metrics.upi_volume}/100</div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${result.metrics.upi_volume}%` }}></div>
                </div>
              </div>
            </div>

            <div className="glass-panel insights-panel">
              <div className="insights-section strengths">
                <h3><ShieldCheck size={20} /> Key Strengths</h3>
                <ul>
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                  {result.strengths.length === 0 && <li>No significant strengths detected.</li>}
                </ul>
              </div>
              <div className="insights-section risks">
                <h3><AlertTriangle size={20} /> Risk Factors</h3>
                <ul>
                  {result.risks.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                  {result.risks.length === 0 && <li>No significant risks detected.</li>}
                </ul>
              </div>
              <div className="insights-section recommendations">
                <h3><Lightbulb size={20} /> Credit Insights</h3>
                <ul>
                  {result.insights.map((ins, i) => (
                    <li key={i}>{ins}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
