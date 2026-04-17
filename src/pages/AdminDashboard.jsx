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
  RefreshCcw
} from 'lucide-react';
// Chart imports removed for simplification
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToStats } from '../services/statsService';
import { processReport } from '../services/dataSyncService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

  return (
    <div style={{ padding: '40px 60px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className="pill" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '10px' }}>
              SECURE_ADMIN_PORTAL
            </div>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>Report Management</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Verify and approve citizen-reported infrastructure incidents.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
           <button onClick={handleRefresh} style={toolButtonStyle}>
             <RefreshCcw size={16} className={isRefreshing ? 'spin' : ''} /> Refresh List
           </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div style={statsMatrixGrid}>
        <AdminStat 
          label="Total Submissions" 
          value={reports.length} 
          icon={<Box size={24} color="#10b981" />} 
          trend="Live" 
          glowColor="rgba(16, 185, 129, 0.15)"
        />
        <AdminStat 
          label="Pending Review" 
          value={reports.filter(r => r.status !== 'approved').length} 
          icon={<AlertTriangle size={24} color="#f59e0b" />} 
          trend="Action Needed" 
          trendColor="#f59e0b"
          glowColor="rgba(245, 158, 11, 0.1)"
        />
        <AdminStat 
          label="Approved Reports" 
          value={reports.filter(r => r.status === 'approved').length} 
          icon={<CheckCircle2 size={24} color="#3b82f6" />} 
          trend="Verified" 
          trendColor="#3b82f6"
          glowColor="rgba(59, 130, 246, 0.1)"
        />
      </div>

      {/* Unified Command Grid: SEE REPORTS & APPROVE REPORTS */}
      <div className="glass-premium" style={mainPanelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>Incident Command Queue</h3>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={legendItem}><span style={{ ...legendDot, background: '#10b981' }} /> Approved</div>
            <div style={legendItem}><span style={{ ...legendDot, background: '#f59e0b' }} /> Pending</div>
            <div style={legendItem}><span style={{ ...legendDot, background: '#ef4444' }} /> High Risk</div>
          </div>
        </div>

        <div style={tableContainer}>
          <table style={adminTableStyle}>
            <thead>
              <tr style={tableHeaderRow}>
                <th style={tableHeaderCell}>INCIDENT_ID</th>
                <th style={tableHeaderCell}>TYPE</th>
                <th style={tableHeaderCell}>LOCATION</th>
                <th style={tableHeaderCell}>RISK_SCORE</th>
                <th style={tableHeaderCell}>STATUS</th>
                <th style={{ ...tableHeaderCell, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
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
                    <span style={{ 
                      color: report.score > 70 ? '#ef4444' : (report.score > 40 ? '#f59e0b' : '#10b981'),
                      fontWeight: 800
                    }}>
                      {report.score} / 100
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ 
                      display: 'inline-flex', padding: '4px 12px', borderRadius: '100px', fontSize: '10px', fontWeight: 800,
                      background: report.status === 'approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: report.status === 'approved' ? '#10b981' : '#f59e0b',
                      border: `1px solid ${report.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                    }}>
                      {report.status?.toUpperCase() || 'PENDING'}
                    </div>
                  </td>
                  <td style={{ ...tableCellStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {report.status !== 'approved' && (
                        <button 
                          style={approveButtonStyle}
                          onClick={() => handleApprove(report.id)}
                        >
                          APPROVE
                        </button>
                      )}
                      <button style={viewButtonStyle}>DETAILS</button>
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
