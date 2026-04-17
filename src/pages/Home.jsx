import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight, Play, Globe, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  return (
    <div style={{ background: '#fff' }}>
      {/* Hero Section */}
      <section className="container" style={{ paddingTop: 'calc(var(--nav-height) + 60px)', paddingBottom: '80px' }}>
        <div className="grid-2">
          {/* Left Side Content */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pill pill-blue" style={{ marginBottom: '24px' }}>
              <Shield size={12} fill="var(--primary)" /> NEXT-GEN CIVIC INTELLIGENCE
            </div>
            <h1 style={{ fontSize: '64px', lineHeight: 1.1, marginBottom: '24px', letterSpacing: '-1.5px' }}>
              Predictive <br />
              Infrastructure <br />
              for a <span style={{ color: 'var(--primary)' }}>Smarter City</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '480px' }}>
              Leveraging real-time telemetry and AI to identify urban maintenance needs before they impact the community.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Link to="/report" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                Report an Issue
              </Link>
              <Link to="/dashboard" className="btn-outline" style={{ padding: '14px 28px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Explore Analytics <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>

          {/* Right Side Image Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ position: 'relative' }}
          >
            <div style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px -20px rgba(0,0,0,0.2)',
              position: 'relative',
              background: '#000'
            }}>
              <img
                src="https://images.unsplash.com/photo-1775804323165-b95817c4951a?q=80&w=1175&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Smart City Infrastructure"
                style={{ width: '100%', display: 'block', opacity: 0.8 }}
              />

              {/* Overlay Stat Card */}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                right: '30px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderRadius: '12px',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <div>
                  <div className="pill pill-blue" style={{ marginBottom: '4px', fontSize: '9px' }}>Live Feed</div>
                  <h4 style={{ fontSize: '18px' }}>The Metro Bridge</h4>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--safe)' }}>98%</div>
                  <div style={{ fontSize: '10px', fontWeight: 700, opacity: 0.6, textTransform: 'uppercase' }}>Safe</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Section (Matches Stats in Image 2) */}
      <section style={{ background: 'var(--surface)', padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <StatSmallCard title="Total Issues" count="1,240" icon={<div style={{ background: '#deebff', padding: '8px', borderRadius: '8px' }}><Shield size={20} color="var(--primary)" /></div>} />
            <StatSmallCard title="High Risk Zones" count="12" icon={<div style={{ background: '#ffebe6', padding: '8px', borderRadius: '8px' }}><Shield size={20} color="var(--critical)" /></div>} />
            <StatSmallCard title="Resolved Issues" count="98%" icon={<div style={{ background: '#e3fcef', padding: '8px', borderRadius: '8px' }}><CheckCircle size={20} color="var(--safe)" /></div>} />
          </div>

          <div className="grid-2" style={{ marginTop: '60px' }}>
            {/* Live Map Preview Card */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '400px', background: '#333' }}>
              <img src="https://i.pinimg.com/736x/17/85/f9/1785f9a5ffdb6e8070dc70579d1b044c.jpg" alt="Map" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }}></div>
              <div style={{ position: 'absolute', bottom: 30, left: 30, right: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ color: 'white' }}>
                  <h3 style={{ color: 'white', fontSize: '24px', marginBottom: '4px' }}>Live Infrastructure Map</h3>
                  <p style={{ opacity: 0.8, fontSize: '14px' }}>Real-time health monitoring of the metropolitan grid.</p>
                </div>
                <Link to="/map" className="btn-primary" style={{ background: '#111', color: 'white', borderRadius: '8px', fontSize: '12px' }}>View Full Map</Link>
              </div>
            </div>

            {/* Recent Submissions List Card */}
            <div className="card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '20px', fontSize: '18px' }}>Recent Submissions</h3>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <SubmissionRow title="Pothole" subtitle="Oak Street, Sector 4" status="Reported" color="var(--critical)" />
                <SubmissionRow title="Streetlight" subtitle="Park Ave Crossroad" status="In Progress" color="var(--watch)" />
                <SubmissionRow title="Water Leak" subtitle="Bridge District Pipe 09" status="Resolved" color="var(--safe)" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '36px', marginBottom: '16px' }}>See something that needs attention?</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>Help us keep the city running smoothly. Every report counts towards a better urban experience.</p>
        <Link to="/report" className="btn-primary" style={{ padding: '16px 40px', fontSize: '18px', borderRadius: '12px' }}>Report an Issue Now</Link>
      </section>

      {/* Actual Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '60px 0 20px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr repeat(3, 1fr)', gap: '40px', marginBottom: '60px' }}>
            <div>
              <h3 style={{ fontSize: '20px', color: 'var(--primary)', marginBottom: '16px' }}>InfraMind AI</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '240px' }}>Advanced predictive analytics for municipal infrastructure and public works optimization.</p>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Platform</h4>
              <ul style={footerListStyle}>
                <li>Infrastructure</li>
                <li>Maintenance</li>
                <li>Public Safety</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Company</h4>
              <ul style={footerListStyle}>
                <li>About Us</li>
                <li>Resources</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Support</h4>
              <ul style={footerListStyle}>
                <li>Contact</li>
                <li>Privacy Policy</li>
                <li>API Docs</li>
              </ul>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
            <span>© 2024 InfraMind AI. Metropolitan Data Systems.</span>
            <div style={{ display: 'flex', gap: '24px' }}>
              <span>Status: All Systems Nominal</span>
              <span>v4.0.0-Stable</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatSmallCard = ({ title, count, icon }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '30px' }}>
    {icon}
    <div>
      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '32px', fontWeight: 800 }}>{count}</div>
    </div>
  </div>
);

const SubmissionRow = ({ title, subtitle, status, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: '#f8f9fb', borderRadius: '12px', marginBottom: '12px' }}>
    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }}></div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '14px', fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{subtitle}</div>
    </div>
    <div style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: color }}>{status}</div>
  </div>
);

const footerListStyle = { listStyle: 'none', fontSize: '14px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' };

export default Home;
