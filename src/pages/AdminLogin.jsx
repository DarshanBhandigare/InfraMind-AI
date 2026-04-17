import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  AlertCircle, 
  User, 
  Lock, 
  Terminal, 
  Activity, 
  Cpu, 
  Zap 
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Strict Administrative Credential Enforcement
    if (!isAdmin(email) || password !== 'admin@123') {
      setError('ACCESS DENIED: Credentials mismatch for Administrative Terminal.');
      return;
    }

    setLoading(true);
    setAuthSequence(true);

    try {
      // 1. Attempt standard login
      await login(email, password);
      // Wait for dramatic effect in terminal mode
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      // 2. If it's the first time, auto-provision the admin account
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await signup(email, password);
          setTimeout(() => navigate('/admin/dashboard'), 1500);
        } catch (signupErr) {
          setError(`SECURITY_SYNC_FAIL: ${signupErr.message}`);
          setAuthSequence(false);
          setLoading(false);
        }
      } else {
        setError(`FIREBASE_NODE_ERROR: ${err.message}`);
        setAuthSequence(false);
        setLoading(false);
      }
    }
  };

  return (
    <div style={terminalContainerStyle}>
      {/* Background Effects */}
      <div style={glowingOrbStyle} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={portalCardStyle}
      >
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <Shield size={32} color="var(--primary)" />
          </div>
          <h1 style={titleStyle}>INFRAMIND_ADMIN</h1>
          <p style={subtitleStyle}>MUNICIPAL INFRASTRUCTURE CONTROL GATEWAY</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={errorStyle}
            >
              <AlertCircle size={16} /> {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={fieldGroupStyle}>
            <label style={labelStyle}>ADMIN_IDENTIFIER</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={iconStyle} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="root@infra.secure"
              />
            </div>
          </div>

          <div style={fieldGroupStyle}>
            <label style={labelStyle}>ENCRYPTION_KEY</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={iconStyle} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={submitButtonStyle}
          >
            {authSequence ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} className="spin" /> INITIALIZING_HANDSHAKE...
              </div>
            ) : (
              <><Terminal size={18} /> INITIALIZE_SESSION</>
            )}
          </button>
        </form>

        <div style={footerStyle}>
          <div style={securityBadgeContainer}>
            <div style={badgeItem}><Cpu size={14} /> LEVEL_7_AUTH</div>
            <div style={badgeItem}><Zap size={14} /> ENCRYPTED_V3</div>
          </div>
          <p style={disclaimerStyle}>
            WARNING: SYSTEM LOGS ENFORCED. UNAUTHORIZED INTERACTION WILL BE TRACED TO SOURCE IP.
          </p>
        </div>
      </motion.div>

      {/* Vertical Status Bars */}
      <div style={statusBarLeft} />
      <div style={statusBarRight} />
    </div>
  );
};

// Standard UI Styles (Clean Modern Light Theme)
const terminalContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  position: 'relative',
  overflow: 'hidden',
  boxSizing: 'border-box',
  fontFamily: '"Inter", sans-serif'
};

const glowingOrbStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '600px',
  height: '600px',
  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 60%)',
  borderRadius: '50%',
  zIndex: 0,
  pointerEvents: 'none'
};

const gridBackgroundStyle = { display: 'none' };

const portalCardStyle = {
  width: '100%',
  maxWidth: '450px',
  padding: '3rem',
  background: 'white',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
  borderRadius: '24px',
  zIndex: 1,
  position: 'relative',
  boxSizing: 'border-box'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '2.5rem'
};

const logoContainerStyle = {
  display: 'inline-flex',
  padding: '1rem',
  borderRadius: '20px',
  background: 'rgba(59, 130, 246, 0.1)',
  marginBottom: '1rem'
};

const titleStyle = {
  fontSize: '2rem',
  color: '#0f172a',
  margin: 0,
  fontWeight: 800,
  letterSpacing: '-0.5px'
};

const subtitleStyle = {
  color: '#475569',
  marginTop: '0.5rem',
  fontSize: '1rem',
  fontWeight: 500
};

const errorStyle = {
  background: '#fef2f2',
  border: '1px solid #fecaca',
  padding: '0.8rem',
  borderRadius: 'var(--radius-sm)',
  color: '#ef4444',
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  marginBottom: '1.5rem',
  fontWeight: 500
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.2rem'
};

const fieldGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem'
};

const labelStyle = {
  fontSize: '0.9rem',
  fontWeight: 600,
  color: '#1e293b',
  display: 'block',
  textAlign: 'left'
};

const inputStyle = {
  width: '100%',
  padding: '0.8rem 1rem 0.8rem 3rem',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  color: '#0f172a',
  outline: 'none',
  fontSize: '1rem',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box'
};

const iconStyle = {
  position: 'absolute',
  left: '1rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#64748b'
};

const submitButtonStyle = {
  width: '100%',
  padding: '1rem',
  background: 'linear-gradient(135deg, var(--primary), #4b7bec)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  marginTop: '1rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  boxShadow: '0 4px 15px rgba(0, 82, 204, 0.2)',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
};

const footerStyle = {
  marginTop: '2.5rem',
  textAlign: 'center',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '2rem'
};

const securityBadgeContainer = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '1rem'
};

const badgeItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
  color: '#64748b',
  fontWeight: 600
};

const disclaimerStyle = {
  color: '#94a3b8',
  fontSize: '0.8rem',
  lineHeight: 1.5
};

const statusBarLeft = { display: 'none' };
const statusBarRight = { display: 'none' };

export default AdminLogin;
