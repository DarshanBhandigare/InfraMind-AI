import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, Terminal, AlertCircle } from 'lucide-react';

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
      // In a real app, we'd check for an admin role here
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
      background: '#0a0a0a',
      padding: '2rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        padding: '3rem',
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1.2rem', 
            borderRadius: '16px', 
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '1.5rem'
          }}>
            <Shield size={36} color="var(--primary)" />
          </div>
          <h1 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 700, margin: 0 }}>Terminal Access</h1>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Authorized personnel only. Municipal Administrative Portal.
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            marginBottom: '2rem'
          }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <label style={labelStyle}>Administrative Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={iconStyle} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={adminInputStyle} 
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
                style={adminInputStyle} 
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'var(--primary)',
              color: 'white',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: '1rem',
              marginTop: '1rem',
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

        <div style={{ marginTop: '3rem', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '2rem' }}>
          <p style={{ color: '#666', fontSize: '0.8rem', marginBottom: '1rem' }}>
            Security Warning: All access attempts are logged and monitored. 
            Unauthorized access is strictly prohibited.
          </p>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>
            Return to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

const labelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: '#888',
  marginBottom: '0.8rem',
  letterSpacing: '1px'
};

const iconStyle = {
  position: 'absolute',
  left: '1.2rem',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#555'
};

const adminInputStyle = {
  width: '100%',
  padding: '1.2rem 1.2rem 1.2rem 3.5rem',
  background: '#222',
  border: '1px solid #333',
  borderRadius: '12px',
  color: 'white',
  outline: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  fontFamily: 'monospace'
};

export default AdminLogin;
