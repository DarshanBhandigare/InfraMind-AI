import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  Settings, 
  Shield, 
  Search, 
  Bell, 
  LogOut, 
  LifeBuoy,
  Wrench,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-main">
          {/* Brand/Profile */}
          <div style={{ padding: '0 16px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Shield size={24} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'var(--primary)' }}>InfraMind AI</span>
            </div>

            <div style={{ background: 'var(--surface)', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#DFE1E6', overflow: 'hidden' }}>
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700 }}>City Architect</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>District 4 Manager</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <div style={sectionLabelStyle}>MAIN MENU</div>
            <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" />
            <SidebarLink to="/map" icon={<MapIcon size={20} />} label="Map View" />
            <SidebarLink to="/report" icon={<FileText size={20} />} label="Issue Reports" />
            <SidebarLink to="/dashboard" icon={<Wrench size={20} />} label="Maintenance" />
            <SidebarLink to="/alerts" icon={<ShieldCheck size={20} />} label="Public Safety" />
            
            <div style={{ ...sectionLabelStyle, marginTop: '32px' }}>SYSTEM</div>
            <button className="btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              <AlertCircle size={18} /> Emergency Dispatch
            </button>
            
            <SidebarLink to="/contact" icon={<LifeBuoy size={20} />} label="Help Center" />
            <button onClick={handleLogout} style={logoutButtonStyle}>
              <LogOut size={20} /> Log Out
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-bar">
          <div style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-field" 
              placeholder="Search address, report ID, or assets..." 
              style={{ paddingLeft: '48px', background: '#F4F5F7', border: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button style={iconButtonStyle}><Bell size={20} /></button>
            <button style={iconButtonStyle}><Settings size={20} /></button>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border)' }}>
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
            </div>
          </div>
        </header>

        <section style={{ padding: '0 0 60px' }}>
          {children}
        </section>
      </main>
    </div>
  );
};

const SidebarLink = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

const sectionLabelStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: 'var(--text-muted)',
  letterSpacing: '1px',
  margin: '0 16px 12px',
  textTransform: 'uppercase'
};

const iconButtonStyle = {
  background: 'none',
  color: 'var(--text-muted)',
  padding: '8px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const logoutButtonStyle = {
  width: '100%',
  textAlign: 'left',
  background: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  color: 'var(--text-muted)',
  fontWeight: 500,
  transition: 'all 0.2s',
  marginTop: '4px'
};

export default DashboardLayout;
