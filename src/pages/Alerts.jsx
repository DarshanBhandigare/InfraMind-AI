import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  TriangleAlert
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
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);

const severityOptions = ['All', 'Critical', 'High Risk', 'Medium', 'Low'];

const severityOptionTKey = (option) => `alerts.severityOption.${String(option).replace(/ /g, '_')}`;

const getSeverityLabel = (score = 0) => {
  if (score >= 85) return 'Critical';
  if (score >= 70) return 'High Risk';
  if (score >= 50) return 'Medium';
  return 'Low';
};

const getSeverityIcon = (severity) => {
  switch (severity) {
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

const getMonthBuckets = (count = 7) => {
  const now = new Date();
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      month: date.getMonth()
    };
  });
};

const Alerts = () => {
  const { t, i18n } = useTranslation();
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

  const allAlerts = useMemo(() => alerts, [alerts]);

  const filteredAlerts = useMemo(
    () => (filter === 'All' ? allAlerts : allAlerts.filter((alert) => getSeverityLabel(alert.score) === filter)),
    [allAlerts, filter]
  );

  const overviewStats = useMemo(() => {
    const critical = allAlerts.filter((alert) => getSeverityLabel(alert.score) === 'Critical').length;
    const high = allAlerts.filter((alert) => getSeverityLabel(alert.score) === 'High Risk').length;
    const medium = allAlerts.filter((alert) => getSeverityLabel(alert.score) === 'Medium').length;
    const low = allAlerts.filter((alert) => getSeverityLabel(alert.score) === 'Low').length;
    const closedStatuses = ['approved', 'resolved', 'rejected'];
    const closed = allAlerts.filter((alert) => closedStatuses.includes(alert.status?.toLowerCase())).length;
    const systemHealth = allAlerts.length > 0 ? Math.round(((allAlerts.length - critical) / allAlerts.length) * 100) : 100;
    const averageIssueAge =
      allAlerts.length > 0
        ? (
          allAlerts.reduce((sum, alert) => sum + (Number.isFinite(alert.daysDelayed) ? alert.daysDelayed : 0), 0) /
          allAlerts.length
        ).toFixed(1)
        : '0.0';

    return {
      active: allAlerts.length,
      critical,
      high,
      medium,
      low,
      health: `${systemHealth}%`,
      closed,
      totalReports: allAlerts.length,
      averageIssueAge: `${averageIssueAge}d`
    };
  }, [allAlerts]);

  const trendData = useMemo(() => {
    const monthBuckets = getMonthBuckets(7);
    const closedStatuses = ['approved', 'resolved', 'rejected'];

    return {
      labels: monthBuckets.map((bucket) => bucket.label),
      datasets: [
        {
          label: t('alerts.chartReports'),
          data: monthBuckets.map((bucket) =>
            allAlerts.filter((alert) => {
              const date = new Date(alert.createdAt);
              return date.getFullYear() === bucket.year && date.getMonth() === bucket.month;
            }).length
          ),
          borderColor: '#1cc9ff',
          backgroundColor: 'rgba(28, 201, 255, 0.14)',
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 5
        },
        {
          label: t('alerts.chartClosed'),
          data: monthBuckets.map((bucket) =>
            allAlerts.filter((alert) => {
              const date = new Date(alert.createdAt);
              return (
                closedStatuses.includes(alert.status?.toLowerCase()) &&
                date.getFullYear() === bucket.year &&
                date.getMonth() === bucket.month
              );
            }).length
          ),
          borderColor: '#22d37f',
          backgroundColor: 'rgba(34, 211, 127, 0.10)',
          fill: true,
          tension: 0.38,
          pointRadius: 4,
          pointHoverRadius: 5
        }
      ]
    };
  }, [allAlerts, t, i18n.language]);

  const categoryCounts = useMemo(() => {
    const counts = { Pothole: 0, Drainage: 0, Lighting: 0, Pipeline: 0, Other: 0 };
    allAlerts.forEach((alert) => {
      const type = alert.type?.toLowerCase() || '';
      if (type.includes('pothole')) counts.Pothole += 1;
      else if (type.includes('drain')) counts.Drainage += 1;
      else if (type.includes('light')) counts.Lighting += 1;
      else if (type.includes('pipe')) counts.Pipeline += 1;
      else counts.Other += 1;
    });
    return Object.values(counts);
  }, [allAlerts]);

  const categoryChartData = useMemo(
    () => ({
      labels: [t('alerts.catPotholes'), t('alerts.catDrains'), t('alerts.catStreetlights'), t('alerts.catPipelines'), t('alerts.catOther')],
      datasets: [
        {
          data: categoryCounts,
          backgroundColor: ['#ff174f', '#ff7a00', '#ffb300', '#2563eb', '#1cc9ff'],
          borderWidth: 0,
          cutout: '56%'
        }
      ]
    }),
    [categoryCounts, t, i18n.language]
  );

  const tableRows = useMemo(
    () =>
      allAlerts
        .filter((alert) => {
          const severity = getSeverityLabel(alert.score);
          return severity === 'Critical' || severity === 'High Risk';
        })
        .slice(0, 4)
        .map((alert) => ({
          id: `#${alert.id.substring(0, 6).toUpperCase()}`,
          issue: alert.type,
          ward: alert.displayAddress?.split(',')[0] || t('alerts.wardDefault'),
          risk: `${alert.score} ${getSeverityLabel(alert.score).toUpperCase()}`,
          status: alert.status,
          reported: new Date(alert.createdAt).toLocaleDateString(),
          color: alert.color
        })),
    [allAlerts, t]
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: '100px', background: 'transparent' }}>
      <div className="alerts-layout">
        <aside className="alerts-sidebar" style={currentView === 'overview' ? lightOverviewSidebarStyle : sidebarStyle}>
          <div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: currentView === 'overview' ? '#7f8db4' : 'var(--text-muted)',
                marginBottom: '12px',
                letterSpacing: currentView === 'overview' ? '1.5px' : 'normal',
                textTransform: currentView === 'overview' ? 'uppercase' : 'none'
              }}
            >
              {currentView === 'overview' ? t('alerts.authorityPanel') : t('alerts.mumbaiControl')}
            </div>
            <h2 style={{ fontSize: '38px', lineHeight: 1, marginBottom: '8px', color: '#091E42' }}>{t('alerts.cityControl')}</h2>
            <div style={{ color: currentView === 'overview' ? '#8ea0c9' : 'var(--text-muted)', fontSize: '16px' }}>
              {currentView === 'overview' ? t('alerts.bmcMumbai') : t('alerts.bmcCentral')}
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px', marginTop: '28px' }}>
            <SideNavItem
              icon={<LayoutGrid size={20} />}
              label={t('alerts.sideOverview')}
              active={currentView === 'overview'}
              onClick={() => setCurrentView('overview')}
            />
            <SideNavItem
              icon={<AlertTriangle size={20} />}
              label={t('alerts.sideAlerts')}
              active={currentView === 'alerts'}
              onClick={() => setCurrentView('alerts')}
            />
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '28px', borderTop: '1px solid var(--border)' }}>
            {currentView === 'overview' ? (
              <div style={{ display: 'grid', gap: '8px' }}>
                <div style={{ fontSize: '13px', color: '#7f8db4' }}>{t('alerts.loggedInAs')}</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#091E42' }}>{t('alerts.officer')}</div>
                <div style={{ fontSize: '15px', color: '#2cb9ff' }}>{t('alerts.bmcMumbai')}</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1.4px', textTransform: 'uppercase', color: '#15803d', marginBottom: '18px' }}>
                  {t('alerts.systemStatus')}
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
            <AlertsPanel filter={filter} setFilter={setFilter} filteredAlerts={filteredAlerts} overviewStats={overviewStats} />
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
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span
            key={index}
            style={{
              backgroundColor: 'rgba(28, 201, 255, 0.3)',
              color: '#091E42',
              fontWeight: 800,
              borderRadius: '2px',
              padding: '0 2px'
            }}
          >
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
};

const AlertsPanel = ({ filter, setFilter, filteredAlerts, overviewStats }) => {
  const { t } = useTranslation();
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

  const dynamicSuggestions = useMemo(() => {
    const suggestions = new Set();
    filteredAlerts.forEach((alert) => {
      if (alert.type) suggestions.add(alert.type);
      if (alert.displayAddress) suggestions.add(alert.displayAddress.split(',')[0]);
      suggestions.add(getSeverityLabel(alert.score));
    });
    return Array.from(suggestions);
  }, [filteredAlerts]);

  const filteredSuggestions = dynamicSuggestions.filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));

  const displayedAlerts = useMemo(() => {
    if (!searchQuery) return filteredAlerts;
    const lowerQuery = searchQuery.toLowerCase();
    return filteredAlerts.filter(
      (alert) =>
        (alert.type && alert.type.toLowerCase().includes(lowerQuery)) ||
        (alert.description && alert.description.toLowerCase().includes(lowerQuery)) ||
        (alert.displayAddress && alert.displayAddress.toLowerCase().includes(lowerQuery)) ||
        getSeverityLabel(alert.score).toLowerCase().includes(lowerQuery)
    );
  }, [filteredAlerts, searchQuery]);

  return (
    <>
      <div style={topBarStyle}>
        <div ref={searchRef} style={{ position: 'relative', zIndex: 50 }}>
          <div
            style={{
              ...searchWrapStyle,
              maxWidth: '420px', width: '100%',
              background: showSuggestions ? 'white' : '#e9eef6',
              border: showSuggestions ? '1px solid #dbe3ee' : '1px solid transparent',
              boxShadow: showSuggestions ? '0 8px 24px rgba(15, 23, 42, 0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Search size={20} color={showSuggestions ? 'var(--primary)' : 'var(--text-muted)'} />
            <input
              className="input-field"
              placeholder={t('alerts.searchPlaceholder')}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSuggestions(true);
              }}
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
                    onMouseEnter={(event) => {
                      event.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.background = 'white';
                    }}
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
          {t('alerts.title')} <span style={{ color: 'var(--primary)' }}>{t('alerts.titleAccent')}</span>
        </h1>
        <p style={{ maxWidth: '820px', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {t('alerts.description')}
        </p>
      </section>

      <section style={controlsRowStyle}>
        <div style={filterGroupStyle}>
          <div style={filterLabelStyle}>{t('alerts.severityLabel')}</div>
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
              {t(severityOptionTKey(option))}
            </button>
          ))}
        </div>
      </section>

      <section className="alerts-card-grid">
        <AnimatePresence mode="popLayout">
          {displayedAlerts.map((alert, index) => (
            <AlertCard key={alert.id} alert={alert} index={index} searchQuery={searchQuery} />
          ))}
        </AnimatePresence>
      </section>

      {displayedAlerts.length === 0 && (
        <div className="card" style={{ marginTop: '22px', textAlign: 'center', padding: '48px 28px' }}>
          <ShieldCheck size={42} color="var(--safe)" style={{ marginBottom: '14px' }} />
          <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('alerts.noMatchTitle')}</h3>
          <p style={{ color: 'var(--text-muted)' }}>{t('alerts.noMatchBody')}</p>
        </div>
      )}

      <section style={overviewPanelStyle}>
        <div style={overviewStatStyle}>
          <div style={overviewLabelStyle}>{t('alerts.statActive')}</div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1 }}>{overviewStats.active}</div>
        </div>
        <div style={overviewStatStyle}>
          <div style={overviewLabelStyle}>{t('alerts.statCritical')}</div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: '#b91c1c' }}>{overviewStats.critical}</div>
        </div>
        <div style={{ ...overviewStatStyle, borderRight: 'none' }}>
          <div style={overviewLabelStyle}>{t('alerts.statSystemsOk')}</div>
          <div style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1, color: '#15803d' }}>{overviewStats.health}</div>
        </div>
      </section>
    </>
  );
};

const OverviewPanel = ({ overviewStats, trendData, categoryChartData, tableRows }) => {
  const { t } = useTranslation();
  const tableHeadings = [
    t('alerts.tableHeadId'),
    t('alerts.tableHeadIssue'),
    t('alerts.tableHeadWard'),
    t('alerts.tableHeadRisk'),
    t('alerts.tableHeadStatus'),
    t('alerts.tableHeadReported')
  ];
  return (
  <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
      <h1 style={{ fontSize: '48px', lineHeight: 1, letterSpacing: '-1px', color: '#091E42' }}>{t('alerts.infraOverview')}</h1>
      <div style={{ fontSize: '14px', color: '#7f8db4' }}>{t('alerts.liveData')}</div>
    </div>

    <section className="alerts-metric-grid">
      <OverviewMetricCard icon="CR" value={overviewStats.critical} label={t('alerts.metricCritical')} />
      <OverviewMetricCard icon="TR" value={overviewStats.totalReports.toLocaleString()} label={t('alerts.metricTotal')} />
      <OverviewMetricCard icon="CL" value={overviewStats.closed.toLocaleString()} label={t('alerts.metricClosed')} />
      <OverviewMetricCard icon="AG" value={overviewStats.averageIssueAge} label={t('alerts.metricAge')} />
    </section>

    <section className="alerts-chart-grid">
      <div style={overviewCardStyle}>
        <div style={overviewCardTitleStyle}>{t('alerts.trendTitle')}</div>
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
                  beginAtZero: true,
                  precision: 0,
                  grid: { color: 'rgba(120, 142, 191, 0.10)' },
                  ticks: { color: '#6b7a99' }
                }
              }
            }}
          />
        </div>
      </div>

      <div style={overviewCardStyle}>
        <div style={overviewCardTitleStyle}>{t('alerts.categoriesTitle')}</div>
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
        <div style={overviewCardTitleStyle}>{t('alerts.recentTitle')}</div>
        <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '14px' }}>{t('alerts.viewAll')}</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#172B4D' }}>
          <thead>
            <tr>
              {tableHeadings.map((heading, hi) => (
                <th key={hi} style={tableHeadingStyle}>{heading}</th>
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
};

const AlertCard = ({ alert, index, searchQuery = '' }) => {
  const { t } = useTranslation();
  const severity = getSeverityLabel(alert.score);
  const severityDisplay = t(severityOptionTKey(severity));
  const Icon = getSeverityIcon(severity);

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
          <span style={{ ...pillStyle, background: `${alert.color}15`, color: alert.color }}>{severityDisplay}</span>
          <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{new Date(alert.createdAt).toLocaleString()}</span>
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
          <span><HighlightedText text={alert.displayAddress} highlight={searchQuery} /></span>
        </div>
        {alert.isDelayed && (
          <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)' }}>{t('alerts.estAiCost')}</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)' }}>Rs {alert.aiData.estimatedCost.toLocaleString()}</div>
          </div>
        )}
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '15px',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <HighlightedText text={alert.description} highlight={searchQuery} />
        </p>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', paddingTop: '18px', borderTop: '1px solid #e5e7eb' }}>
        <div>
          <div style={overviewLabelStyle}>{t('alerts.cardStatus')}</div>
          <div style={{ fontWeight: 700, color: alert.color, marginTop: '4px' }}>{alert.status}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={overviewLabelStyle}>{t('alerts.cardRisk')}</div>
          <div style={{ fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>{alert.score}</div>
        </div>
      </div>
    </motion.article>
  );
};

const OverviewMetricCard = ({ icon, value, label }) => (
  <div style={overviewMetricCardStyle}>
    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: '18px' }}>
      <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#edf3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>
        {icon}
      </div>
    </div>
    <div style={{ fontSize: '42px', lineHeight: 1, fontWeight: 800, color: '#091E42', marginBottom: '8px' }}>{value}</div>
    <div style={{ fontSize: '15px', color: '#6b7a99' }}>{label}</div>
  </div>
);

const SideNavItem = ({ icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 18px',
      borderRadius: '14px',
      background: active ? 'white' : 'transparent',
      color: active ? 'var(--primary)' : 'var(--text)',
      justifyContent: 'flex-start',
      boxShadow: active ? '0 10px 30px rgba(15, 23, 42, 0.06)' : 'none'
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
