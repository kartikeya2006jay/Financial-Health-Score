import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  ShieldCheck, Activity, TrendingUp, Users, Brain, Network, Download,
  ArrowRight, ArrowLeft, LogOut, FileText, LayoutDashboard, History,
  Settings, Building, Wallet, FileDigit, Smartphone, CheckCircle
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import Auth from './components/Auth';
import SettingsPanel from './components/SettingsPanel';
import HistoryPanel from './components/HistoryPanel';
import SupplyChainMap from './components/SupplyChainMap';
import './App.css';

const EMPTY_FORM = { businessName: '', udyam_reg: '', gstin: '', upi_vpa: '', consent_id: '', epfo_reg_no: '' };

const RADIUS = 70;
const CIRC = 2 * Math.PI * RADIUS;

function ScoreRing({ score, status }) {
  const cls = status === 'Excellent' ? 'excellent' : status === 'Good' ? 'good' : status === 'Fair' ? 'fair' : 'high-risk';
  const offset = CIRC - (score / 100) * CIRC;
  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" viewBox="0 0 160 160">
        <circle className="score-ring-bg" cx="80" cy="80" r={RADIUS} />
        <circle className={`score-ring-fill ${cls}`} cx="80" cy="80" r={RADIUS}
          strokeDasharray={CIRC} strokeDashoffset={offset} />
      </svg>
      <div className="score-ring-center">
        <span className="score-number">{score}</span>
        <span className={`score-status ${cls}`}>{status}</span>
      </div>
    </div>
  );
}

function MetricBar({ value, color }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${value}%`, background: color || 'linear-gradient(90deg, var(--accent), #00a884)' }} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const dashboardRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleLogout = async () => { await signOut(auth); setResult(null); setStep(1); };
  const handleNextStep = e => { e.preventDefault(); setStep(s => s + 1); };
  const handlePrevStep = () => setStep(s => s - 1);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:8000/api/analyze-health', formData);
      setResult(data);
      try {
        await addDoc(collection(db, 'assessments'), {
          userId: user.uid,
          businessName: formData.businessName,
          udyam_reg: formData.udyam_reg,
          gstin: formData.gstin,
          result: data,
          createdAt: new Date().toISOString(),
        });
      } catch (fsErr) {
        console.warn('Firestore save failed (Firestore may not be enabled):', fsErr.message);
      }
      setActiveTab('dashboard');
    } catch (err) {
      alert('Failed to connect to the analysis engine. Is the backend running on port 8000?');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    const canvas = await html2canvas(dashboardRef.current, { scale: 2, backgroundColor: '#060b14', useCORS: true });
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = pdf.internal.pageSize.getWidth();
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
    pdf.save(`${formData.businessName || 'MSME'}_HealthCard.pdf`);
  };

  const resetAssessment = () => { setResult(null); setStep(1); setFormData(EMPTY_FORM); };

  if (authLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#060b14', color: '#7a98b8' }}>
      Initializing secure environment...
    </div>
  );

  if (!user) return <div style={{ background: '#060b14', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Auth onLoginSuccess={() => {}} /></div>;

  const statusColor = s => ({ Excellent: 'var(--accent)', Good: 'var(--accent-blue)', Fair: 'var(--warning)', 'High Risk': 'var(--danger)' }[s] || 'var(--text-secondary)');

  return (
    <div className="layout-container">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Activity size={20} color="#060b14" />
          </div>
          <div className="brand-text">
            <h2>MSME Health AI</h2>
            <span>Credit Intelligence</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <span className="nav-section-label">Workspace</span>
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={18} className="nav-icon" /> New Assessment
            {result && <span className="nav-badge">1</span>}
          </button>
          <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <History size={18} className="nav-icon" /> Assessment History
          </button>

          <span className="nav-section-label">Configuration</span>
          <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} className="nav-icon" /> Bank Settings
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="user-avatar">{user.email.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <div className="user-name">{user.email.split('@')[0]}</div>
              <div className="user-role">Loan Officer</div>
            </div>
            <button className="logout-btn" onClick={handleLogout} title="Sign out"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content-area">
        <header className="top-header">
          <div className="header-left">
            <h1>
              {activeTab === 'history' ? 'Assessment History' : activeTab === 'settings' ? 'Bank Settings' : result ? 'Financial Health Report' : 'New Assessment'}
            </h1>
            <p>
              {activeTab === 'history' ? 'All past underwriting evaluations for your account' :
               activeTab === 'settings' ? 'Configure AI thresholds and integration endpoints' :
               result ? `AI analysis complete · ${formData.businessName}` :
               'Aggregate alternate data and generate an AI credit score'}
            </p>
          </div>
          {result && activeTab === 'dashboard' && (
            <div className="header-actions">
              <button className="submit-btn secondary-btn" onClick={resetAssessment}><ArrowLeft size={16}/> New Analysis</button>
              <button className="submit-btn" onClick={handleDownloadPDF}><Download size={16}/> Export PDF</button>
            </div>
          )}
        </header>

        <div className="content-wrapper">
          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && !result && (
            <div className="glass-panel form-wizard">
              <div className="wizard-meta">
                <span className="wizard-chip">ULI / OCEN / AA</span>
                <span className="wizard-title">Enterprise Data Aggregation</span>
              </div>

              {/* Stepper */}
              <div className="stepper">
                {['Business', 'Compliance', 'Financials'].map((label, i) => (
                  <>
                    <div className={`step ${step > i + 1 ? 'done' : step === i + 1 ? 'active' : ''}`} key={label}>
                      <div className="step-num">{step > i + 1 ? <CheckCircle size={18} /> : i + 1}</div>
                      <span className="step-label">{label}</span>
                    </div>
                    {i < 2 && <div className={`step-connector ${step > i + 1 ? 'done' : ''}`} key={`c${i}`} />}
                  </>
                ))}
              </div>

              <form onSubmit={step === 3 ? handleSubmit : handleNextStep}>
                {step === 1 && (
                  <div className="step-content">
                    <h3>Business Identity</h3>
                    <p className="step-desc">Enter the registered details of the MSME enterprise.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Business / Trade Name</label>
                        <div className="field-wrap">
                          <Building size={16} className="field-icon" />
                          <input name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. Ramesh Trading Co." required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Udyam Registration No.</label>
                        <div className="field-wrap">
                          <FileText size={16} className="field-icon" />
                          <input name="udyam_reg" value={formData.udyam_reg} onChange={handleChange} placeholder="UDYAM-MH-00-0000000" required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="step-content">
                    <h3>Compliance & Tax Data</h3>
                    <p className="step-desc">GST and EPFO data are pulled via Government DPI APIs.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>GSTIN</label>
                        <div className="field-wrap">
                          <FileDigit size={16} className="field-icon" />
                          <input name="gstin" value={formData.gstin} onChange={handleChange} placeholder="27AAAAA0000A1Z5" required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>EPFO Registration No.</label>
                        <div className="field-wrap">
                          <Users size={16} className="field-icon" />
                          <input name="epfo_reg_no" value={formData.epfo_reg_no} onChange={handleChange} placeholder="MH/MUM/000000" required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div className="step-content">
                    <h3>Financial & Payments Data</h3>
                    <p className="step-desc">Consent-based data access via Account Aggregator framework.</p>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>UPI Virtual Payment Address (VPA)</label>
                        <div className="field-wrap">
                          <Smartphone size={16} className="field-icon" />
                          <input name="upi_vpa" value={formData.upi_vpa} onChange={handleChange} placeholder="merchant@okicici" required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Account Aggregator Consent ID</label>
                        <div className="field-wrap">
                          <Network size={16} className="field-icon" />
                          <input name="consent_id" value={formData.consent_id} onChange={handleChange} placeholder="AA-CONSENT-XXXX" required />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-actions">
                  <span className="step-indicator">Step {step} of 3</span>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {step > 1 && (
                      <button type="button" className="submit-btn secondary-btn" onClick={handlePrevStep}>
                        <ArrowLeft size={16} /> Back
                      </button>
                    )}
                    <button type="submit" className="submit-btn" disabled={loading}>
                      {step === 3 ? (loading ? 'Analyzing data...' : 'Generate AI Score') : 'Continue'}
                      {step < 3 && <ArrowRight size={16} />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ── RESULTS ── */}
          {activeTab === 'dashboard' && result && (
            <div className="dashboard animation-fade-in" ref={dashboardRef}>
              {/* Score Card */}
              <div className="glass-panel score-card">
                <h2>AI Health Score</h2>
                <ScoreRing score={result.overall_score} status={result.health_status} />
                <div className="score-meta">
                  {[
                    { label: 'Cash Flow (AA)', val: `${result.metrics.cash_flow_health}/100` },
                    { label: 'GST Score', val: `${result.metrics.gst_compliance}/100` },
                    { label: 'EPFO Stability', val: `${result.metrics.epfo_stability}/100` },
                    { label: 'UPI Volume', val: `${result.metrics.upi_volume}/100` },
                  ].map(r => (
                    <div className="score-meta-row" key={r.label}>
                      <span className="score-meta-label">{r.label}</span>
                      <span className="score-meta-val">{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="metrics-grid">
                {[
                  { label: 'Cash Flow Health', icon: <Activity size={14} />, val: result.metrics.cash_flow_health, color: 'linear-gradient(90deg, var(--accent), #00a884)' },
                  { label: 'GST Compliance', icon: <ShieldCheck size={14} />, val: result.metrics.gst_compliance, color: 'linear-gradient(90deg, var(--accent-blue), #2d6af5)' },
                  { label: 'EPFO Stability', icon: <Users size={14} />, val: result.metrics.epfo_stability, color: 'linear-gradient(90deg, var(--warning), #d97706)' },
                  { label: 'UPI Volume', icon: <TrendingUp size={14} />, val: result.metrics.upi_volume, color: 'linear-gradient(90deg, var(--accent-purple), #7c3aed)' },
                ].map(m => (
                  <div className="glass-panel metric-card" key={m.label}>
                    <div className="metric-header">
                      <span className="metric-title">{m.icon} {m.label}</span>
                    </div>
                    <div className="metric-val">{m.val}<span className="metric-sub">/100</span></div>
                    <MetricBar value={m.val} color={m.color} />
                  </div>
                ))}
              </div>

              {/* XAI Section */}
              <div className="glass-panel full-width-panel">
                <h3 className="panel-header">
                  <Brain size={18} /> Explainable AI — SHAP Feature Analysis
                  <span className="panel-badge">XAI Powered</span>
                </h3>
                <div className="xai-list">
                  {result.xai_explanations.map((x, i) => (
                    <div className="xai-item" key={i}>
                      <span className={`xai-impact ${x.impact > 0 ? 'positive' : 'negative'}`}>
                        {x.impact > 0 ? '+' : ''}{x.impact}%
                      </span>
                      <div className="xai-bar-wrap">
                        <div className={`xai-bar ${x.impact > 0 ? 'positive' : 'negative'}`}
                          style={{ width: `${Math.min(Math.abs(x.impact) * 3, 100)}%` }} />
                      </div>
                      <span className="xai-text"><strong>{x.feature}: </strong>{x.message}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geo-Spatial Map */}
              <div className="glass-panel full-width-panel">
                <h3 className="panel-header">
                  <Network size={18} /> Geo-Spatial Supply Chain Network
                  <span className="panel-badge">GST Ecosystem</span>
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Geographical concentration risk of top 3 buyers (green) and suppliers (red) sourced from GST invoice data.
                </p>
                <SupplyChainMap supplyChain={result.supply_chain} msmeName={formData.businessName} />
                <table className="sc-table">
                  <thead>
                    <tr>
                      <th>Enterprise</th>
                      <th>Type</th>
                      <th>Monthly Volume</th>
                      <th>Coordinates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.supply_chain.map((n, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{n.name}</td>
                        <td><span className={`sc-badge ${n.type.toLowerCase()}`}>{n.type}</span></td>
                        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{(n.volume / 100000).toFixed(1)}L / mo</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{n.lat.toFixed(2)}°N, {n.lng.toFixed(2)}°E</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {activeTab === 'history' && (
            <HistoryPanel userId={user.uid} onViewResult={a => {
              setFormData({ businessName: a.businessName, gstin: a.gstin, udyam_reg: a.udyam_reg || '', upi_vpa: '', consent_id: '', epfo_reg_no: '' });
              setResult(a.result);
              setActiveTab('dashboard');
            }} />
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && <SettingsPanel userId={user.uid} />}
        </div>
      </main>
    </div>
  );
}
