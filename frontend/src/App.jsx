import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Activity, TrendingUp, Users, Brain, Network, Download, 
  ArrowRight, LogOut, FileText, CheckCircle2, LayoutDashboard, History, 
  Settings, Building, Wallet, FileDigit, Smartphone
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Auth from './components/Auth';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const dashboardRef = useRef(null);

  // Form State (No Hardcoding, all dynamic inputs)
  const [formData, setFormData] = useState({
    businessName: '',
    udyam_reg: '',
    gstin: '',
    itr_ack: '',
    upi_vpa: '',
    consent_id: '',
    epfo_reg_no: '',
  });

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
    setStep(1);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
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
      pdf.save(`${formData.businessName || 'MSME'}_Financial_Health_Card.pdf`);
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
    return <div className="app-container"><h2 style={{marginTop: '20vh'}}>Loading Secure Environment...</h2></div>;
  }

  if (!user) {
    return <div className="app-container"><Auth onLoginSuccess={() => {}} /></div>;
  }

  return (
    <div className="layout-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Activity size={28} color="var(--accent-color)" />
          <h2>MSME AI</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={20} />
            New Assessment
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={20} />
            Assessment History
          </button>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={20} />
            Bank Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{user.email.charAt(0).toUpperCase()}</div>
            <span className="email">{user.email.split('@')[0]}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content-area">
        <header className="top-header">
          <div>
            <h1>{result ? 'Financial Health Overview' : 'Data Aggregation Portal'}</h1>
            <p>{result ? `Assessment complete for ${formData.businessName}` : 'Connect MSME alternate data sources securely via ULI/OCEN.'}</p>
          </div>
          {result && (
            <div className="header-actions">
              <button className="submit-btn secondary-btn" onClick={() => {setResult(null); setStep(1); setFormData({businessName: '', udyam_reg: '', gstin: '', itr_ack: '', upi_vpa: '', consent_id: '', epfo_reg_no: ''});}}>
                Start New
              </button>
              <button className="submit-btn" onClick={handleDownloadPDF}>
                <Download size={18} /> Export Report
              </button>
            </div>
          )}
        </header>

        <div className="content-wrapper">
          {activeTab === 'dashboard' && !result ? (
            <div className="glass-panel form-wizard">
              {/* Stepper Header */}
              <div className="stepper">
                <div className={`step ${step >= 1 ? 'active' : ''}`}>
                  <div className="step-icon"><Building size={16} /></div>
                  <span>Business</span>
                </div>
                <div className="step-line" />
                <div className={`step ${step >= 2 ? 'active' : ''}`}>
                  <div className="step-icon"><FileDigit size={16} /></div>
                  <span>Compliance</span>
                </div>
                <div className="step-line" />
                <div className={`step ${step >= 3 ? 'active' : ''}`}>
                  <div className="step-icon"><Wallet size={16} /></div>
                  <span>Financials</span>
                </div>
              </div>

              <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="step-content animation-fade-in">
                    <h3>Business Identity</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Business Name</label>
                        <div className="input-with-icon">
                          <Building className="input-icon" size={18} />
                          <input type="text" name="businessName" placeholder="e.g. Ramesh Trading Co." value={formData.businessName} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Udyam Registration No.</label>
                        <div className="input-with-icon">
                          <FileText className="input-icon" size={18} />
                          <input type="text" name="udyam_reg" placeholder="UDYAM-XX-00-0000000" value={formData.udyam_reg} onChange={handleChange} required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="step-content animation-fade-in">
                    <h3>Compliance & Tax Data</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>GSTIN</label>
                        <div className="input-with-icon">
                          <FileDigit className="input-icon" size={18} />
                          <input type="text" name="gstin" placeholder="27AAAAA0000A1Z5" value={formData.gstin} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>EPFO Registration No.</label>
                        <div className="input-with-icon">
                          <Users className="input-icon" size={18} />
                          <input type="text" name="epfo_reg_no" placeholder="EPFO ID" value={formData.epfo_reg_no} onChange={handleChange} required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="step-content animation-fade-in">
                    <h3>Financial & Payments Data</h3>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>UPI Virtual Payment Address (VPA)</label>
                        <div className="input-with-icon">
                          <Smartphone className="input-icon" size={18} />
                          <input type="text" name="upi_vpa" placeholder="merchant@upi" value={formData.upi_vpa} onChange={handleChange} required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Account Aggregator Consent ID</label>
                        <div className="input-with-icon">
                          <Network className="input-icon" size={18} />
                          <input type="text" name="consent_id" placeholder="AA-XXXX-YYYY" value={formData.consent_id} onChange={handleChange} required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  {step > 1 && (
                    <button type="button" className="submit-btn secondary-btn" onClick={handlePrevStep}>
                      <ArrowLeft size={18} /> Back
                    </button>
                  )}
                  <button type="submit" className="submit-btn" disabled={loading} style={{marginLeft: 'auto'}}>
                    {step === 3 ? (loading ? 'Analyzing...' : 'Generate AI Score') : 'Next Step'}
                    {step !== 3 && <ArrowRight size={18} />}
                  </button>
                </div>
              </form>
            </div>
          ) : result ? (
            /* Dashboard Results View */
            <div className="dashboard animation-fade-in" ref={dashboardRef}>
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
                  <h3><Activity size={16} /> Cash Flow (AA)</h3>
                  <div className="value">{result.metrics.cash_flow_health}/100</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${result.metrics.cash_flow_health}%` }}></div></div>
                </div>
                <div className="glass-panel metric-card">
                  <h3><ShieldCheck size={16} /> GST Compliance</h3>
                  <div className="value">{result.metrics.gst_compliance}/100</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${result.metrics.gst_compliance}%`, background: 'var(--success-color)' }}></div></div>
                </div>
                <div className="glass-panel metric-card">
                  <h3><Users size={16} /> EPFO Stability</h3>
                  <div className="value">{result.metrics.epfo_stability}/100</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${result.metrics.epfo_stability}%`, background: 'var(--warning-color)' }}></div></div>
                </div>
                <div className="glass-panel metric-card">
                  <h3><TrendingUp size={16} /> UPI Volume</h3>
                  <div className="value">{result.metrics.upi_volume}/100</div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${result.metrics.upi_volume}%` }}></div></div>
                </div>
              </div>

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
                      {formData.businessName || 'MSME'}
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
          ) : (
            <div className="glass-panel full-width-panel">
              <h3 className="panel-header" style={{justifyContent: 'center', margin: '4rem 0'}}>Feature in development...</h3>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
