import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, Activity, TrendingUp, Users, Brain, Network, Download, ArrowRight, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [formData, setFormData] = useState({
    gstin: '',
    upi_vpa: '',
    consent_id: '',
    epfo_reg_no: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const dashboardRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setResult(null);
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

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        backgroundColor: '#0d1117',
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('MSME_Financial_Health_Card.pdf');
    } catch (err) {
      console.error("Failed to generate PDF", err);
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

  if (authLoading) {
    return <div className="app-container"><h2 style={{marginTop: '20vh'}}>Loading...</h2></div>;
  }

  if (!user) {
    return (
      <div className="app-container">
        <Auth onLoginSuccess={() => {}} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>MSME Health Card</h1>
        <p>AI-Driven Financial Assessment using Alternate Data</p>
        <div className="header-actions">
          {result && (
            <>
              <button className="submit-btn secondary-btn" onClick={() => setResult(null)}>
                Analyze Another
              </button>
              <button className="submit-btn" onClick={handleDownloadPDF}>
                <Download size={18} /> Download PDF Report
              </button>
            </>
          )}
          <button className="submit-btn secondary-btn" onClick={handleLogout} style={{borderColor: 'rgba(248, 81, 73, 0.4)', color: '#ff7b72'}}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {!result ? (
          <form className="glass-panel form-container" onSubmit={handleSubmit}>
            <h2>Enter Enterprise Details (Account Aggregator Consent)</h2>
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
              {loading ? 'Fetching & Analyzing Data...' : 'Generate AI Health Score'}
            </button>
          </form>
        ) : (
          <div className="dashboard" ref={dashboardRef}>
            {/* Top Section: Score & Metrics */}
            <div className="glass-panel score-card">
              <h2>AI Predicted Health Score</h2>
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

            {/* Explainable AI (XAI) Section */}
            <div className="glass-panel full-width-panel">
              <h3 className="panel-header"><Brain size={20} /> Explainable AI (XAI) Model Insights</h3>
              <div className="xai-list">
                {result.xai_explanations.map((xai, i) => (
                  <div className="xai-item" key={i}>
                    <div className={`xai-impact ${xai.impact > 0 ? 'positive' : 'negative'}`}>
                      {xai.impact > 0 ? '+' : ''}{xai.impact}%
                    </div>
                    <div className="xai-message">
                      <strong>{xai.feature}:</strong> {xai.message}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Supply Chain Network Section */}
            <div className="glass-panel full-width-panel">
              <h3 className="panel-header"><Network size={20} /> Supply Chain Health (GST Ecosystem)</h3>
              <div className="supply-chain-network">
                <div className="sc-column">
                  <h4>Top Suppliers (Inflow)</h4>
                  {result.supply_chain.filter(n => n.type === 'Supplier').map((node, i) => (
                    <div className="sc-node" key={i}>
                      <span>{node.name}</span>
                      <span className="volume">₹{(node.volume / 100000).toFixed(1)}L / mo</span>
                    </div>
                  ))}
                </div>
                <div className="sc-center">
                  <ArrowRight size={24} color="var(--text-secondary)" />
                  <div className="sc-center-node" style={{ margin: '0 1rem' }}>
                    MSME Client
                  </div>
                  <ArrowRight size={24} color="var(--text-secondary)" />
                </div>
                <div className="sc-column">
                  <h4>Top Buyers (Outflow)</h4>
                  {result.supply_chain.filter(n => n.type === 'Buyer').map((node, i) => (
                    <div className="sc-node" key={i}>
                      <span>{node.name}</span>
                      <span className="volume">₹{(node.volume / 100000).toFixed(1)}L / mo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default App;
