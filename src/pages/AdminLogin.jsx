import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, Terminal, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f0f7ff 100%)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative background elements */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(0, 82, 204, 0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(0, 82, 204, 0.03)', borderRadius: '50%', filter: 'blur(80px)' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '48px',
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.5)',
          borderRadius: '32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)',
          zIndex: 1
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '16px', 
            borderRadius: '20px', 
            background: 'var(--primary-light)',
            marginBottom: '20px',
            color: 'var(--primary)'
          }}>
            <Shield size={32} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#091E42', margin: 0, letterSpacing: '-0.5px' }}>Terminal Access</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '15px' }}>
            Authorized personnel only. Municipal Portal.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fff1f0', 
            border: '1px solid #ffa39e',
            padding: '12px 16px',
            borderRadius: '12px',
            color: '#cf1322',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
          <div>
            <label style={labelStyle}>Administrative Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={iconStyle} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '48px', background: 'white' }} 
                placeholder="admin@inframind.gov"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Access Key</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={iconStyle} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '48px', background: 'white' }} 
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-liquid"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '16px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Authenticating...' : <><Terminal size={18} /> Initialize Session</>}
          </button>
        </form>

        <div style={{ marginTop: '40px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px', lineHeight: 1.5 }}>
            Security Warning: All access attempts are logged. 
            Unauthorized access is strictly prohibited.
          </p>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
            Return to Public Portal
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  marginBottom: '8px',
  letterSpacing: '1px'
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'var(--text-muted)',
  zIndex: 1
};

export default AdminLogin;
