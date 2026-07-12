import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { History, Trash2, Eye, FileDown } from 'lucide-react';
import './HistoryPanel.css';

export default function HistoryPanel({ userId, onViewResult }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'assessments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setAssessments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Failed to load history:', err);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this assessment?')) return;
    try {
      await deleteDoc(doc(db, 'assessments', id));
      setAssessments(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Excellent': return 'var(--success-color)';
      case 'Good': return 'var(--accent-color)';
      case 'Fair': return 'var(--warning-color)';
      default: return 'var(--danger-color)';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'Excellent': return 'rgba(46, 160, 67, 0.15)';
      case 'Good': return 'rgba(88, 166, 255, 0.15)';
      case 'Fair': return 'rgba(210, 153, 34, 0.15)';
      default: return 'rgba(248, 81, 73, 0.15)';
    }
  };

  if (loading) return <div className="history-loading">Loading assessment history...</div>;

  return (
    <div className="history-container animation-fade-in">
      <div className="glass-panel history-header-card">
        <div className="history-stats">
          <div className="stat-item">
            <span className="stat-value">{assessments.length}</span>
            <span className="stat-label">Total Assessments</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{color: 'var(--success-color)'}}>
              {assessments.filter(a => a.result?.health_status === 'Excellent' || a.result?.health_status === 'Good').length}
            </span>
            <span className="stat-label">Approved Eligible</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{color: 'var(--danger-color)'}}>
              {assessments.filter(a => a.result?.health_status === 'High Risk').length}
            </span>
            <span className="stat-label">High Risk</span>
          </div>
        </div>
      </div>

      {assessments.length === 0 ? (
        <div className="glass-panel no-data">
          <History size={48} color="var(--text-secondary)" />
          <h3>No Assessments Yet</h3>
          <p>Run your first MSME financial health assessment to see results here.</p>
        </div>
      ) : (
        <div className="history-list">
          {assessments.map(a => (
            <div className="glass-panel history-row" key={a.id}>
              <div className="history-row-left">
                <div className="history-score-badge" style={{ background: getStatusBg(a.result?.health_status), color: getStatusColor(a.result?.health_status) }}>
                  {a.result?.overall_score}
                </div>
                <div className="history-details">
                  <h4>{a.businessName || 'Unnamed Enterprise'}</h4>
                  <span className="history-meta">GSTIN: {a.gstin} · {new Date(a.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="history-row-right">
                <span className="status-pill" style={{ background: getStatusBg(a.result?.health_status), color: getStatusColor(a.result?.health_status) }}>
                  {a.result?.health_status}
                </span>
                <button className="icon-btn view" onClick={() => onViewResult(a)} title="View Report"><Eye size={16} /></button>
                <button className="icon-btn delete" onClick={() => handleDelete(a.id)} title="Delete"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
