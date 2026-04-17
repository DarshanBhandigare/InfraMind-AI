import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  AlertCircle,
  User,
  Lock,
  Activity,
  Sparkles,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../utils/adminConfig';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authSequence, setAuthSequence] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!isAdmin(email) || password !== 'admin@123') {
      setError('Only authorized administrator credentials can access this console.');
      return;
    }

    setLoading(true);
    setAuthSequence(true);

    try {
      await login(email, password);
      setTimeout(() => navigate('/admin/dashboard'), 1200);
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signup(email, password);
          setTimeout(() => navigate('/admin/dashboard'), 1200);
        } catch (signupErr) {
          setError(signupErr.message || 'Unable to create the administrator account.');
          setAuthSequence(false);
          setLoading(false);
        }
      } else {
        setError(err.message || 'Unable to sign in right now.');
        setAuthSequence(false);
        setLoading(false);
      }
    }
  };

  return (
    <div style={pageStyle}>
      <div style={ambientGlowStyle} />
      <div style={ambientGlowSecondaryStyle} />

      <div style={contentShellStyle}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={heroPanelStyle}
        >
          <Link to="/" style={backLinkStyle}>
            <ArrowLeft size={16} />
            Back to home
          </Link>

          <div style={heroBadgeStyle}>
            <Sparkles size={14} />
            Admin access
          </div>

          <h1 style={heroTitleStyle}>Manage city reports with the same calm, clean workspace.</h1>
          <p style={heroTextStyle}>
            Sign in to review citizen submissions, validate evidence, and coordinate action from the operations dashboard.
          </p>

          <div style={featureListStyle}>
            <FeatureItem text="Auto image verification for submitted evidence" />
            <FeatureItem text="Live incident review and approval workflow" />
            <FeatureItem text="Clean operations dashboard with map context" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          style={loginCardStyle}
        >
          <div style={headerStyle}>
            <div style={logoContainerStyle}>
              <Shield size={28} color="#2563eb" />
            </div>
            <div>
              <p style={eyebrowStyle}>InfraMind Admin</p>
              <h2 style={titleStyle}>Administrator Login</h2>
              <p style={subtitleStyle}>Use the approved admin email and password to open the command centre.</p>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={errorStyle}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Admin email</label>
              <div style={inputWrapStyle}>
                <User size={18} style={iconStyle} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  style={inputStyle}
                  placeholder="admin@yourcity.gov"
                />
              </div>
            </div>

            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Password</label>
              <div style={inputWrapStyle}>
                <Lock size={18} style={iconStyle} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  style={inputStyle}
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <button type="submit" disabled={loading} style={submitButtonStyle}>
              {authSequence ? (
                <>
                  <Activity size={18} className="spin" />
                  Opening dashboard...
                </>
              ) : (
                <>
                  <Shield size={18} />
                  Sign in to admin
                </>
              )}
            </button>
          </form>

          <div style={footerStyle}>
            <div style={footerNoteStyle}>
              <CheckCircle2 size={16} color="#0f766e" />
              <span>Protected access for authorized municipal administrators.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const FeatureItem = ({ text }) => (
  <div style={featureItemStyle}>
    <CheckCircle2 size={16} color="#2563eb" />
    <span>{text}</span>
  </div>
);

const pageStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px',
  background: 'linear-gradient(135deg, #eef6ff 0%, #ffffff 45%, #eef4ff 100%)',
  position: 'relative',
  overflow: 'hidden'
};

const ambientGlowStyle = {
  position: 'absolute',
  width: '520px',
  height: '520px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(37, 99, 235, 0.16) 0%, rgba(37, 99, 235, 0) 70%)',
  top: '-120px',
  left: '-120px'
};

const ambientGlowSecondaryStyle = {
  position: 'absolute',
  width: '420px',
  height: '420px',
  borderRadius: '50%',
  background: 'radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0) 70%)',
  right: '-100px',
  bottom: '-120px'
};

const contentShellStyle = {
  width: '100%',
  maxWidth: '1120px',
  display: 'grid',
  gridTemplateColumns: '1fr 460px',
  gap: '28px',
  alignItems: 'stretch',
  position: 'relative',
  zIndex: 1
};

const heroPanelStyle = {
  padding: '44px',
  borderRadius: '32px',
  background: 'rgba(255, 255, 255, 0.72)',
  backdropFilter: 'blur(22px)',
  border: '1px solid rgba(219, 228, 240, 0.9)',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.08)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const backLinkStyle = {
  width: 'fit-content',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  textDecoration: 'none',
  color: '#64748b',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '28px'
};

const heroBadgeStyle = {
  width: 'fit-content',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 14px',
  borderRadius: '999px',
  background: '#eff6ff',
  border: '1px solid #bfdbfe',
  color: '#2563eb',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '20px'
};

const heroTitleStyle = {
  fontSize: 'clamp(34px, 5vw, 56px)',
  lineHeight: 1.05,
  letterSpacing: '-0.04em',
  color: '#0f172a',
  margin: '0 0 18px'
};

const heroTextStyle = {
  fontSize: '17px',
  lineHeight: 1.7,
  color: '#475569',
  maxWidth: '560px',
  marginBottom: '30px'
};

const featureListStyle = {
  display: 'grid',
  gap: '14px'
};

const featureItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#334155',
  fontSize: '15px',
  fontWeight: 600
};

const loginCardStyle = {
  padding: '34px',
  borderRadius: '32px',
  background: 'rgba(255, 255, 255, 0.88)',
  backdropFilter: 'blur(22px)',
  border: '1px solid rgba(219, 228, 240, 0.95)',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '28px'
};

const logoContainerStyle = {
  width: '64px',
  height: '64px',
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const eyebrowStyle = {
  margin: '0 0 4px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#2563eb',
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const titleStyle = {
  margin: '0 0 8px',
  fontSize: '30px',
  lineHeight: 1.1,
  color: '#0f172a'
};

const subtitleStyle = {
  margin: 0,
  color: '#64748b',
  fontSize: '14px',
  lineHeight: 1.6
};

const errorStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '14px 16px',
  background: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '16px',
  color: '#b91c1c',
  fontSize: '14px',
  fontWeight: 600,
  marginBottom: '20px'
};

const formStyle = {
  display: 'grid',
  gap: '18px'
};

const fieldGroupStyle = {
  display: 'grid',
  gap: '8px'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#334155'
};

const inputWrapStyle = {
  position: 'relative'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8'
};

const inputStyle = {
  width: '100%',
  padding: '14px 16px 14px 46px',
  borderRadius: '16px',
  border: '1px solid #dbe4f0',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '15px',
  outline: 'none',
  boxShadow: '0 8px 20px rgba(15, 23, 42, 0.04)'
};

const submitButtonStyle = {
  width: '100%',
  marginTop: '8px',
  padding: '15px 18px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #0f766e 0%, #0f9b8e 100%)',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxShadow: '0 18px 32px rgba(15, 118, 110, 0.22)'
};

const footerStyle = {
  marginTop: '22px',
  paddingTop: '18px',
  borderTop: '1px solid #e2e8f0'
};

const footerNoteStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: '#475569',
  fontSize: '13px',
  fontWeight: 600
};

export default AdminLogin;
