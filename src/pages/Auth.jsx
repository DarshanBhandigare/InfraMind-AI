import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, User, Shield, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Auth = ({ mode = 'login' }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || t('auth.authFailed'));
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
      padding: '2rem',
      background: 'var(--gradient)'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '20px', 
            background: 'rgba(59, 130, 246, 0.1)',
            marginBottom: '1rem'
          }}>
            <Shield size={40} color="var(--primary)" />
          </div>
          <h2 style={{ fontSize: '2rem' }}>{isLogin ? t('auth.welcomeBack') : t('auth.createAccount')}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? t('auth.loginSubtitle') : t('auth.signupSubtitle')}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.8rem',
            borderRadius: 'var(--radius-sm)',
            color: '#fca5a5',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('auth.email')}</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.8rem', paddingBottom: '0.8rem', width: '100%' }}
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '3rem', paddingRight: '1rem', paddingTop: '0.8rem', paddingBottom: '0.8rem', width: '100%' }}
                placeholder={t('auth.passwordPlaceholder')}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '1rem', marginTop: '1rem' }}
          >
            {loading ? t('auth.processing') : isLogin ? t('auth.signIn') : t('auth.createAccountBtn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          <span 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
          >
            {isLogin ? t('auth.signUpLink') : t('auth.logInLink')}
          </span>
        </p>
      </div>
    </div>
  );
};



export default Auth;
