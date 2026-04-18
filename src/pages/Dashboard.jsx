import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  TrendingUp,
  Shield,
  CheckCircle,
  AlertTriangle,
  Map as MapIcon,
  ChevronRight,
  MessageSquare,
  Send
} from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollReveal from '../components/ScrollReveal';
import { useTranslation } from 'react-i18next';
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

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MUMBAI_CENTER = [19.076, 72.8777];

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: '0%' });
  const [suggestion, setSuggestion] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) return;
    setSubmittingNote(true);
    try {
      await addDoc(collection(db, 'suggestions'), {
        text: suggestion,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        createdAt: serverTimestamp(),
        status: 'pending'
      });
      alert(t('dashboard.suggestion.success'));
      setSuggestion('');
    } catch (err) {
      console.error("Suggestion error:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

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

  const riskDistribution = useMemo(() => {
    const counts = { safe: 0, watch: 0, high: 0, critical: 0 };
    reports.forEach(r => {
      if (r.score > 80) counts.critical++;
      else if (r.score > 60) counts.high++;
      else if (r.score > 40) counts.watch++;
      else counts.safe++;
    });

    // Default to placeholders if no data, but label as 'No Data'
    const total = reports.length || 1;
    return [
      (counts.safe / total) * 100 || 100,
      (counts.watch / total) * 100 || 0,
      (counts.high / total) * 100 || 0,
      (counts.critical / total) * 100 || 0
    ];
  }, [reports]);

  const systemHealth = useMemo(() => {
    if (reports.length === 0) return '100%';
    const criticals = reports.filter(r => r.score > 80).length;
    return `${Math.max(0, 100 - (criticals * 5))}%`;
  }, [reports]);

  const chartData = {
    labels: [t('dashboard.sentiment.safeLabel'), t('dashboard.sentiment.watchLabel'), t('dashboard.sentiment.highLabel'), t('dashboard.sentiment.criticalLabel')],
    datasets: [{
      data: riskDistribution,
      backgroundColor: ['#36B37E', '#FFAB00', '#FF8B00', '#FF5630'],
      borderWidth: 0,
    }]
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
      <div className="container" style={{ padding: '60px 0' }}>
        <ScrollReveal direction="up" duration={0.6}>
          <header style={{ marginBottom: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '48px', marginBottom: '8px', letterSpacing: '-1px' }}> {t('dashboard.header.title')}</h1>
              <p style={{ fontSize: '18px', color: 'var(--text-muted)' }}>{t('dashboard.header.subtitle')}</p>
            </div>
            <div className="pill pill-blue" style={{ height: 'fit-content' }}>
              <TrendingUp size={12} /> {t('dashboard.header.health')}: {systemHealth}
            </div>
          </header>
        </ScrollReveal>

        {/* Top Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '60px' }}>
          <ScrollReveal direction="up" delay={0.1}>
            <StatBox icon={<Shield color="var(--primary)" />} label={t('dashboard.stats.total')} value={stats.total} bg="#deebff" />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <StatBox icon={<AlertTriangle color="var(--critical)" />} label={t('dashboard.stats.high')} value={stats.high} bg="#ffebe6" />
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <StatBox icon={<CheckCircle color="var(--safe)" />} label={t('dashboard.stats.resolved')} value={stats.resolved} bg="#e3fcef" />
          </ScrollReveal>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px' }}>
          {/* Main Map Visualization */}
          <ScrollReveal direction="left" delay={0.4}>
            <div className="card" style={{ padding: 0, position: 'relative', overflow: 'hidden', height: '600px', border: '1px solid #e2e8f0' }}>
              <MapContainer
                center={MUMBAI_CENTER}
                zoom={11}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                scrollWheelZoom={false}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {reports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[report.location?.lat || 19.076, report.location?.lng || 72.8777]}
                    icon={defaultIcon}
                  >
                    <Popup>
                      <div style={{ padding: '4px' }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>{report.type}</strong>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{report.displayAddress}</span>
                        <div style={{ marginTop: '8px', fontWeight: 700, color: report.color, fontSize: '12px' }}>
                          {t('dashboard.map.risk')}: {report.score}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>

              <div style={{ position: 'absolute', bottom: 30, left: 30, zIndex: 1000, pointerEvents: 'none' }}>
                <div className="glass" style={{ padding: '20px 24px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '4px', color: '#1e293b' }}>{t('dashboard.map.title')}</h2>
                  <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{t('dashboard.map.subtitle')}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Right Sidebar: Analytics & Lists */}
          <div style={{ display: 'grid', gap: '32px' }}>
            <ScrollReveal direction="right" delay={0.5}>
              <div className="card">
                <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '24px', letterSpacing: '1px' }}>{t('dashboard.sentiment.title')}</h3>
                <div style={{ maxWidth: '200px', margin: '0 auto' }}>
                  <Pie data={chartData} options={{ plugins: { legend: { display: false } } }} />
                </div>
                <div style={{ marginTop: '24px', display: 'grid', gap: '12px' }}>
                  <LegendRow color="#36B37E" label={t('dashboard.sentiment.safe')} value={`${Math.round(riskDistribution[0])}%`} />
                  <LegendRow color="#FFAB00" label={t('dashboard.sentiment.watch')} value={`${Math.round(riskDistribution[1])}%`} />
                  <LegendRow color="#FF5630" label={t('dashboard.sentiment.critical')} value={`${Math.round(riskDistribution[3])}%`} />
                </div>
              </div>
            </ScrollReveal>

            {/* NEW: Suggestion Box */}
            <ScrollReveal direction="right" delay={0.6}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <MessageSquare size={18} color="var(--primary)" />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>{t('dashboard.suggestion.title')}</h3>
                </div>
                <p style={{ fontSize: '13px', color: '#475569', marginBottom: '16px', lineHeight: 1.5 }}>
                  {t('dashboard.suggestion.subtitle')}
                </p>
                <textarea
                  placeholder={t('dashboard.suggestion.placeholder')}
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '14px',
                    minHeight: '100px',
                    marginBottom: '12px',
                    resize: 'none',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
                <button
                  onClick={handleSuggestionSubmit}
                  disabled={submittingNote || !suggestion.trim()}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', opacity: (submittingNote || !suggestion.trim()) ? 0.6 : 1 }}
                >
                  {submittingNote ? t('dashboard.suggestion.submitting') : <><Send size={14} style={{ marginRight: '6px' }} /> {t('dashboard.suggestion.submit')}</>}
                </button>
              </div>
            </ScrollReveal>
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
