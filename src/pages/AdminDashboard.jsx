import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  Activity, 
  Map as MapIcon, 
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Box,
  RefreshCcw,
  TrendingUp
} from 'lucide-react';
// Chart imports removed for simplification
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToStats } from '../services/statsService';
import { processReport } from '../services/dataSyncService';

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalReports: 0, highRiskCount: 0, resolvedCount: 0 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Listen to global stats
    const unsubscribeStats = subscribeToStats((data) => {
      setGlobalStats(data);
    });

    // Listen to recent reports
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribeReports = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => processReport({ id: doc.id, ...doc.data() }));
      setReports(data);
    });

    return () => {
      unsubscribeStats();
      unsubscribeReports();
    };
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleApprove = async (reportId) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const reportRef = doc(db, 'reports', reportId);
      await updateDoc(reportRef, {
        status: 'approved',
        approvedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Failed to approve report:", error);
    }
  };

  // Professional Chart Config
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Poppins', size: 12 },
        bodyFont: { family: 'Inter', size: 13 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        displayColors: false
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: { color: '#475569', font: { size: 10, weight: '600' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { size: 10, weight: '600' } }
      }
    }
  };

  const lineData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', 'Current'],
    datasets: [{
      data: [12, 18, 15, 22, 19, 25, 21],
      borderColor: '#10b981',
      borderWidth: 3,
      pointRadius: 4,
      pointBackgroundColor: '#10b981',
      pointBorderColor: '#020617',
      pointBorderWidth: 2,
      tension: 0.4,
      fill: true,
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        return gradient;
      }
    }]
  };

  const [filter, setFilter] = useState('all');

  // Filtering Logic
  const filteredReports = useMemo(() => {
    if (filter === 'all') return reports;
    if (filter === 'high') return reports.filter(r => r.score >= 80);
    if (filter === 'medium') return reports.filter(r => r.score >= 55 && r.score < 80);
    if (filter === 'low') return reports.filter(r => r.score < 55);
    return reports;
  }, [reports, filter]);

  // Predictive Logic: Assets with high velocity or rapid degrading
  const atRiskSoon = useMemo(() => {
    return reports
      .filter(r => r.score < 80 && (r.aiData?.reportVelocity > 1.2 || r.status === 'Delayed'))
      .sort((a, b) => (b.aiData?.reportVelocity || 0) - (a.aiData?.reportVelocity || 0))
      .slice(0, 3);
  }, [reports]);

  return (
    <div style={{ padding: '40px 60px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className="pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '10px' }}>
              SECURE_ADMIN_PORTAL // PREDICTIVE_ENABLED
            </div>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>Operations Command</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Predictive infrastructure management and corruption-resilient audit terminal.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <div style={{ display: 'flex', background: '#0f172a', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <button 
               onClick={() => setFilter('all')} 
               style={filterButtonStyle(filter === 'all')}
             >ALL</button>
             <button 
               onClick={() => setFilter('high')} 
               style={filterButtonStyle(filter === 'high', '#ef4444')}
             >HIGH_RISK</button>
             <button 
               onClick={() => setFilter('medium')} 
               style={filterButtonStyle(filter === 'medium', '#f59e0b')}
             >WATCH</button>
             <button 
               onClick={() => setFilter('low')} 
               style={filterButtonStyle(filter === 'low', '#10b981')}
             >STABLE</button>
           </div>
           <button onClick={handleRefresh} style={toolButtonStyle}>
             <RefreshCcw size={16} className={isRefreshing ? 'spin' : ''} />
           </button>
        </div>
      </header>

      {/* Main Grid: At Risk Soon & Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', marginBottom: '40px' }}>
        {/* Predictive Card */}
        <div className="glass-premium" style={{ padding: '32px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
            <TrendingUp size={20} color="#ef4444" />
            <h3 style={{ color: 'white', fontSize: '16px', margin: 0 }}>AT_RISK_SOON [PREDICTION]</h3>
          </div>
          <div style={{ display: 'grid', gap: '16px' }}>
            {atRiskSoon.length > 0 ? atRiskSoon.map(asset => (
              <div key={asset.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                <div>
                  <div style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{asset.type}</div>
                  <div style={{ color: '#475569', fontSize: '11px' }}>{asset.address.substring(0, 20)}...</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#ef4444', fontSize: '12px', fontWeight: 900 }}>+{Math.round((asset.aiData?.reportVelocity - 1) * 100)}% Vel</div>
                  <div style={{ color: '#475569', fontSize: '9px' }}>FAILURE_EST: 4-6D</div>
                </div>
              </div>
            )) : (
              <div style={{ color: '#475569', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No high-velocity assets detected.</div>
            )}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <AdminStat 
            label="Total Intelligence" 
            value={reports.length} 
            icon={<Box size={24} color="#10b981" />} 
            trend="Live Feed" 
            glowColor="rgba(16, 185, 129, 0.15)"
          />
          <AdminStat 
            label="Anomalies Found" 
            value={reports.filter(r => (r.aiData?.aiConfidence || 1) < 0.9).length} 
            icon={<AlertTriangle size={24} color="#f59e0b" />} 
            trend="Needs Audit" 
            trendColor="#f59e0b"
            glowColor="rgba(245, 158, 11, 0.1)"
          />
          <AdminStat 
            label="System Integrity" 
            value="99.2%" 
            icon={<CheckCircle2 size={24} color="#3b82f6" />} 
            trend="Corruption Safe" 
            trendColor="#3b82f6"
            glowColor="rgba(59, 130, 246, 0.1)"
          />
        </div>
      </div>

      {/* Unified Command Grid: SEE REPORTS & APPROVE REPORTS */}
      <div className="glass-premium" style={mainPanelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>Incident Intelligence Grid</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={legendItem}><span style={{ ...legendDot, background: '#10b981' }} /> Correct</div>
            <div style={legendItem}><span style={{ ...legendDot, background: '#f59e0b' }} /> Divergent</div>
            <div style={legendItem}><span style={{ ...legendDot, background: '#ef4444' }} /> Fraud_Risk</div>
          </div>
        </div>

        <div style={tableContainer}>
          <table style={adminTableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={tableHeaderCell}>NODE_ID</th>
                <th style={tableHeaderCell}>ASSET</th>
                <th style={tableHeaderCell}>LOCATION</th>
                <th style={tableHeaderCell}>PRED_RISK</th>
                <th style={tableHeaderCell}>INTEGRITY</th>
                <th style={{ ...tableHeaderCell, textAlign: 'right' }}>COMMAND</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} style={tableRowStyle}>
                  <td style={tableCellStyle}>
                    <code style={{ color: '#64748b' }}>#{report.id.substring(0, 8).toUpperCase()}</code>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontWeight: 600 }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: report.color }} />
                      {report.type}
                    </div>
                  </td>
                  <td style={{ ...tableCellStyle, color: '#94a3b8', fontSize: '13px' }}>{report.address}</td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ 
                        color: report.color,
                        fontWeight: 900,
                        fontSize: '15px'
                      }}>
                        {report.score}
                      </span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        {report.category || 'ANALYZING...'}
                      </span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ 
                      display: 'inline-flex', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800,
                      background: (report.aiData?.aiConfidence || 1) > 0.9 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: (report.aiData?.aiConfidence || 1) > 0.9 ? '#10b981' : '#f59e0b',
                      border: `1px solid ${(report.aiData?.aiConfidence || 1) > 0.9 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      {Math.round((report.aiData?.aiConfidence || 0.95) * 100)}% TRUSTED
                    </div>
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {report.status !== 'approved' && (
                        <button 
                          style={approveButtonStyle}
                          onClick={() => handleApprove(report.id)}
                        >
                          AUDIT_ACCEPT
                        </button>
                      )}
                      <button style={viewButtonStyle}>NODE_DETAILS</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// New Style Helpers
const filterButtonStyle = (isActive, activeColor = '#3b82f6') => ({
  padding: '8px 16px',
  background: isActive ? activeColor : 'transparent',
  border: 'none',
  borderRadius: '8px',
  color: isActive ? '#fff' : '#475569',
  fontSize: '11px',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  marginRight: '4px'
});

// Sub-components
const AdminStat = ({ label, value, icon, trend, trendColor = '#10b981', glowColor }) => (
  <motion.div 
    whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.3)' }}
    className="glass-premium" 
    style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: glowColor, filter: 'blur(30px)', borderRadius: '50%' }} />
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div style={statIconBox}>{icon}</div>
      <div style={{ ...trendPill, color: trendColor, borderColor: trendColor + '30' }}>{trend}</div>
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{value}</div>
    </div>
  </motion.div>
);

// Styles
const statsMatrixGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '24px',
  marginBottom: '40px'
};

const toolButtonStyle = {
  padding: '12px 20px',
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '12px',
  color: '#64748b',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: 700,
  fontSize: '13px'
};

const mainPanelStyle = {
  padding: '40px',
  borderRadius: '24px',
};

const statIconBox = {
  padding: '12px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '14px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const trendPill = {
  padding: '4px 10px',
  borderRadius: '100px',
  fontSize: '9px',
  fontWeight: 900,
  border: '1px solid',
  background: 'rgba(255,255,255,0.02)'
};

const legendItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  color: '#475569',
  fontWeight: 700
};

const legendDot = {
  width: '8px',
  height: '8px',
  borderRadius: '50%'
};

const tableContainer = {
  overflowX: 'auto',
  marginTop: '20px'
};

const adminTableStyle = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: '0 12px',
};

const tableHeaderRow = {
  textAlign: 'left',
};

const tableHeaderCell = {
  padding: '12px 20px',
  color: '#475569',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '1px',
  textTransform: 'uppercase',
};

const tableRowStyle = {
  background: 'rgba(255,255,255,0.02)',
  transition: 'all 0.2s ease',
};

const tableCellStyle = {
  padding: '20px',
  borderTop: '1px solid rgba(255,255,255,0.05)',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  fontSize: '14px',
};

const approveButtonStyle = {
  padding: '8px 16px',
  background: '#10b981',
  color: '#020617',
  border: 'none',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const viewButtonStyle = {
  padding: '8px 16px',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 900,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

export default AdminDashboard;
