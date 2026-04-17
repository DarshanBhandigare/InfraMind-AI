import React, { useEffect, useMemo, useState, useRef } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  ChevronDown,
  CircleAlert,
  Clock3,
  FilePlus2,
  LayoutGrid,
  MapPin,
  Search,
  ShieldCheck,
  Siren,
  TriangleAlert,
  UserCircle2
} from 'lucide-react';
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const demoAlerts = [
  {
    id: 'bmc-alert-001',
    type: 'Bridge Surface Settlement Detected',
    category: 'Critical',
    color: '#dc2626',
    address: 'Eastern Freeway Ramp, Wadala',
    description: 'Road deck settlement and edge cracking were identified on the approach lane. Immediate barricading and structural inspection are recommended.',
    createdAtLabel: '12 min ago',
    score: 89,
    status: 'Immediate Action',
    tag: 'Critical'
  },
  {
    id: 'bmc-alert-002',
    type: 'Monsoon Drain Overflow Warning',
    category: 'High Risk',
    color: '#b45309',
    address: 'Sion Circle Junction',
    description: 'Stormwater capacity is nearing threshold during current rainfall. Field crew should clear inlet blockage before peak runoff reaches the corridor.',
    createdAtLabel: '26 min ago',
    score: 76,
    status: 'Escalated',
    tag: 'Weather'
  },
  {
    id: 'bmc-alert-003',
    type: 'Streetlight Outage Cluster',
    category: 'Medium',
    color: '#2563eb',
    address: 'Linking Road, Bandra West',
    description: 'A concentrated outage pocket is affecting visibility across a busy evening pedestrian stretch. Maintenance can be bundled into the next ward visit.',
    createdAtLabel: '48 min ago',
    score: 58,
    status: 'Scheduled',
    tag: 'System'
  },
  {
    id: 'bmc-alert-004',
    type: 'Water Main Refurbishment Window',
    category: 'Low',
    color: '#16a34a',
    address: 'DN Nagar Service Lane',
    description: 'Planned replacement work remains on track. Pressure may dip briefly overnight, but no active hazard is expected for surrounding blocks.',
    createdAtLabel: '2 hr ago',
    score: 34,
    status: 'Maintenance',
    tag: 'Maintenance'
  }
];

const severityOptions = ['All', 'Critical', 'High Risk', 'Medium', 'Low'];
const trendLabels = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

// formatAlert removed as it's now handled by processReport in dataSyncService

const getSeverityIcon = (category) => {
  switch (category) {
    case 'Critical':
      return Siren;
    case 'High Risk':
      return TriangleAlert;
    case 'Low':
      return ShieldCheck;
    default:
      return CircleAlert;
  }
};

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('All');
  const [currentView, setCurrentView] = useState('alerts');

  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAlerts(data.map(processReport));
    });

    return unsubscribe;
  }, []);

  const allAlerts = useMemo(() => (
    alerts.length > 0 ? alerts : demoAlerts.map(processReport)
  ), [alerts]);

  const filteredAlerts = useMemo(() => (
    filter === 'All' ? allAlerts : allAlerts.filter((alert) => alert.category === filter)
  ), [allAlerts, filter]);

  const overviewStats = useMemo(() => {
    const criticalCount = allAlerts.filter((alert) => alert.category === 'Critical').length;
    const highCount = allAlerts.filter((alert) => alert.category === 'High Risk').length;
    const mediumCount = allAlerts.filter((alert) => alert.category === 'Medium').length;
    const lowCount = allAlerts.filter((alert) => alert.category === 'Low').length;
    const operationalPct = Math.max(86, 100 - criticalCount * 3 - highCount * 2);
    const resolved = Math.round(allAlerts.length * 0.68 + 844);
    const totalReports = allAlerts.length * 42 + 1116;
    const avgResponseDays = (3.8 + criticalCount * 0.2).toFixed(1);

    return {
      active: allAlerts.length,
      critical: criticalCount,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      health: `${operationalPct}%`,
      resolved,
      totalReports,
      avgResponseDays: `${avgResponseDays}d`
    };
  }, [allAlerts]);

  const trendData = useMemo(() => {
    const base = overviewStats.active;
    return {
      labels: trendLabels,
      datasets: [
        {
          label: 'Complaints',
          data: [180, 220, 190, 305, 272, 338, 286].map((value) => value + base),
          borderColor: '#1cc9ff',
          backgroundColor: 'rgba(28, 201, 255, 0.14)',
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 5
        },
        {
          label: 'Resolved',
          data: [146, 185, 162, 242, 220, 281, 210].map((value) => value + Math.floor(base / 2)),
          borderColor: '#22d37f',
          backgroundColor: 'rgba(34, 211, 127, 0.10)',
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 5
        }
      ]
    };
  }, [overviewStats.active]);

  const categoryChartData = useMemo(() => ({
    labels: ['Potholes', 'Drains', 'Streetlights', 'Pipelines', 'Other'],
    datasets: [
      {
        data: [
          Math.max(8, overviewStats.critical + 7),
          Math.max(5, overviewStats.high + 4),
          Math.max(4, overviewStats.medium + 3),
          Math.max(3, overviewStats.low + 2),
          2
        ],
        backgroundColor: ['#ff174f', '#ff7a00', '#ffb300', '#2563eb', '#1cc9ff'],
        borderWidth: 0,
        cutout: '56%'
      }
    ]
  }), [overviewStats]);

  const tableRows = useMemo(() => (
    allAlerts
      .slice(0, 4)
      .map((alert, index) => ({
        id: `#IM-${1094 - index}`,
        issue: alert.type,
        ward: alert.address?.split(',')[0] || 'Mumbai Central',
        risk: `${alert.score} ${alert.category.toUpperCase()}`,
        status: alert.status,
        reported: alert.createdAtLabel,
        color: alert.color
      }))
  ), [allAlerts]);

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', background: 'transparent' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: 'calc(100vh - 100px)' }}>
        <aside style={currentView === 'overview' ? lightOverviewSidebarStyle : sidebarStyle}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: currentView === 'overview' ? '#7f8db4' : 'var(--text-muted)', marginBottom: '12px', letterSpacing: currentView === 'overview' ? '1.5px' : 'normal', textTransform: currentView === 'overview' ? 'uppercase' : 'none' }}>
              {currentView === 'overview' ? 'Authority Panel' : 'Mumbai Control'}
            </div>
            <h2 style={{ fontSize: '38px', lineHeight: 1, marginBottom: '8px', color: '#091E42' }}>City Control</h2>
            <div style={{ color: currentView === 'overview' ? '#8ea0c9' : 'var(--text-muted)', fontSize: '16px' }}>
              {currentView === 'overview' ? 'BMC Mumbai' : 'BMC Central District'}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px', marginTop: '28px' }}>
            <SideNavItem
              icon={<LayoutGrid size={20} />}
              label="Overview"
              active={currentView === 'overview'}
              dark={false}
              onClick={() => setCurrentView('overview')}
            />
            <SideNavItem
              icon={<AlertTriangle size={20} />}
              label="Alerts"
              active={currentView === 'alerts'}
              dark={false}
              onClick={() => setCurrentView('alerts')}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
            {currentView === 'overview' ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: '#7f8db4' }}>Logged in as</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#091E42' }}>Municipal Officer</div>
                <div style={{ fontSize: '15px', color: '#2cb9ff' }}>BMC Mumbai</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#15803d', marginBottom: '18px' }}>
                  System Status: Active
                </div>
                <div style={{ display: 'grid', gap: '14px', color: 'var(--text-muted)', fontSize: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Bell size={18} />
                    <span>Support</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock3 size={18} />
                    <span>Incident Log</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>

        <main style={{ padding: currentView === 'overview' ? '28px 26px 36px' : '34px 38px 40px' }}>
          {currentView === 'overview' ? (
            <OverviewPanel
              overviewStats={overviewStats}
              trendData={trendData}
              categoryChartData={categoryChartData}
              tableRows={tableRows}
            />
          ) : (
            <AlertsPanel
              filter={filter}
              setFilter={setFilter}
              filteredAlerts={filteredAlerts}
              overviewStats={overviewStats}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const HighlightedText = ({ text, highlight }) => {
  if (!text) return null;
  const strText = String(text);
  if (!highlight || !String(highlight).trim()) return <span>{strText}</span>;
  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = strText.split(regex);
  return (
    <span>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <span key={i} style={{ backgroundColor: 'rgba(28, 201, 255, 0.3)', color: '#091E42', fontWeight: 800, borderRadius: '2px', padding: '0 2px' }}>{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
};

const AlertsPanel = ({ filter, setFilter, filteredAlerts, overviewStats }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const dynamicSuggestions = useMemo(() => {
    const suggestions = new Set();
    filteredAlerts.forEach(alert => {
      if (alert.type) suggestions.add(alert.type);
      if (alert.tag) suggestions.add(alert.tag);
      if (alert.address) suggestions.add(alert.address.split(',')[0]);
    });
    if (suggestions.size < 5) {
      ["Potholes", "Water Logging", "Traffic Signal", "Pipeline Leakage"].forEach(s => suggestions.add(s));
    }
    return Array.from(suggestions);
  }, [filteredAlerts]);

  const filteredSuggestions = dynamicSuggestions.filter(item => 
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedAlerts = useMemo(() => {
    if (!searchQuery) return filteredAlerts;
    const lowerQuery = searchQuery.toLowerCase();
    return filteredAlerts.filter(alert => 
      (alert.type && alert.type.toLowerCase().includes(lowerQuery)) ||
      (alert.description && alert.description.toLowerCase().includes(lowerQuery)) ||
      (alert.address && alert.address.toLowerCase().includes(lowerQuery)) ||
      (alert.tag && alert.tag.toLowerCase().includes(lowerQuery))
    );
  }, [filteredAlerts, searchQuery]);

  return (
    <>
      <div style={topBarStyle}>
        <div ref={searchRef} style={{ position: 'relative', zIndex: 50 }}>
          <div style={{
            ...searchWrapStyle, 
            width: '420px', 
            background: showSuggestions ? 'white' : '#e9eef6', 
            border: showSuggestions ? '1px solid #dbe3ee' : '1px solid transparent', 
            boxShadow: showSuggestions ? '0 8px 24px rgba(15, 23, 42, 0.08)' : 'none',
            transition: 'all 0.2s ease'
          }}>
            <Search size={20} color={showSuggestions ? "var(--primary)" : "var(--text-muted)"} />
            <input
              className="input-field"
              placeholder="Search alerts, areas, or status..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSuggestions(true)}
              style={{ background: 'transparent', border: 'none', boxShadow: 'none', padding: 0, width: '100%', fontSize: '15px', outline: 'none', color: '#091E42' }}
            />
          </div>
          
          <AnimatePresence>
            {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '8px',
                  background: 'white',
                  borderRadius: '16px',
                  boxShadow: '0 12px 36px rgba(15, 23, 42, 0.12)',
                  border: '1px solid #dbe3ee',
                  overflow: 'hidden'
                }}
              >
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                    }}
                    style={{
                      padding: '12px 20px',
                      cursor: 'pointer',
                      borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <Search size={14} color="var(--text-muted)" />
                    <span style={{ fontSize: '14px', color: '#091E42', fontWeight: 500 }}>
                      <HighlightedText text={suggestion} highlight={searchQuery} />
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    <section style={{ marginTop: '28px', marginBottom: '34px' }}>
      <h1 style={{ fontSize: '48px', lineHeight: 1, letterSpacing: '-1px', marginBottom: '16px' }}>
        InfraMind AI <span style={{ color: 'var(--primary)' }}>Alerts</span>
      </h1>
      <p style={{ maxWidth: '820px', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Real-time intelligence feed monitoring the pulse of Mumbai infrastructure. Predictive analysis and critical response coordination for BMC teams.
      </p>
    </section>

    <section style={controlsRowStyle}>
      <div style={filterGroupStyle}>
        <div style={filterLabelStyle}>Severity</div>
        {severityOptions.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            style={{
              ...filterChipStyle,
              background: filter === option ? 'white' : 'transparent',
              color: filter === option ? 'var(--primary)' : 'var(--text)',
              boxShadow: filter === option ? '0 6px 20px rgba(15, 23, 42, 0.08)' : 'none'
            }}
          >
            {option}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <button style={typeButtonStyle}>
          All Alert Types <ChevronDown size={16} />
        </button>
        <button className="btn-primary" style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 14px 26px rgba(0, 82, 204, 0.22)' }}>
          <FilePlus2 size={18} /> New Report
        </button>
      </div>
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '22px', alignItems: 'start' }}>
      <AnimatePresence mode="popLayout">
        {displayedAlerts.map((alert, index) => (
          <AlertCard key={alert.id} alert={alert} index={index} searchQuery={searchQuery} />
        ))}
      </AnimatePresence>
    </section>

    {displayedAlerts.length === 0 && (
      <div className="card" style={{ marginTop: '22px', textAlign: 'center', padding: '48px 28px' }}>
        <ShieldCheck size={42} color="var(--safe)" style={{ marginBottom: '14px' }} />
        <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>No matching alerts found</h3>
        <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search query or filters.</p>
      </div>
    )}

    <section style={overviewPanelStyle}>
      <div style={overviewStatStyle}>
        <div style={overviewLabelStyle}>Active Alerts</div>
        <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{overviewStats.active}</div>
      </div>
      <div style={overviewStatStyle}>
        <div style={overviewLabelStyle}>Critical Cases</div>
        <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: '#b91c1c' }}>{overviewStats.critical}</div>
      </div>
      <div style={{ ...overviewStatStyle, borderRight: 'none' }}>
        <div style={overviewLabelStyle}>Systems Ok</div>
        <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: '#15803d' }}>{overviewStats.health}</div>
      </div>
    </section>
  </>
  );
};

const OverviewPanel = ({ overviewStats, trendData, categoryChartData, tableRows }) => (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
      <h1 style={{ fontSize: '48px', lineHeight: 1, letterSpacing: '-1px', color: '#091E42' }}>Infrastructure Overview</h1>
      <div style={{ fontSize: '14px', color: '#7f8db4' }}>Last updated: Just now · Mumbai</div>
    </div>

    <section style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '22px' }}>
      <OverviewMetricCard icon="🚨" value={overviewStats.critical + 21} label="Critical Zones" delta="+12%" deltaColor="#22d37f" />
      <OverviewMetricCard icon="📋" value={overviewStats.totalReports.toLocaleString()} label="Total Reports (30d)" delta="+8%" deltaColor="#22d37f" />
      <OverviewMetricCard icon="✅" value={overviewStats.resolved.toLocaleString()} label="Issues Resolved" delta="-3%" deltaColor="#ff4d7d" />
      <OverviewMetricCard icon="⏱" value={overviewStats.avgResponseDays} label="Avg Response Time" delta="-18%" deltaColor="#ff4d7d" />
    </section>

    <section style={{ display: 'grid', gridTemplateColumns: '1.45fr 0.95fr', gap: '18px', marginBottom: '20px' }}>
      <div style={overviewCardStyle}>
        <div style={overviewCardTitleStyle}>Complaint Trend (Last 7 Months)</div>
        <div style={{ height: '250px', marginTop: '22px' }}>
          <Line
            data={trendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  labels: { color: '#6b7a99', boxWidth: 24 }
                }
              },
              scales: {
                x: {
                  grid: { color: 'rgba(120, 142, 191, 0.10)' },
                  ticks: { color: '#6b7a99' }
                },
                y: {
                  grid: { color: 'rgba(120, 142, 191, 0.10)' },
                  ticks: { color: '#6b7a99' }
                }
              }
            }}
          />
        </div>
      </div>

      <div style={overviewCardStyle}>
        <div style={overviewCardTitleStyle}>Issue Categories</div>
        <div style={{ height: '250px', marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Doughnut
            data={categoryChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#6b7a99',
                    boxWidth: 12,
                    padding: 16
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </section>

    <section style={overviewCardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div style={overviewCardTitleStyle}>Recent High-Priority Complaints</div>
        <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>View All</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#172B4D' }}>
          <thead>
            <tr>
              {['ID', 'Issue', 'Ward', 'Risk Score', 'Status', 'Reported'].map((heading) => (
                <th key={heading} style={tableHeadingStyle}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => (
              <tr key={row.id} style={{ borderTop: '1px solid rgba(132, 149, 196, 0.12)' }}>
                <td style={tableCellStyle}>{row.id}</td>
                <td style={tableCellStyle}>{row.issue}</td>
                <td style={tableCellStyle}>{row.ward}</td>
                <td style={tableCellStyle}>
                  <span style={{ display: 'inline-flex', padding: '6px 10px', borderRadius: '999px', background: `${row.color}20`, color: row.color, fontWeight: 800, fontSize: '12px' }}>
                    {row.risk}
                  </span>
                </td>
                <td style={tableCellStyle}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '999px', background: row.color, display: 'inline-block' }}></span>
                    {row.status}
                  </span>
                </td>
                <td style={tableCellStyle}>{row.reported}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </>
);

const AlertCard = ({ alert, index, searchQuery = '' }) => {
  const Icon = getSeverityIcon(alert.category);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.26, delay: index * 0.03 }}
      className="card"
      style={{
        minHeight: index % 3 === 0 ? '420px' : '390px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        borderRadius: '20px',
        padding: '28px',
        background: 'rgba(255,255,255,0.92)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ ...pillStyle, background: `${alert.color}15`, color: alert.color }}>
            {alert.tag}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{alert.createdAtLabel}</span>
        </div>

        <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: `${alert.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={26} color={alert.color} />
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '25px', lineHeight: 1.25, marginBottom: '14px', maxWidth: '320px' }}>
          <HighlightedText text={alert.type} highlight={searchQuery} />
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '15px', marginBottom: '12px' }}>
          <MapPin size={15} />
          <span><HighlightedText text={alert.address || 'Mumbai location pending'} highlight={searchQuery} /></span>
        </div>
        {alert.isDelayed && (
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>EST. AI COST</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>₹{alert.aiData.estimatedCost.toLocaleString()}</div>
          </div>
        )}
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', lineHeight: 1.7 }}>
          <HighlightedText text={alert.description} highlight={searchQuery} />
        </p>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', paddingTop: '18px', borderTop: '1px solid #e5e7eb' }}>
        <div>
          <div style={overviewLabelStyle}>Status</div>
          <div style={{ fontWeight: 700, color: alert.color, marginTop: '4px' }}>{alert.status}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={overviewLabelStyle}>Risk Score</div>
          <div style={{ fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>{alert.score}</div>
        </div>
      </div>
    </motion.article>
  );
};

const OverviewMetricCard = ({ icon, value, label, delta, deltaColor }) => (
  <div style={overviewMetricCardStyle}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#edf3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
        {icon}
      </div>
      <span style={{ color: deltaColor, fontSize: '13px', fontWeight: 800 }}>{delta}</span>
    </div>
    <div style={{ fontSize: '42px', lineHeight: 1, fontWeight: 800, color: '#091E42', marginBottom: '8px' }}>{value}</div>
    <div style={{ fontSize: '15px', color: '#6b7a99' }}>{label}</div>
  </div>
);

const SideNavItem = ({ icon, label, active = false, dark = false, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 18px',
      borderRadius: '14px',
      background: active ? (dark ? 'linear-gradient(135deg, #16337a, #1a4fd0)' : 'white') : 'transparent',
      color: active ? (dark ? 'white' : 'var(--primary)') : (dark ? '#9db0da' : 'var(--text)'),
      justifyContent: 'flex-start',
      boxShadow: active ? (dark ? '0 12px 30px rgba(13, 68, 214, 0.25)' : '0 10px 30px rgba(15, 23, 42, 0.06)') : 'none'
    }}
  >
    {icon}
    <span style={{ fontSize: '18px', fontWeight: active ? 700 : 500 }}>{label}</span>
  </button>
);

const sidebarStyle = {
  background: '#eef3f9',
  borderRight: '1px solid #dbe3ee',
  padding: '34px 20px 30px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const lightOverviewSidebarStyle = {
  background: '#f8fbff',
  borderRight: '1px solid var(--border)',
  padding: '28px 16px 30px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const topBarStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '18px'
};

const searchWrapStyle = {
  width: '360px',
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  background: '#e9eef6',
  borderRadius: '16px',
  padding: '14px 18px'
};

const controlsRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '24px',
  flexWrap: 'wrap'
};

const filterGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: '#e5e7eb',
  borderRadius: '18px',
  padding: '8px'
};

const filterLabelStyle = {
  fontSize: '13px',
  fontWeight: 800,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  color: 'var(--text)',
  padding: '0 12px'
};

const filterChipStyle = {
  padding: '12px 18px',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: 600
};

const typeButtonStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '16px 18px',
  borderRadius: '14px',
  background: '#eef2f7',
  color: 'var(--text)',
  fontWeight: 600
};

const pillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '5px 12px',
  borderRadius: '8px',
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '1px'
};

const overviewPanelStyle = {
  marginTop: '26px',
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '0',
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  overflow: 'hidden'
};

const overviewStatStyle = {
  padding: '28px 30px',
  borderRight: '1px solid var(--border)'
};

const overviewLabelStyle = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '1.2px',
  color: 'var(--text-muted)'
};

const overviewCardStyle = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '22px',
  padding: '22px'
};

const overviewCardTitleStyle = {
  fontSize: '22px',
  color: '#091E42',
  fontWeight: 700
};

const overviewMetricCardStyle = {
  background: 'white',
  border: '1px solid var(--border)',
  borderRadius: '20px',
  padding: '22px'
};

const tableHeadingStyle = {
  textAlign: 'left',
  padding: '14px 12px',
  color: '#6b7a99',
  fontSize: '13px',
  fontWeight: 700
};

const tableCellStyle = {
  padding: '14px 12px',
  color: '#172B4D',
  fontSize: '14px'
};

export default Alerts;
