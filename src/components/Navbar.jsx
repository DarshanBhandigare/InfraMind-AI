import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '94%',
      maxWidth: '1400px', // Increased max-width to accommodate all links on one line
      zIndex: 2000,
    }}>
      <nav className="glass-nav" style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
      }}>
        {/* Left Section: Logo */}
        <div style={{ display: 'flex', flex: '0 0 200px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--primary), #4b7bec)',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0, 82, 204, 0.2)',
              flexShrink: 0
            }}>
              <Shield size={20} color="white" fill="white" fillOpacity={0.2} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px', whiteSpace: 'nowrap' }}>
              InfraMind AI
            </span>
          </Link>
        </div>

        {/* Center Section: Navigation Links */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          alignItems: 'center', 
          justifyContent: 'center',
          flex: '1',
          overflow: 'hidden' 
        }}>
          <NavLink to="/" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.home')}</NavLink>
          <NavLink to="/map" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.map')}</NavLink>
          <NavLink to="/dashboard" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.dashboard')}</NavLink>
          <NavLink to="/alerts" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.alerts')}</NavLink>
          <NavLink to="/hub" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.hub')}</NavLink>
          <NavLink to="/about" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.resources')}</NavLink>
          <NavLink to="/contact" className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>{t('nav.contact')}</NavLink>

        </div>

        {/* Right Section: Auth/Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end', flex: '0 0 280px' }}>
          {user ? (
            <>
              <button 
                onClick={handleLogout} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#000000', 
                  fontWeight: 700, 
                  fontSize: '14px',
                  padding: '8px 16px',
                  whiteSpace: 'nowrap'
                }}
              >
                {t('nav.logout')}
              </button>
              <Link to="/report" className="btn-liquid" style={{ textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>
                {t('nav.reportIssue')}
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/admin/login" className="nav-item-liquid" style={{ textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>
                {t('nav.adminLogin')}
              </NavLink>
              <Link to="/report" className="btn-liquid" style={{ textDecoration: 'none', fontSize: '14px', whiteSpace: 'nowrap' }}>
                {t('nav.reportIssue')}
              </Link>
            </>

          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
