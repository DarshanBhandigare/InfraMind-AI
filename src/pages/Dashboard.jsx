import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Map as MapIcon,
  ChevronRight
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

import { subscribeToStats, initializeStats } from '../services/statsService';

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: '0%' });

  useEffect(() => {
    // 1. Ensure stats document exists
    initializeStats();

    // 2. Subscribe to global stats
    const unsubscribeStats = subscribeToStats((data) => {
      const resolvedPct = data.totalReports > 0 
        ? Math.round((data.resolvedCount / data.totalReports) * 100) 
        : 0;
        
      setStats({
        total: data.totalReports,
        high: data.highRiskCount,
        resolved: `${resolvedPct}%`
      });
    });

    // 3. Subscribe to recent reports
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribeReports = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => processReport({ id: doc.id, ...doc.data() }));
      setReports(data);
    });

    return () => {
      unsubscribeStats();
      unsubscribeReports();
    };
  }, []);

  const chartData = {
    labels: ['Safe', 'Watch', 'High', 'Critical'],
    datasets: [{
      data: [65, 20, 10, 5],
      backgroundColor: ['#36B37E', '#FFAB00', '#FF8B00', '#FF5630'],
      borderWidth: 0,
    }]
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
      <div className="container" style={{ padding: '60px 0' }}>
        <header style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '48px', marginBottom: '8px', letterSpacing: '-1px' }}>Fleet Command</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Real-time metropolitan infrastructure overview.</p>
          </div>
          <div className="pill pill-blue" style={{ height: 'fit-content' }}>
            <TrendingUp size={12} /> System Health: 98.4%
          </div>
        </header>

        {/* Top Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
          <StatBox icon={<Shield color="var(--primary)"/>} label="Total Issues" value={stats.total} bg="#deebff" />
          <StatBox icon={<AlertTriangle color="var(--critical)"/>} label="High Risk Zones" value={stats.high} bg="#ffebe6" />
          <StatBox icon={<CheckCircle color="var(--safe)"/>} label="Resolved Issues" value={stats.resolved} bg="#e3fcef" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
          {/* Main Map Visualization */}
          <div className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden', height: '600px' }}>
             <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=1200" alt="Map" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.8}} />
             <div style={{ position:'absolute', bottom:40, left:40, right:40, display:'flex', justifyContent:'space-between', alignItems:'flex-end'}}>
               <div style={{ color:'var(--text)' }}>
                 <h2 style={{ fontSize:'32px', marginBottom:'8px' }}>Infrastructure Health Map</h2>
                 <p style={{ color:'var(--text-muted)', fontSize:'16px' }}>Metropolitan grid sensor data and report heatmaps.</p>
               </div>
               <button className="btn-primary" style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                 Full Screen Map <MapIcon size={18} />
               </button>
             </div>
          </div>

          {/* Right Sidebar: Analytics & Lists */}
          <div style={{ display: 'grid', gap: '32px' }}>
            <div className="card">
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '24px', letterSpacing: '1px' }}>Risk Sentiment</h3>
              <div style={{ maxWidth: '240px', margin: '0 auto' }}>
                <Pie data={chartData} options={{ plugins: { legend: { display: false } } }} />
              </div>
              <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                 <LegendRow color="#36B37E" label="Safe Zones" value="65%" />
                 <LegendRow color="#FFAB00" label="Watch Required" value="20%" />
                 <LegendRow color="#FF5630" label="Critical Response" value="15%" />
              </div>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '24px', letterSpacing: '1px' }}>Priority Queue</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {reports.slice(0, 4).map(report => (
                  <div key={report.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{report.type}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{report.address || 'Incoming...'}</div>
                    </div>
                    <div style={{ color: report.color, fontWeight: 800 }}>{report.score}</div>
                  </div>
                ))}
              </div>
              <button style={{ width: '100%', marginTop: '20px', fontSize: '12px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                View Full Queue <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, label, value, bg }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '40px' }}>
    <div style={{ padding: '12px', borderRadius: '12px', background: bg }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '40px', fontWeight: 800 }}>{value}</div>
    </div>
  </div>
);

const LegendRow = ({ color, label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
      <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
    <span style={{ fontWeight: 700 }}>{value}</span>
  </div>
);

export default Dashboard;
