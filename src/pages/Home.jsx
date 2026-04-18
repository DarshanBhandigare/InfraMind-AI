import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Play, Globe, CheckCircle, Activity, Zap, FileText, Bolt } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { subscribeToStats } from '../services/statsService';
import { processReport } from '../services/dataSyncService';
import ScrollReveal from '../components/ScrollReveal';

const Home = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({ total: 0, high: 0, resolved: '0%' });

  const [recentReports, setRecentReports] = useState([]);

  useEffect(() => {
    // Subscribe to live stats
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

    // Fetch 3 most recent reports
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(3));
    const unsubscribeReports = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => processReport({ id: doc.id, ...doc.data() }));
      setRecentReports(data);
    });

    return () => {
      unsubscribeStats();
      unsubscribeReports();
    };
  }, []);

  return (
    <div style={{ background: '#fff', overflow: 'hidden' }}>
      {/* Hero Section - Upgraded for WOW factor */}
      <section style={heroContainerStyle}>
        <div style={heroGradientOverlay} />
        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '100px', paddingBottom: '120px' }}>
          <div className="grid-2" style={{ alignItems: 'center', gap: '60px' }}>
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div style={premiumBadgeStyle}>
                <Zap size={14} fill="#60a5fa" color="#60a5fa" />
                <span>{t('hero.badge')}</span>
              </div>

              <h1 style={heroTitleStyle}>
                {t('hero.title.predict')} <br /> {t('hero.title.failure')} <br />
                <span style={{ color: 'var(--primary)', textShadow: '0 0 30px rgba(37, 99, 235, 0.2)' }}>
                  {t('hero.title.before')}
                </span>
              </h1>

              <p style={heroSubtitleStyle}>
                {t('hero.subtitle')}
              </p>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/report" style={ctaPrimaryStyle}>
                    {t('hero.submitReport')}
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/dashboard" style={ctaSecondaryStyle}>
                    {t('hero.liveCommand')} <ArrowRight size={18} />
                  </Link>
                </motion.div>

              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              style={{ position: 'relative' }}
            >
              <div style={heroImageContainerStyle}>
                <img
                  src="https://i.pinimg.com/736x/ac/90/a0/ac90a0358fbeb4d5dda3619fdf414a19.jpg"
                  alt="Bridge Construction"
                  style={heroImageStyle}
                />
                {/* Floating Glass Data Card */}
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="glass"
                  style={floatingCardStyle}
                >

                  <Bolt size={24} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t('hero.systemStatus')}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}> {t('hero.bridgeConstruction')}</div>
                  </div>

                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Real-time Stats Section */}
      <section style={{ padding: '100px 0', background: 'var(--surface)' }}>
        <div className="container">
          <ScrollReveal direction="up" delay={0.1}>
            <div style={statsGridStyle}>
              <StatCard label={t('home.stats.live')} value={stats.total} icon={<Shield color="var(--primary)" />} color="#deebff" />
              <StatCard label={t('home.stats.high')} value={stats.high} icon={<AlertTriangle color="var(--critical)" />} color="#ffebe6" />
              <StatCard label={t('home.stats.resolved')} value={stats.resolved} icon={<CheckCircle color="var(--safe)" />} color="#e3fcef" />
            </div>

          </ScrollReveal>

          <div className="grid-2" style={{ marginTop: '80px', gap: '40px' }}>
            {/* Map Preview */}
            <ScrollReveal direction="left" delay={0.2}>
              <div style={mapPreviewStyle}>
                <img src="https://i.pinimg.com/736x/17/85/f9/1785f9a5ffdb6e8070dc70579d1b044c.jpg" alt="Map" style={mapImageStyle} />
                <div style={mapOverlayStyle}>
                  <div>
                    <h3 style={{ color: 'white', fontSize: '28px', marginBottom: '8px' }}>{t('home.map.title')}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>{t('home.map.subtitle')}</p>
                  </div>
                  <Link to="/map" className="btn-primary" style={{ background: 'white', color: 'var(--text)', border: 'none' }}>{t('home.map.btn')}</Link>
                </div>

              </div>
            </ScrollReveal>

            {/* Live Feed */}
            <ScrollReveal direction="right" delay={0.3}>
              <div className="card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '20px' }}>{t('home.feed.title')}</h3>
                  <div className="pill pill-blue">{t('home.feed.live')}</div>
                </div>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {recentReports.length > 0 ? recentReports.map((report) => (
                    <ReportRow key={report.id} report={report} />
                  )) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      {t('home.feed.empty')}
                    </div>
                  )}
                </div>
                <Link to="/dashboard" style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center', color: 'var(--primary)', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
                  {t('home.feed.all')} &rarr;
                </Link>

              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Premium Footer Section */}
      <footer style={footerStyle}>
        <div className="container">
          <div style={footerGridStyle}>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginBottom: '20px' }}>InfraMind AI</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6 }}>
                {t('home.footer.tagline')}
              </p>
            </div>

            {/* Footer links mapping... */}
          </div>
          <div style={footerBottomStyle}>
            <span>© 2024 InfraMind AI.</span>
            <div style={{ display: 'flex', gap: '30px' }}>
              <span>{t('home.footer.status')}</span>
              <span>{t('home.footer.license')}</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

// Sub-components
const StatCard = ({ label, value, icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="card"
    style={{ display: 'flex', alignItems: 'center', gap: '24px', padding: '40px', border: 'none', background: 'white', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}
  >
    <div style={{ padding: '16px', borderRadius: '16px', background: color }}>{icon}</div>
    <div>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>{value}</div>
    </div>
  </motion.div>
);

const ReportRow = ({ report }) => (
  <div style={reportRowStyle}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: report.color }} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700 }}>{report.type}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{report.address}</div>
    </div>
    <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)' }}>{report.status?.toUpperCase()}</div>
  </div>
);

const AlertTriangle = ({ color }) => <Shield size={20} color={color} />;

// Premium Styles
const heroContainerStyle = {
  position: 'relative',
  background: '#0f172a', // Premium deep navy
  overflow: 'hidden',
};

const heroGradientOverlay = {
  position: 'absolute',
  inset: 0,
  background: 'radial-gradient(circle at 70% 30%, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
};

const premiumBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '8px 16px',
  background: 'rgba(59, 130, 246, 0.1)',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  borderRadius: '100px',
  color: '#60a5fa',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '1px',
  gap: '10px',
  marginBottom: '32px'
};

const heroTitleStyle = {
  fontSize: '72px',
  lineHeight: 1.05,
  fontWeight: 900,
  color: 'white',
  letterSpacing: '-3px',
  marginBottom: '32px'
};

const heroSubtitleStyle = {
  fontSize: '20px',
  lineHeight: 1.6,
  color: 'rgba(255,255,255,0.6)',
  maxWidth: '540px',
  marginBottom: '48px'
};

const ctaPrimaryStyle = {
  padding: '16px 32px',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: '14px',
  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};

const ctaSecondaryStyle = {
  padding: '16px 32px',
  fontSize: '15px',
  fontWeight: 700,
  borderRadius: '14px',
  background: 'rgba(255, 255, 255, 0.03)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.3s ease',
  textDecoration: 'none',
  whiteSpace: 'nowrap'
};

const heroImageContainerStyle = {
  width: '100%',
  borderRadius: '32px',
  overflow: 'hidden',
  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.5)',
  position: 'relative',
  aspectRatio: '16/10'
};

const heroImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.8
};

const floatingCardStyle = {
  position: 'absolute',
  bottom: '40px',
  right: '40px',
  padding: '24px',
  borderRadius: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  minWidth: '240px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const statsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px'
};

const mapPreviewStyle = {
  position: 'relative',
  borderRadius: '32px',
  overflow: 'hidden',
  height: '450px',
  background: '#1e293b'
};

const mapImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  opacity: 0.5
};

const mapOverlayStyle = {
  position: 'absolute',
  inset: 0,
  padding: '48px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, transparent 60%)',
  gap: '24px'
};

const reportRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '16px'
};

const footerStyle = {
  padding: '100px 0 40px',
  borderTop: '1px solid var(--border)',
  background: '#fafafa'
};

const footerGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(300px, 1fr) repeat(3, 1fr)',
  gap: '60px',
  marginBottom: '80px'
};

const footerBottomStyle = {
  paddingTop: '40px',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  color: 'var(--text-muted)',
  fontWeight: 600
};

export default Home;
