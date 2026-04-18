import React, { useState, useCallback, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';


const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/map', label: t('nav.map') },
    { to: '/dashboard', label: t('nav.dashboard') },
    { to: '/alerts', label: t('nav.alerts') },
    { to: '/hub', label: t('nav.hub') },
    { to: '/about', label: t('nav.resources') },
    { to: '/contact', label: t('nav.contact') },
  ];

  return (
    <>
      <div className="navbar-wrapper">
        <nav className="glass-nav navbar-inner">
          {/* Left Section: Logo */}
          <div className="navbar-logo">
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

          {/* Center Section: Desktop Navigation Links */}
          <div className="navbar-links-desktop">
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} className="nav-item-liquid" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right Section: Desktop Auth/Actions */}
          <div className="navbar-actions-desktop">
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

          {/* Hamburger Button (mobile only) */}
          <button className="navbar-hamburger" onClick={toggleMobile} aria-label="Toggle menu">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </nav>
      </div>

      {/* Mobile Overlay */}
      <div className={`navbar-mobile-overlay${mobileOpen ? ' open' : ''}`} onClick={toggleMobile} />

      {/* Mobile Drawer */}
      <div className={`navbar-mobile-drawer${mobileOpen ? ' open' : ''}`}>
        <div className="navbar-mobile-links">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
              {link.label}
            </NavLink>
          ))}
        </div>
        <div className="navbar-mobile-actions">
          {user ? (
            <>
              <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="navbar-mobile-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
                {t('nav.logout')}
              </button>
              <Link to="/report" className="btn-liquid navbar-mobile-cta" onClick={() => setMobileOpen(false)}>
                {t('nav.reportIssue')}
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/admin/login" className="navbar-mobile-link" onClick={() => setMobileOpen(false)}>
                {t('nav.adminLogin')}
              </NavLink>
              <Link to="/report" className="btn-liquid navbar-mobile-cta" onClick={() => setMobileOpen(false)}>
                {t('nav.reportIssue')}
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
