import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { History, Trash2, Eye } from 'lucide-react';
import './HistoryPanel.css';

const statusColor = s => ({ Excellent: 'var(--accent)', Good: 'var(--accent-blue)', Fair: 'var(--warning)', 'High Risk': 'var(--danger)' }[s] || 'var(--text-secondary)');
const statusBg   = s => ({ Excellent: 'rgba(0,212,170,0.12)', Good: 'rgba(74,158,255,0.12)', Fair: 'rgba(245,158,11,0.12)', 'High Risk': 'rgba(239,68,68,0.12)' }[s] || 'rgba(255,255,255,0.06)');

export default function HistoryPanel({ userId, onViewResult }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, [userId]);

  const loadHistory = async () => {
    let resolved = false;
    setTimeout(() => { if (!resolved) setLoading(false); }, 2000);
    try {
      const q = query(collection(db, 'assessments'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      resolved = true;
      setAssessments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Firestore history load failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Permanently delete this assessment?')) return;
    try {
      await deleteDoc(doc(db, 'assessments', id));
      setAssessments(p => p.filter(a => a.id !== id));
    } catch (err) { console.error('Delete failed:', err); }
  };

  if (loading) return <div className="history-loading">Loading assessment history...</div>;

  const eligible = assessments.filter(a => ['Excellent', 'Good'].includes(a.result?.health_status)).length;
  const highRisk = assessments.filter(a => a.result?.health_status === 'High Risk').length;

  return (
    <div className="history-container">
      {/* Stats */}
      <div className="history-stats-bar">
        <div className="glass-panel stat-card">
          <span className="stat-card-label">Total Assessments</span>
          <span className="stat-card-value blue">{assessments.length}</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-card-label">Credit Eligible</span>
          <span className="stat-card-value green">{eligible}</span>
        </div>
        <div className="glass-panel stat-card">
          <span className="stat-card-label">High Risk Flagged</span>
          <span className="stat-card-value red">{highRisk}</span>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="glass-panel no-data">
          <div className="no-data-icon"><History size={28} color="var(--text-muted)" /></div>
          <h3>No Assessments Yet</h3>
          <p>Run your first MSME financial health assessment from "New Assessment" to see records here.</p>
        </div>
      ) : (
        <div className="history-list">
          {assessments.map(a => (
            <div className="glass-panel history-row" key={a.id} onClick={() => onViewResult(a)}>
              <div className="history-row-left">
                <div className="score-badge" style={{ background: statusBg(a.result?.health_status), color: statusColor(a.result?.health_status) }}>
                  {a.result?.overall_score ?? '—'}
                </div>
                <div className="history-info">
                  <h4>{a.businessName || 'Unnamed Enterprise'}</h4>
                  <div className="history-meta">
                    <span>{a.gstin}</span>
                    <span className="meta-dot" />
                    <span>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="meta-dot" />
                    <span>{new Date(a.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="history-row-right">
                <span className="status-pill" style={{ background: statusBg(a.result?.health_status), color: statusColor(a.result?.health_status) }}>
                  {a.result?.health_status || 'Unknown'}
                </span>
                <button className="icon-btn view" onClick={e => { e.stopPropagation(); onViewResult(a); }} title="View Report"><Eye size={15} /></button>
                <button className="icon-btn delete" onClick={e => handleDelete(a.id, e)} title="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
