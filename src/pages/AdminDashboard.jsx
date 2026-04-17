import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  BarChart3, 
  Activity, 
  Map as MapIcon, 
  Truck, 
  Settings, 
  AlertCircle,
  Clock,
  ExternalLink,
  Filter
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const AdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(15));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data);
    });
    return unsubscribe;
  }, []);

  const lineData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Risk Activity',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ background: '#0f172a', minHeight: '100vh', color: 'white', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', borderRight: '1px solid #1e293b', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Activity color="var(--primary)" size={28} />
          <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>Admin Panel</span>
        </div>

        <nav style={{ display: 'grid', gap: '8px' }}>
          <SidebarLink active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 size={18}/>} label="System Overview" />
          <SidebarLink active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={18}/>} label="Asset Map" />
          <SidebarLink active={activeTab === 'fleet'} onClick={() => setActiveTab('fleet')} icon={<Truck size={18}/>} label="Fleet Management" />
          <SidebarLink active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={18}/>} label="Core Parameters" />
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <div className="card" style={{ background: '#1e293b', border: 'none', padding: '1.5rem' }}>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>Server Status</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94a3b8' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              Operational (Stable)
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '3rem', maxHeight: '100vh', overflowY: 'auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div>
            <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '4px' }}>Infrastructure Command</h1>
            <p style={{ color: '#94a3b8' }}>Real-time monitoring of municipal assets and risk profiles.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={toolButtonStyle}><Filter size={16} /> Filters</button>
            <button style={toolButtonStyle}><Clock size={16} /> Refresh</button>
          </div>
        </header>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
          <AdminStat label="Total Assets" value="12,482" trend="+2.4%" />
          <AdminStat label="High Risk" value="48" trend="-12%" trendColor="#10b981" />
          <AdminStat label="Active Units" value="156" trend="+8" />
          <AdminStat label="Resolved Today" value="34" trend="100%" />
        </div>

        {/* Charts & Lists */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
          <div className="card" style={{ background: '#1e293b', border: 'none', padding: '2rem' }}>
            <h3 style={{ color: 'white', marginBottom: '2rem' }}>Real-time Risk Index</h3>
            <div style={{ height: '300px' }}>
              <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { grid: { color: '#334155' } }, x: { grid: { display: false } } } }} />
            </div>
          </div>

          <div className="card" style={{ background: '#1e293b', border: 'none', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ color: 'white', margin: 0 }}>Incident Queue</h3>
              <ExternalLink size={16} color="#94a3b8" />
            </div>
            <div style={{ display: 'grid', gap: '12px' }}>
              {reports.map((report) => (
                <div key={report.id} style={incidentRowStyle}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{report.type}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{report.id.substring(0, 8)} • {new Date(report.createdAt?.seconds * 1000).toLocaleTimeString()}</div>
                  </div>
                  <div style={{ 
                    background: report.score > 70 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: report.score > 70 ? '#ef4444' : '#f59e0b',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 700
                  }}>
                    {report.score}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
      color: active ? 'var(--primary)' : '#94a3b8',
      fontWeight: 600,
      fontSize: '14px',
      width: '100%',
      textAlign: 'left'
    }}
  >
    {icon} {label}
  </button>
);

const AdminStat = ({ label, value, trend, trendColor = '#3b82f6' }) => (
  <div className="card" style={{ background: '#1e293b', border: 'none', padding: '24px' }}>
    <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color: 'white' }}>{value}</div>
      <div style={{ fontSize: '12px', fontWeight: 700, color: trendColor }}>{trend}</div>
    </div>
  </div>
);

const toolButtonStyle = {
  background: '#1e293b',
  border: '1px solid #334155',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 500
};

const incidentRowStyle = {
  padding: '12px',
  background: '#0f172a',
  borderRadius: '8px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export default AdminDashboard;
