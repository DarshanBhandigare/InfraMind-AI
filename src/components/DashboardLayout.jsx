import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  FileText, 
  Shield, 
  Search, 
  Bell, 
  LogOut, 
  Wrench,
  ShieldCheck,
  Activity,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  Inbox,
  MessageSquare,
  X
} from 'lucide-react';
import { isAdmin } from '../utils/adminConfig';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { processReport } from '../services/dataSyncService';
import { useTranslation } from 'react-i18next';

const DashboardLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userReports, setUserReports] = useState([]);
  const [adminReports, setAdminReports] = useState([]);
  const [adminSuggestions, setAdminSuggestions] = useState([]);
  const [adminInquiries, setAdminInquiries] = useState([]);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);

  const isUserAdmin = useMemo(() => {
    return user && user.email ? isAdmin(user.email) : false;
  }, [user]);

  const isAdminRoute = useMemo(() => location.pathname.startsWith('/admin'), [location.pathname]);
  const shouldShowUserUtilities = Boolean(user) && !isAdminRoute;

  useEffect(() => {
    if (!user || isAdminRoute) {
      setUserReports([]);
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const reports = snapshot.docs
        .map((doc) => processReport({ id: doc.id, ...doc.data() }))
        .filter((report) => report.userId === user.uid);

      setUserReports(reports);
    });

    return unsubscribe;
  }, [isAdminRoute, user]);

  useEffect(() => {
    if (!isAdminRoute) {
      setAdminSuggestions([]);
      setAdminInquiries([]);
      return;
    }

    const unsubReports = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminReports(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 50));
    });

    const unsubSuggestions = onSnapshot(collection(db, 'suggestions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminSuggestions(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 3));
    });

    const unsubInquiries = onSnapshot(collection(db, 'contacts'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdminInquiries(data.sort((a,b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 30));
    });

    return () => {
      unsubReports();
      unsubSuggestions();
      unsubInquiries();
    };
  }, [isAdminRoute]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsNotificationsOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const themeStyle = isAdminRoute ? adminTheme : publicTheme;
  const approvedReports = useMemo(
    () =>
      userReports
        .filter((report) => report.status?.toLowerCase() === 'approved' || report.originalStatus?.toLowerCase() === 'approved')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [userReports]
  );

  const searchTargets = useMemo(() => {
    const routeItems = isAdminRoute
      ? [
          {
            id: 'route-admin-dashboard',
            kind: 'route',
            title: t('layout.navReportsConsole'),
            subtitle: t('layout.searchRouteAdminSub'),
            action: () => navigate('/admin/dashboard')
          }
        ]
      : [
          {
            id: 'route-dashboard',
            kind: 'route',
            title: t('layout.searchRouteOverview'),
            subtitle: t('layout.searchRouteOverviewSub'),
            action: () => navigate('/dashboard')
          },
          {
            id: 'route-report',
            kind: 'route',
            title: t('layout.searchRouteReport'),
            subtitle: t('layout.searchRouteReportSub'),
            action: () => navigate('/report')
          },
          {
            id: 'route-map',
            kind: 'route',
            title: t('layout.searchRouteMap'),
            subtitle: t('layout.searchRouteMapSub'),
            action: () => navigate('/map')
          },
          {
            id: 'route-alerts',
            kind: 'route',
            title: t('layout.searchRouteAlerts'),
            subtitle: t('layout.searchRouteAlertsSub'),
            action: () => navigate('/alerts')
          }
        ];

    const reportSource = isAdminRoute ? adminReports : userReports;
    const reportItems = reportSource.slice(0, 20).map((report) => ({
      id: `report-${report.id}`,
      kind: 'report',
      title: report.type || t('layout.untitledReport'),
      subtitle: `${report.status || t('layout.reportStatusUnknown')}${report.displayAddress ? ` • ${report.displayAddress}` : ''}`,
      action: () => navigate(`/admin/dashboard?id=${report.id}`)
    }));

    const inquiryItems = isAdminRoute ? adminInquiries.map(inquiry => ({
      id: `inquiry-${inquiry.id}`,
      kind: 'contact',
      title: inquiry.name,
      subtitle: t('layout.inquiryPrefix', { email: inquiry.email }),
      action: () => navigate(`/admin/inquiries?id=${inquiry.id}`)
    })) : [];

    return [...routeItems, ...reportItems, ...inquiryItems];
  }, [isAdminRoute, navigate, userReports, adminReports, adminInquiries, t, i18n.language]);

  const filteredSearchTargets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return searchTargets.slice(0, 6);
    }

    return searchTargets
      .filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery, searchTargets]);

  const handleSearchSelect = (item) => {
    item.action();
    setIsSearchOpen(false);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter' && filteredSearchTargets.length > 0) {
      event.preventDefault();
      handleSearchSelect(filteredSearchTargets[0]);
    }
  };

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
              color: isAdminRoute ? '#0f172a' : 'var(--primary)',
              letterSpacing: '-0.5px' 
            }}>
              {isAdminRoute ? t('layout.brandAdmin') : t('layout.brandCitizen')}
            </span>
          </div>

          {/* Profile Card */}
          <div className={isAdminRoute ? 'glass-premium' : ''} style={profileCardStyle(isAdminRoute)}>
            <div style={avatarStyle}>
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'Felix'}`} alt="Profile" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ 
                fontSize: '13px', 
                fontWeight: 800, 
                color: isAdminRoute ? '#0f172a' : 'var(--text)',
                textTransform: 'capitalize',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }}>
                {user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ') : t('layout.guest')}
              </div>
              <div style={{ fontSize: '10px', color: isAdminRoute ? '#64748b' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {isUserAdmin ? t('layout.roleAdmin') : t('layout.roleCitizen')}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ marginTop: '40px', display: 'grid', gap: '6px' }}>
            {isAdminRoute ? (
              // Specialized Admin Navigation
              <>
                <div style={sectionLabelStyle(true)}>{t('layout.sectionCommand')}</div>
                <SidebarLink to="/admin/dashboard" icon={<Wrench size={20} />} label={t('layout.navReportsConsole')} isAdmin={true} />
                <SidebarLink to="/admin/inquiries" icon={<Inbox size={20} />} label={t('layout.navInquiries')} isAdmin={true} />
                <SidebarLink to="/admin/improvements" icon={<Sparkles size={20} />} label={t('layout.navImprovements')} isAdmin={true} />

                {/* Public Improvement Feed Widget */}
                <div style={{ marginTop: '32px' }}>
                  <div style={sectionLabelStyle(true)}>{t('layout.sectionPublicFeed')}</div>
                  <div style={{ display: 'grid', gap: '8px', padding: '0 16px' }}>
                    {adminSuggestions.length > 0 ? adminSuggestions.map(suggestion => (
                      <div key={suggestion.id} className="glass-premium" style={sidebarWidgetCardStyle}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <Sparkles size={14} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ fontSize: '11px', lineHeight: 1.4, fontWeight: 600, color: '#0f172a' }}>
                            "{suggestion.text}"
                          </div>
                        </div>
                        <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '6px', textAlign: 'right' }}>
                          — {suggestion.userEmail?.split('@')[0]}
                        </div>
                      </div>
                    )) : (
                      <div style={emptyWidgetStyle}>{t('layout.emptySuggestions')}</div>
                    )}
                  </div>
                </div>

                {/* Latest Queries Widget */}
                <div style={{ marginTop: '24px' }}>
                  <div style={sectionLabelStyle(true)}>{t('layout.sectionQueries')}</div>
                  <div style={{ display: 'grid', gap: '8px', padding: '0 16px' }}>
                    {adminInquiries.length > 0 ? adminInquiries.map(inquiry => (
                      <div key={inquiry.id} className="glass-premium" style={sidebarWidgetCardStyle}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <MessageSquare size={14} color="#0f766e" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {inquiry.name}
                            </div>
                            <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>
                              {inquiry.message?.substring(0, 45)}...
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div style={emptyWidgetStyle}>{t('layout.emptyInquiries')}</div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              // Standard Citizen Navigation
              <>
                <div style={sectionLabelStyle(false)}>{t('layout.sectionManagement')}</div>
                <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />} label={t('layout.navOverview')} isAdmin={false} />
                <SidebarLink to="/report" icon={<FileText size={20} />} label={t('layout.navReport')} isAdmin={false} />
                <SidebarLink to="/map" icon={<MapIcon size={20} />} label={t('layout.navMap')} isAdmin={false} />
                <SidebarLink to="/alerts" icon={<ShieldCheck size={20} />} label={t('layout.navAlerts')} isAdmin={false} />
              </>
            )}
            
            {isUserAdmin && !isAdminRoute && (
              <SidebarLink to="/admin/dashboard" icon={<Wrench size={20} />} label={t('layout.navAdminConsole')} isAdmin={false} />
            )}
            
            <button onClick={handleLogout} style={logoutButtonStyle(isAdminRoute)}>
              <LogOut size={20} /> {t('layout.logout')}
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={mainContentStyle}>
        <header style={{ ...topBarStyle, ...themeStyle.topBar }}>
          <div ref={searchRef} style={{ position: 'relative', width: '400px' }}>
            <Search size={18} style={topSearchIconStyle} />
            <input
              style={topSearchInputStyle}
              placeholder={t('layout.searchPlaceholder')}
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}

            {isSearchOpen && (
              <div style={searchDropdownStyle(isAdminRoute)}>
                <div style={searchDropdownHeaderStyle}>{t('layout.quickSearch')}</div>
                {filteredSearchTargets.length > 0 ? (
                  filteredSearchTargets.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchSelect(item)}
                      style={searchResultItemStyle}
                    >
                      <div>
                        <div style={searchResultTitleStyle}>{item.title}</div>
                        <div style={searchResultSubtitleStyle}>{item.subtitle}</div>
                      </div>
                      <ArrowUpRight size={16} color="#94a3b8" />
                    </button>
                  ))
                ) : (
                  <div style={emptyDropdownStateStyle}>{t('layout.noMatches')}</div>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {shouldShowUserUtilities && (
              <div ref={notificationsRef} style={{ position: 'relative' }}>
                <button
                  style={topIconStyle(isAdminRoute)}
                  onClick={() => setIsNotificationsOpen((current) => !current)}
                  aria-label={t('layout.ariaNotifications')}
                >
                  <Bell size={20} />
                  {approvedReports.length > 0 && <span style={notificationBadgeStyle}>{approvedReports.length}</span>}
                </button>
                {isNotificationsOpen && (
                  <div style={notificationDropdownStyle}>
                    <div style={notificationHeaderStyle}>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{t('layout.notifications')}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{t('layout.notificationsSub')}</div>
                    </div>
                    {approvedReports.length > 0 ? (
                      approvedReports.slice(0, 6).map((report) => (
                        <div key={report.id} style={notificationItemStyle}>
                          <div style={notificationIconWrapStyle}>
                            <CheckCircle2 size={16} color="#0f766e" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={notificationTitleStyle}>{t('layout.reportApproved', { type: report.type || 'Report' })}</div>
                            <div style={notificationSubtitleStyle}>{report.address || t('layout.locationPending')}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={emptyDropdownStateStyle}>{t('layout.noApprovedYet')}</div>
                    )}
                  </div>
                )}
              </div>
            )}
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
        ? (isAdmin ? '#0052cc' : 'var(--primary)') 
        : (isAdmin ? '#64748b' : 'var(--text-muted)'),
      background: isActive 
        ? (isAdmin ? 'rgba(0, 82, 204, 0.1)' : '#EBF2FF') 
        : 'transparent',
      borderLeft: isActive && isAdmin ? '4px solid #0052cc' : 'none',
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
  container: { background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f0f7ff 100%)' },
  sidebar: { background: 'rgba(255, 255, 255, 0.5)', borderRight: '1px solid rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(32px)' },
  topBar: { background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(32px)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)' }
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
  background: 'linear-gradient(135deg, #e0f2fe 0%, #d1fae5 100%)',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)'
};

const profileCardStyle = (isAdmin) => ({
  background: isAdmin ? '#ffffff' : 'var(--surface)',
  padding: '16px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  border: isAdmin ? '1px solid #dbe4f0' : 'none',
  boxShadow: isAdmin ? '0 14px 30px rgba(15, 23, 42, 0.06)' : 'none'
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
  color: isAdmin ? '#64748b' : 'var(--text-muted)',
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
  color: isAdmin ? '#94a3b8' : 'var(--text-muted)',
});

const searchInputStyle = (isAdmin) => ({
  paddingLeft: '56px',
  background: isAdmin ? '#ffffff' : '#F4F5F7',
  border: isAdmin ? '1px solid #dbe4f0' : 'none',
  color: isAdmin ? '#0f172a' : 'var(--text)',
  borderRadius: '14px'
});

const topIconStyle = (isAdmin) => ({
  position: 'relative',
  background: 'none',
  color: isAdmin ? '#64748b' : 'var(--text-muted)',
  padding: '10px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: isAdmin ? '1px solid #dbe4f0' : 'none',
  backgroundColor: isAdmin ? '#ffffff' : 'transparent'
});

const topAvatarStyle = (isAdmin) => ({
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  overflow: 'hidden',
  border: isAdmin ? '1px solid #bae6fd' : '2px solid var(--border)',
  boxShadow: isAdmin ? '0 10px 24px rgba(15, 23, 42, 0.08)' : 'none'
});

const searchDropdownStyle = (isAdmin) => ({
  position: 'absolute',
  top: 'calc(100% + 12px)',
  left: 0,
  width: '100%',
  padding: '10px',
  borderRadius: '18px',
  background: isAdmin ? 'rgba(255, 255, 255, 0.96)' : '#ffffff',
  border: '1px solid #dbe4f0',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
  zIndex: 200
});

const searchDropdownHeaderStyle = {
  padding: '8px 10px 10px',
  fontSize: '11px',
  fontWeight: 800,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.08em'
};

const searchResultItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '12px 10px',
  borderRadius: '14px',
  background: 'transparent',
  textAlign: 'left'
};

const searchResultTitleStyle = {
  fontSize: '14px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '3px'
};

const searchResultSubtitleStyle = {
  fontSize: '12px',
  color: '#64748b'
};

const notificationDropdownStyle = {
  position: 'absolute',
  top: 'calc(100% + 12px)',
  right: 0,
  width: '320px',
  padding: '10px',
  borderRadius: '18px',
  background: '#ffffff',
  border: '1px solid #dbe4f0',
  boxShadow: '0 20px 40px rgba(15, 23, 42, 0.12)',
  zIndex: 200
};

const notificationHeaderStyle = {
  padding: '10px 10px 12px',
  borderBottom: '1px solid #eef2f7',
  marginBottom: '8px'
};

const notificationItemStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
  padding: '12px 10px',
  borderRadius: '14px'
};

const notificationIconWrapStyle = {
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  background: '#ecfdf5',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const notificationTitleStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#0f172a',
  marginBottom: '3px'
};

const notificationSubtitleStyle = {
  fontSize: '12px',
  color: '#64748b'
};

const notificationBadgeStyle = {
  position: 'absolute',
  top: '6px',
  right: '6px',
  minWidth: '18px',
  height: '18px',
  borderRadius: '999px',
  background: '#ef4444',
  color: '#ffffff',
  fontSize: '11px',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 5px'
};

const emptyDropdownStateStyle = {
  padding: '14px 10px',
  fontSize: '13px',
  color: '#64748b'
};

const sidebarWidgetCardStyle = {
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.8)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
};

const emptyWidgetStyle = {
  fontSize: '11px',
  color: '#94a3b8',
  fontStyle: 'italic',
  padding: '10px',
  textAlign: 'center'
};

export default DashboardLayout;
const topSearchIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8',
  zIndex: 1
};

const topSearchInputStyle = {
  width: '100%',
  padding: '12px 14px 12px 42px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  fontSize: '14px',
  outline: 'none',
  background: 'rgba(255, 255, 255, 0.4)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
  transition: 'all 0.2s'
};
