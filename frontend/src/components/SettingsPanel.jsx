import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Settings, Save, Shield, Globe, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';
import './SettingsPanel.css';

const DEFAULT_SETTINGS = {
  bankName: '',
  branchCode: '',
  approvalThreshold: 75,
  rejectionThreshold: 35,
  cashFlowWeight: 40,
  gstWeight: 30,
  epfoWeight: 15,
  upiWeight: 15,
  aaEndpoint: 'https://api.sahamati.org.in/v2',
  gstnEndpoint: 'https://gsp.adaequare.com',
  epfoEndpoint: 'https://unifiedportal-mem.epfindia.gov.in/api',
  maxCreditLimit: 5000000,
  autoApprovalEnabled: false,
};

export default function SettingsPanel({ userId }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', userId));
        if (snap.exists()) {
          setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
      setLoaded(true);
    };
    if (userId) loadSettings();
  }, [userId]);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', userId), { ...settings, updatedAt: new Date().toISOString() });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save settings. Check Firestore permissions.');
    }
    setSaving(false);
  };

  if (!loaded) return <div className="settings-loading">Loading settings...</div>;

  return (
    <div className="settings-container animation-fade-in">
      {/* Bank Identity */}
      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <Shield size={20} />
          <h3>Bank & Branch Identity</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>Bank / NBFC Name</label>
            <input type="text" value={settings.bankName} onChange={e => handleChange('bankName', e.target.value)} placeholder="e.g. State Bank of India" />
          </div>
          <div className="setting-field">
            <label>Branch Code / IFSC</label>
            <input type="text" value={settings.branchCode} onChange={e => handleChange('branchCode', e.target.value)} placeholder="e.g. SBIN0001234" />
          </div>
        </div>
      </div>

      {/* AI Risk Thresholds */}
      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <Sliders size={20} />
          <h3>AI Risk Appetite Configuration</h3>
        </div>
        <div className="slider-group">
          <div className="slider-item">
            <div className="slider-label">
              <span>Auto-Approval Threshold</span>
              <span className="slider-value good">{settings.approvalThreshold}</span>
            </div>
            <input type="range" min="50" max="100" value={settings.approvalThreshold} onChange={e => handleChange('approvalThreshold', Number(e.target.value))} />
            <p className="slider-hint">Enterprises scoring above this are flagged for fast-track approval.</p>
          </div>
          <div className="slider-item">
            <div className="slider-label">
              <span>High-Risk Rejection Threshold</span>
              <span className="slider-value danger">{settings.rejectionThreshold}</span>
            </div>
            <input type="range" min="10" max="60" value={settings.rejectionThreshold} onChange={e => handleChange('rejectionThreshold', Number(e.target.value))} />
            <p className="slider-hint">Enterprises below this are auto-flagged as high risk for manual review.</p>
          </div>
        </div>
        <div className="toggle-row">
          <label className="toggle-label">
            <span>Enable Auto-Approval for scores above threshold</span>
            <div className={`toggle ${settings.autoApprovalEnabled ? 'on' : ''}`} onClick={() => handleChange('autoApprovalEnabled', !settings.autoApprovalEnabled)}>
              <div className="toggle-knob" />
            </div>
          </label>
        </div>
        <div className="slider-item">
          <div className="slider-label">
            <span>Maximum Credit Limit (₹)</span>
            <span className="slider-value">₹{(settings.maxCreditLimit / 100000).toFixed(0)}L</span>
          </div>
          <input type="range" min="100000" max="50000000" step="100000" value={settings.maxCreditLimit} onChange={e => handleChange('maxCreditLimit', Number(e.target.value))} />
        </div>
      </div>

      {/* ML Model Weights */}
      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <AlertTriangle size={20} />
          <h3>ML Feature Weights (Must sum to 100)</h3>
        </div>
        <div className="weights-grid">
          {[
            { key: 'cashFlowWeight', label: 'Cash Flow (AA)', color: 'var(--accent-color)' },
            { key: 'gstWeight', label: 'GST Compliance', color: 'var(--success-color)' },
            { key: 'epfoWeight', label: 'EPFO Stability', color: 'var(--warning-color)' },
            { key: 'upiWeight', label: 'UPI Volume', color: '#a371f7' },
          ].map(w => (
            <div className="weight-item" key={w.key}>
              <div className="weight-label">
                <span>{w.label}</span>
                <span style={{ color: w.color, fontWeight: 700 }}>{settings[w.key]}%</span>
              </div>
              <input type="range" min="5" max="60" value={settings[w.key]} onChange={e => handleChange(w.key, Number(e.target.value))} style={{ accentColor: w.color }} />
            </div>
          ))}
          <div className="weight-total">
            Total: <strong style={{ color: (settings.cashFlowWeight + settings.gstWeight + settings.epfoWeight + settings.upiWeight) === 100 ? 'var(--success-color)' : 'var(--danger-color)' }}>
              {settings.cashFlowWeight + settings.gstWeight + settings.epfoWeight + settings.upiWeight}%
            </strong> / 100%
          </div>
        </div>
      </div>

      {/* Integration Endpoints */}
      <div className="glass-panel settings-card">
        <div className="settings-card-header">
          <Globe size={20} />
          <h3>DPI Integration Endpoints</h3>
        </div>
        <div className="settings-grid">
          <div className="setting-field">
            <label>Account Aggregator API (Sahamati)</label>
            <input type="text" value={settings.aaEndpoint} onChange={e => handleChange('aaEndpoint', e.target.value)} />
          </div>
          <div className="setting-field">
            <label>GSTN API (GSP Provider)</label>
            <input type="text" value={settings.gstnEndpoint} onChange={e => handleChange('gstnEndpoint', e.target.value)} />
          </div>
          <div className="setting-field">
            <label>EPFO Unified Portal API</label>
            <input type="text" value={settings.epfoEndpoint} onChange={e => handleChange('epfoEndpoint', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="save-bar">
        <button className="submit-btn save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? <><CheckCircle2 size={18} /> Saved Successfully!</> : <><Save size={18} /> Save All Settings</>}
        </button>
      </div>
    </div>
  );
}
