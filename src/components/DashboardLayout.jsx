import React, { useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  ExternalLink,
  LifeBuoy,
  Wrench,
  ShieldCheck,
  AlertCircle,
  Activity
} from 'lucide-react';
import { isAdmin } from '../utils/adminConfig';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isUserAdmin = useMemo(() => {
    return user && user.email ? isAdmin(user.email) : false;
  }, [user]);

  const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const themeStyle = isAdminRoute ? adminTheme : publicTheme;

  return (
    <div style={{ ...dashboardContainerStyle, ...themeStyle.container }}>
      {/* Sidebar - Professionally Redesigned */}
      <aside style={{ ...sidebarStyle, ...themeStyle.sidebar }}>
        <div style={{ padding: '32px 24px' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px' }}>
            <div style={brandLogoStyle}>
              {isAdminRoute ? <Activity size={22} color="#10b981" /> : <Shield size={22} color="white" />}
            </div>
            <span style={{ 
              fontWeight: 900, 
              fontSize: '20px', 
              color: isAdminRoute ? '#10b981' : 'var(--primary)',
              letterSpacing: '-0.5px' 
            }}>
              {isAdminRoute ? 'OPERATIONS' : 'InfraMind AI'}
            </span>
          </div>

          {/* Profile Card */}
          <div className={isAdminRoute ? 'glass-premium' : ''} style={profileCardStyle(isAdminRoute)}>
            <div style={avatarStyle}>
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`} alt="Profile" />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: isAdminRoute ? 'white' : 'var(--text)' }}>
                {isUserAdmin ? 'Admin Controller' : 'City Architect'}
              </div>
              <div style={{ fontSize: '10px', color: isAdminRoute ? '#64748b' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isUserAdmin ? 'ID: AUTH-ROOT' : 'District 4 Manager'}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ marginTop: '40px', display: 'grid', gap: '6px' }}>
            <div style={sectionLabelStyle(isAdminRoute)}>{isAdminRoute ? 'COMMAND CENTER' : 'MANAGEMENT'}</div>
            
            {!isAdminRoute ? (
              <>
                {/* Citizen Links */}
                <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Overview" isAdmin={isAdminRoute} />
                <SidebarLink to="/report" icon={<FileText size={20} />} label="Report Issue" isAdmin={isAdminRoute} />
                <SidebarLink to="/map" icon={<MapIcon size={20} />} label="Asset Maps" isAdmin={isAdminRoute} />
                <SidebarLink to="/alerts" icon={<ShieldCheck size={20} />} label="Alert Hub" isAdmin={isAdminRoute} />
                
                {/* Strictly Admin-only link (Hidden Access) */}
                {isUserAdmin && (
                  <SidebarLink to="/admin/dashboard" icon={<Wrench size={20} />} label="Admin Console" isAdmin={isAdminRoute} />
                )}
              </>
            ) : (
              <>
                {/* Admin Specific Links */}
                <SidebarLink to="/admin/dashboard" icon={<LayoutDashboard size={20} />} label="Admin Dashboard" isAdmin={isAdminRoute} />
                <SidebarLink to="/dashboard" icon={<ExternalLink size={20} />} label="Citizen View" isAdmin={isAdminRoute} />
              </>
            )}
            
            <div style={{ ...sectionLabelStyle(isAdminRoute), marginTop: '24px' }}>SESSION</div>
            <button onClick={handleLogout} style={logoutButtonStyle(isAdminRoute)}>
              <LogOut size={20} /> Terminate Session
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        <header style={{ ...topBarStyle, ...themeStyle.topBar }}>
          <div style={{ position: 'relative', width: '440px' }}>
            <Search size={18} style={searchIconStyle(isAdminRoute)} />
            <input 
              style={searchInputStyle(isAdminRoute)}
              className="input-field" 
              placeholder="Query city assets, report clusters, or system nodes..." 
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button style={topIconStyle(isAdminRoute)}><Bell size={20} /></button>
            <button style={topIconStyle(isAdminRoute)}><Settings size={20} /></button>
            <div style={topAvatarStyle(isAdminRoute)}>
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`} alt="Profile" />
            </div>
          </div>
        </header>

        <section style={{ padding: '0 0 60px' }} className={isAdminRoute ? 'command-gradient' : ''}>
          {children}
        </section>
      </main>
    </div>
  );
};

// Sub-components
const SidebarLink = ({ to, icon, label, isAdmin }) => (
  <NavLink 
    to={to} 
    style={({ isActive }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '12px 16px',
      borderRadius: '12px',
      color: isActive 
        ? (isAdmin ? '#10b981' : 'var(--primary)') 
        : (isAdmin ? '#64748b' : 'var(--text-muted)'),
      background: isActive 
        ? (isAdmin ? 'rgba(16, 185, 129, 0.1)' : '#EBF2FF') 
        : 'transparent',
      textDecoration: 'none',
      fontSize: '14px',
      fontWeight: isActive ? 700 : 500,
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
    })}
  >
    {icon}
    <span>{label}</span>
  </NavLink>
);

// Theme Definitions
const publicTheme = {
  container: { background: '#F4F7FA' },
  sidebar: { background: 'white', borderRight: '1px solid var(--border)' },
  topBar: { background: 'white', borderBottom: '1px solid var(--border)' }
};

const adminTheme = {
  container: { background: '#020617' },
  sidebar: { background: '#020617', borderRight: '1px solid rgba(255,255,255,0.05)' },
  topBar: { background: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }
};

// Styles
const dashboardContainerStyle = {
  display: 'flex',
  minHeight: '100vh',
};

const sidebarStyle = {
  width: '300px',
  display: 'flex',
  flexDirection: 'column',
  position: 'fixed',
  height: '100vh',
  zIndex: 100,
};

const brandLogoStyle = {
  width: '42px',
  height: '42px',
  background: '#0f172a',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
};

const profileCardStyle = (isAdmin) => ({
  background: isAdmin ? 'transparent' : 'var(--surface)',
  padding: '16px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
});

const avatarStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: '#DFE1E6',
  overflow: 'hidden',
  flexShrink: 0
};

const sectionLabelStyle = (isAdmin) => ({
  fontSize: '10px',
  fontWeight: 900,
  color: isAdmin ? '#334155' : 'var(--text-muted)',
  letterSpacing: '1.5px',
  margin: '0 16px 12px',
  textTransform: 'uppercase'
});

const logoutButtonStyle = (isAdmin) => ({
  width: '100%',
  textAlign: 'left',
  background: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  borderRadius: '12px',
  color: isAdmin ? '#ef4444' : 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '14px',
  marginTop: '24px'
});

const mainContentStyle = {
  flex: 1,
  marginLeft: '300px',
  minHeight: '100vh',
};

const topBarStyle = {
  height: '80px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 48px',
  position: 'sticky',
  top: 0,
  zIndex: 90,
};

const searchIconStyle = (isAdmin) => ({
  position: 'absolute',
  left: '20px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: isAdmin ? '#475569' : 'var(--text-muted)',
});

const searchInputStyle = (isAdmin) => ({
  paddingLeft: '56px',
  background: isAdmin ? '#0f172a' : '#F4F5F7',
  border: isAdmin ? '1px solid rgba(255,255,255,0.05)' : 'none',
  color: isAdmin ? 'white' : 'var(--text)',
  borderRadius: '14px'
});

const topIconStyle = (isAdmin) => ({
  background: 'none',
  color: isAdmin ? '#64748b' : 'var(--text-muted)',
  padding: '10px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: isAdmin ? '1px solid rgba(255,255,255,0.05)' : 'none'
});

const topAvatarStyle = (isAdmin) => ({
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: isAdmin ? '1px solid #10b981' : '2px solid var(--border)',
});

export default DashboardLayout;
