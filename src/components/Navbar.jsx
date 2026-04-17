import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';

const Navbar = () => {
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
    <nav style={{
      height: 'var(--nav-height)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      background: 'white',
      borderBottom: '1px solid var(--border)',
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 1000
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Shield size={28} color="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
        <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.5px' }}>
          InfraMind AI
        </span>
      </Link>

      <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        <Link to="/" style={navLinkStyle}>Home</Link>
        <Link to="/map" style={navLinkStyle}>Map</Link>
        <Link to="/dashboard" style={navLinkStyle}>Dashboard</Link>
        <Link to="/alerts" style={navLinkStyle}>Alerts</Link>
        <Link to="/about" style={navLinkStyle}>Resources</Link>
        <Link to="/contact" style={navLinkStyle}>Contact</Link>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        {user ? (
          <>
            <button onClick={handleLogout} className="btn-outline" style={{ fontSize: '14px' }}>
              Logout
            </button>
            <Link to="/report" className="btn-primary" style={{ fontSize: '14px' }}>
              Report Issue
            </Link>
          </>
        ) : (
          <>
            <Link to="/admin/login" className="btn-outline" style={{ fontSize: '14px' }}>
              Admin Login
            </Link>
            <Link to="/login" className="btn-primary" style={{ fontSize: '14px' }}>
              Report Issue
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

const navLinkStyle = {
  fontSize: '14px',
  fontWeight: 500,
  color: 'var(--text-muted)',
};

export default Navbar;
