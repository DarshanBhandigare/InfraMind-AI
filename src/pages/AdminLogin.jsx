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
      {/* Dynamic Security Grid Background */}
      <div style={gridBackgroundStyle} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={portalCardStyle}
      >
        <div style={headerStyle}>
          <div style={logoContainerStyle}>
            <Shield size={32} color="#10b981" />
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

// Terminal UI Styles
const terminalContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#050505', // Pure black
  color: '#c0c0c0',
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  padding: '24px',
  position: 'relative',
  overflow: 'hidden'
};

const gridBackgroundStyle = {
  position: 'absolute',
  inset: 0,
  backgroundImage: `
    linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
  zIndex: 0
};

const portalCardStyle = {
  width: '100%',
  maxWidth: '460px',
  padding: '50px',
  background: 'rgba(10, 10, 10, 0.9)',
  border: '1px solid #1a1a1a',
  borderRadius: '4px', // Hard edges for terminal feel
  boxShadow: '0 0 40px rgba(0, 0, 0, 1), 0 0 1px rgba(16, 185, 129, 0.2)',
  zIndex: 1,
  position: 'relative'
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '40px'
};

const logoContainerStyle = {
  display: 'inline-flex',
  padding: '16px',
  borderRadius: '50%',
  background: 'rgba(16, 185, 129, 0.05)',
  border: '1px solid rgba(16, 185, 129, 0.1)',
  marginBottom: '20px',
  boxShadow: '0 0 20px rgba(16, 185, 129, 0.1)'
};

const titleStyle = {
  fontSize: '24px',
  fontWeight: 900,
  color: '#10b981', // Emerald green
  margin: 0,
  letterSpacing: '4px',
  textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
};

const subtitleStyle = {
  fontSize: '10px',
  color: '#666',
  marginTop: '8px',
  letterSpacing: '2px',
  fontWeight: 700
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.05)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '12px',
  color: '#ef4444',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '24px',
  fontWeight: 700
};

const formStyle = {
  display: 'grid',
  gap: '24px'
};

const fieldGroupStyle = {
  display: 'grid',
  gap: '10px'
};

const labelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: '#444',
  letterSpacing: '1px'
};

const inputStyle = {
  width: '100%',
  padding: '12px 12px 12px 48px',
  background: '#0a0a0a',
  border: '1px solid #222',
  color: '#10b981',
  fontFamily: 'monospace',
  fontSize: '14px',
  outline: 'none',
  transition: 'all 0.3s ease',
  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#333',
  zIndex: 1
};

const submitButtonStyle = {
  width: '100%',
  padding: '16px',
  background: 'transparent',
  border: '1px solid #10b981',
  color: '#10b981',
  fontSize: '13px',
  fontWeight: 900,
  letterSpacing: '2px',
  cursor: 'pointer',
  marginTop: '10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  transition: 'all 0.3s ease',
  textTransform: 'uppercase'
};

const footerStyle = {
  marginTop: '40px',
  textAlign: 'center',
  borderTop: '1px solid #1a1a1a',
  paddingTop: '30px'
};

const securityBadgeContainer = {
  display: 'flex',
  justifyContent: 'center',
  gap: '20px',
  marginBottom: '20px'
};

const badgeItem = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '9px',
  color: '#444',
  fontWeight: 800
};

const disclaimerStyle = {
  color: '#333',
  fontSize: '9px',
  lineHeight: 1.8,
  fontWeight: 700
};

const statusBarLeft = {
  position: 'absolute',
  left: '20px',
  top: '20px',
  bottom: '20px',
  width: '2px',
  background: 'linear-gradient(to bottom, transparent, #10b981, transparent)',
  opacity: 0.3
};

const statusBarRight = {
  position: 'absolute',
  right: '20px',
  top: '20px',
  bottom: '20px',
  width: '2px',
  background: 'linear-gradient(to bottom, transparent, #10b981, transparent)',
  opacity: 0.3
};

export default AdminLogin;
