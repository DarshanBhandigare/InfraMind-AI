import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';
import {
  Activity,
  AlertTriangle,
  Check,
  Lightbulb,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
  Waves,
  X
} from 'lucide-react';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

const MUMBAI_CENTER = [19.076, 72.8777];
const MUMBAI_BOUNDS = {
  minLat: 18.0,
  maxLat: 20.0,
  minLng: 72.0,
  maxLng: 74.0
};

const isInMumbaiRegion = (location) => {
  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    return false;
  }

  return (
    location.lat >= MUMBAI_BOUNDS.minLat &&
    location.lat <= MUMBAI_BOUNDS.maxLat &&
    location.lng >= MUMBAI_BOUNDS.minLng &&
    location.lng <= MUMBAI_BOUNDS.maxLng
  );
};

const normalizeReport = (report) => ({
  ...report,
  color: report.color || '#2563eb',
  score: report.score || 60,
  status: report.status || 'Action Required',
  impactLabel: report.score ? `${(report.score / 10).toFixed(1)}/10` : '6.0/10',
  assets: report.assets || ['BMC Road Segment', 'Ward Operations Queue'],
  image: report.imageUrl || report.image || null
});

const getIssueIcon = (issueType) => {
  const normalized = (issueType || '').toLowerCase();
  if (normalized.includes('drain')) return Waves;
  if (normalized.includes('light')) return Lightbulb;
  return AlertTriangle;
};

const MapFocus = ({ issue }) => {
  const map = useMap();

  useEffect(() => {
    if (issue?.location) {
      map.flyTo([issue.location.lat, issue.location.lng], 13, {
        animate: true,
        duration: 1.1
      });
    }
  }, [issue, map]);

  return null;
};

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const autoSelectedRef = useRef(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1440 : window.innerWidth
  );
  const [issueFilters, setIssueFilters] = useState({
    Potholes: true,
    Drainage: true,
    Lighting: true,
    'Water Leakage': true,
    'Traffic System': true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map((doc) => processReport({ id: doc.id, ...doc.data() }));
      setReports(
        data.filter(
          (report) =>
            report.location &&
            (report.status?.toLowerCase() === 'approved' || report.originalStatus?.toLowerCase() === 'approved')
        )
      );
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const baseReports = useMemo(() => {
    const normalizedReports = reports.map(normalizeReport);
    return normalizedReports.filter((report) => isInMumbaiRegion(report.location));
  }, [reports]);

  const displayReports = useMemo(() => {
    const activeKeys = Object.entries(issueFilters)
      .filter(([, enabled]) => enabled)
      .map(([key]) => key.toLowerCase());

    if (!activeKeys.length) {
      return [];
    }

    return baseReports.filter((report) => {
      const normalizedType = (report.type || '').toLowerCase();
      return activeKeys.some((key) => {
        const cleanKey = key.toLowerCase();
        return normalizedType.includes(cleanKey) || (normalizedType.includes('light') && cleanKey.includes('light'));
      });
    });
  }, [baseReports, issueFilters]);

  const selectedIssue = useMemo(
    () => (selectedIssueId ? displayReports.find((report) => report.id === selectedIssueId) || null : null),
    [displayReports, selectedIssueId]
  );

  const severitySummary = useMemo(
    () =>
      displayReports.reduce(
        (acc, report) => {
          const score = Number(report.score) || 0;
          if (score >= 80) acc.critical += 1;
          else if (score >= 55) acc.medium += 1;
          else acc.low += 1;
          return acc;
        },
        { critical: 0, medium: 0, low: 0 }
      ),
    [displayReports]
  );

  useEffect(() => {
    if (!displayReports.length) {
      if (selectedIssueId) setSelectedIssueId(null);
      return;
    }

    if (!autoSelectedRef.current) {
      setSelectedIssueId(displayReports[0].id);
      autoSelectedRef.current = true;
    } else if (selectedIssueId && !displayReports.some((report) => report.id === selectedIssueId)) {
      setSelectedIssueId(null);
    }
  }, [displayReports, selectedIssueId]);

  const isTablet = viewportWidth < 1280;
  const isMobile = viewportWidth < 960;

  return (
    <div style={mapShellStyle(isMobile)}>
      <div style={mapAmbientGlowStyle} />

      <MapContainer
        center={MUMBAI_CENTER}
        zoom={12}
        style={mapCanvasStyle(isTablet, isMobile)}
        zoomControl={false}
      >
        <MapFocus issue={selectedIssue} />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; CARTO"
        />

        {displayReports.map((report) => (
          <React.Fragment key={report.id}>
            <Circle
              center={[report.location.lat, report.location.lng]}
              radius={report.isDelayed ? 450 : 300}
              pathOptions={{
                fillColor: report.color,
                color: report.color,
                fillOpacity: report.isDelayed ? 0.38 : 0.18,
                weight: report.isDelayed ? 2 : 1,
                dashArray: report.isDelayed ? [5, 5] : null
              }}
            />
            <Marker
              position={[report.location.lat, report.location.lng]}
              eventHandlers={{ click: () => setSelectedIssueId(report.id) }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      <aside style={mapSidebarStyle(isTablet, isMobile)}>
        <div style={sidebarHeroCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
            <div>
              <div style={eyebrowStyle}>Live Operations Map</div>
              <h2 style={sidebarTitleStyle}>Mumbai civic signals, cleaned up and ready to scan.</h2>
              <p style={sidebarSubtitleStyle}>
                Filter approved reports, inspect hotspots, and jump straight into the most urgent citizen evidence.
              </p>
            </div>
            <div style={sidebarBadgeStyle}>
              <Activity size={18} color="#2563eb" />
            </div>
          </div>

          <div style={sidebarStatGridStyle}>
            <MiniStat label="Visible reports" value={displayReports.length} />
            <MiniStat label="Critical" value={severitySummary.critical} tone="critical" />
            <MiniStat label="Selected zone" value={selectedIssue ? '1' : '0'} />
          </div>
        </div>

        <div style={sidebarSectionStyle}>
          <div style={sectionHeaderRowStyle}>
            <h4 style={sidebarHeadingStyle}>Issue Type</h4>
            <div style={sectionPillStyle}>
              <SlidersHorizontal size={12} />
              Filters
            </div>
          </div>
          <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
            {Object.keys(issueFilters).map((key) => (
              <FilterCheckbox
                key={key}
                label={key}
                checked={issueFilters[key]}
                onChange={() => toggleIssueFilter(key, setIssueFilters)}
              />
            ))}
          </div>
        </div>

        <div style={sidebarSectionStyle}>
          <h4 style={sidebarHeadingStyle}>Severity</h4>
          <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
            <SeverityPill
              label="High / Critical"
              color="#fff1f2"
              textColor="#b91c1c"
              accent="#ef4444"
              icon="!"
              count={severitySummary.critical}
            />
            <SeverityPill
              label="Medium Risk"
              color="#fffbeb"
              textColor="#a16207"
              accent="#f59e0b"
              icon="^"
              count={severitySummary.medium}
            />
            <SeverityPill
              label="Low Priority"
              color="#ecfdf5"
              textColor="#15803d"
              accent="#22c55e"
              icon="+"
              count={severitySummary.low}
            />
          </div>
        </div>

        <div className="card" style={reportLayerCardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
            <div style={{ ...sidebarHeadingStyle, color: 'var(--primary)', fontSize: '11px' }}>BMC Mumbai Demo Layer</div>
            <div style={mapLiveBadgeStyle}>
              <span style={liveDotStyle} />
              Live
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            Map shows approved reports using citizen evidence.
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {displayReports.slice(0, 3).map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedIssueId(report.id)}
                style={reportListItemStyle(selectedIssue?.id === report.id)}
              >
                <IssueIcon issueType={report.type} color={report.color} />
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={reportTitleStyle}>{report.type}</div>
                  <div style={reportSubtitleStyle}>{report.displayAddress}</div>
                </div>
                <div style={reportScoreChipStyle(report.color)}>{report.score}</div>
              </button>
            ))}
            {!displayReports.length && (
              <div style={emptySidebarStateStyle}>No approved reports match the current filter set.</div>
            )}
          </div>
        </div>
      </aside>

      {selectedIssue && (
        <div style={detailPanelStyle(isTablet, isMobile)}>
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <span style={referenceChipStyle}>REF: {selectedIssue.id.substring(0, 8).toUpperCase()}</span>
              <button onClick={() => setSelectedIssueId(null)} style={closeButtonStyle} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '10px', lineHeight: 1.15 }}>{selectedIssue.type}</h2>
            <div style={detailMetaRowStyle}>
              <DetailMetaChip icon={<MapPin size={14} />} label={selectedIssue.displayAddress || 'Pinned location'} />
              <DetailMetaChip icon={<ShieldAlert size={14} />} label={`Risk ${selectedIssue.impactLabel}`} />
            </div>
          </div>

          <div style={{ position: 'relative', height: isMobile ? '180px' : '220px', padding: '0 24px' }}>
            {selectedIssue.image ? (
              <img
                src={selectedIssue.image}
                alt={selectedIssue.type}
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
              />
            ) : (
              <div style={emptyImageStyle}>
                <AlertTriangle size={28} color="#94a3b8" />
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#475569' }}>No uploaded image available</div>
                <div style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', maxWidth: '240px' }}>
                  This approved report did not include a usable evidence image.
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ ...detailLabelStyle, marginBottom: '10px' }}>Description</div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
              {selectedIssue.description || 'Identified risk requiring immediate assessment and resolution strategy.'}
            </p>

            <div style={detailStatsGridStyle(isMobile)}>
              <InfoPanel title="Status" value={selectedIssue.status || 'Action Required'} tone={selectedIssue.color} />
              <InfoPanel
                title="Coordinates"
                value={`${selectedIssue.location.lat.toFixed(4)}, ${selectedIssue.location.lng.toFixed(4)}`}
              />
            </div>

            {selectedIssue.isDelayed && selectedIssue.aiData && (
              <div style={aiPanelStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                  <div style={{ ...detailLabelStyle, color: '#0369a1', margin: 0 }}>AI ESTIMATED COST</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>
                    Rs {selectedIssue.aiData.estimatedCost.toLocaleString()}
                  </div>
                </div>
                <div style={detailLabelStyle}>AI WORK PLAN</div>
                <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '13px', color: '#0c4a6e', lineHeight: 1.5 }}>
                  {selectedIssue.aiData.requiredWork.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const toggleIssueFilter = (key, setIssueFilters) => {
  setIssueFilters((current) => ({
    ...current,
    [key]: !current[key]
  }));
};

const FilterCheckbox = ({ label, checked, onChange }) => (
  <label style={filterCheckboxStyle(checked)}>
    <span style={{ display: 'flex', alignItems: 'center', gap: '12px', color: checked ? '#0f172a' : '#334155' }}>
      <span style={checkboxIndicatorStyle(checked)}>{checked ? <Check size={13} strokeWidth={3} /> : null}</span>
      {label}
    </span>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
  </label>
);

const SeverityPill = ({ label, color, textColor, accent, icon, count }) => (
  <div
    style={{
      padding: '14px 16px',
      background: color,
      color: textColor,
      borderRadius: '18px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      border: `1px solid ${accent}22`
    }}
  >
    <div>
      <div>{label}</div>
      <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.72, marginTop: '2px' }}>{count} visible reports</div>
    </div>
    <span style={severityIconStyle(accent)}>{icon}</span>
  </div>
);

const IssueIcon = ({ issueType, color }) => {
  const Icon = getIssueIcon(issueType);

  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
  );
};

const MiniStat = ({ label, value, tone = 'default' }) => (
  <div style={miniStatStyle(tone)}>
    <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{value}</div>
  </div>
);

const DetailMetaChip = ({ icon, label }) => (
  <div style={detailMetaChipStyle}>
    {icon}
    <span>{label}</span>
  </div>
);

const InfoPanel = ({ title, value, tone }) => (
  <div style={{ ...detailBoxStyle, border: tone ? `1px solid ${tone}33` : '1px solid #e2e8f0' }}>
    <div style={detailLabelStyle}>{title}</div>
    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{value}</div>
  </div>
);

const mapShellStyle = (isMobile) => ({
  height: isMobile ? 'calc(100vh - 104px)' : 'calc(100vh - 128px)',
  margin: isMobile ? '88px 12px 16px' : '96px 24px 24px',
  position: 'relative',
  background:
    'radial-gradient(circle at top left, rgba(255,255,255,0.9) 0%, rgba(237,242,247,0.86) 24%, rgba(214,228,240,0.85) 100%)',
  overflow: 'hidden',
  borderRadius: '32px',
  boxShadow: '0 24px 60px rgba(15, 23, 42, 0.12)'
});

const mapAmbientGlowStyle = {
  position: 'absolute',
  inset: 0,
  background:
    'radial-gradient(circle at 18% 22%, rgba(59,130,246,0.16) 0%, transparent 30%), radial-gradient(circle at 82% 20%, rgba(34,197,94,0.12) 0%, transparent 26%)',
  pointerEvents: 'none',
  zIndex: 0
};

const mapCanvasStyle = (isTablet, isMobile) => ({
  height: '100%',
  width: '100%',
  position: 'relative',
  zIndex: 1,
  background: 'linear-gradient(180deg, #edf5ff 0%, #dce9f7 100%)',
  paddingLeft: isMobile ? 0 : isTablet ? '300px' : '344px',
  paddingRight: isMobile ? 0 : isTablet ? '300px' : '434px'
});

const mapSidebarStyle = (isTablet, isMobile) => ({
  position: 'absolute',
  top: isMobile ? '16px' : '24px',
  left: isMobile ? '16px' : '24px',
  width: isMobile ? 'calc(100% - 32px)' : isTablet ? '276px' : '360px',
  maxHeight: isMobile ? '48%' : 'calc(100% - 48px)',
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: isMobile ? '18px' : '22px',
  borderRadius: isMobile ? '24px' : '28px',
  background: 'rgba(255, 255, 255, 0.76)',
  backdropFilter: 'blur(22px) saturate(160%)',
  WebkitBackdropFilter: 'blur(22px) saturate(160%)',
  border: '1px solid rgba(255, 255, 255, 0.65)',
  boxShadow: '0 28px 60px rgba(15, 23, 42, 0.16)',
  display: 'flex',
  flexDirection: 'column',
  gap: '22px',
  zIndex: 1001,
  boxSizing: 'border-box'
});

const sidebarHeroCardStyle = {
  padding: '20px',
  borderRadius: '24px',
  background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(239,246,255,0.88) 100%)',
  border: '1px solid rgba(191,219,254,0.75)',
  boxShadow: '0 16px 34px rgba(37, 99, 235, 0.08)',
  display: 'grid',
  gap: '18px'
};

const eyebrowStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 10px',
  borderRadius: '999px',
  background: '#eff6ff',
  color: '#1d4ed8',
  fontSize: '11px',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase'
};

const sidebarTitleStyle = {
  fontSize: '28px',
  lineHeight: 1.05,
  margin: '8px 0 10px',
  letterSpacing: '-0.03em'
};

const sidebarSubtitleStyle = {
  fontSize: '14px',
  lineHeight: 1.6,
  color: '#64748b',
  margin: 0
};

const sidebarBadgeStyle = {
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  background: '#ffffff',
  border: '1px solid rgba(191,219,254,0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
};

const sidebarStatGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '10px'
};

const miniStatStyle = (tone) => ({
  padding: '14px',
  borderRadius: '18px',
  background: tone === 'critical' ? '#fff1f2' : 'rgba(255,255,255,0.94)',
  border: tone === 'critical' ? '1px solid #fecdd3' : '1px solid rgba(226,232,240,0.92)'
});

const sidebarSectionStyle = {
  padding: '2px 0'
};

const sectionHeaderRowStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px'
};

const sectionPillStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  background: 'rgba(255,255,255,0.85)',
  border: '1px solid rgba(226,232,240,0.95)',
  color: '#64748b',
  fontSize: '11px',
  fontWeight: 700
};

const filterCheckboxStyle = (checked) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 14px',
  borderRadius: '16px',
  background: checked ? 'rgba(239,246,255,0.92)' : 'rgba(255,255,255,0.58)',
  border: checked ? '1px solid rgba(147,197,253,0.9)' : '1px solid rgba(226,232,240,0.95)',
  boxShadow: checked ? '0 10px 24px rgba(59,130,246,0.08)' : 'none'
});

const checkboxIndicatorStyle = (checked) => ({
  width: '20px',
  height: '20px',
  borderRadius: '6px',
  background: checked ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : '#ffffff',
  border: checked ? 'none' : '1px solid #cbd5e1',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 800,
  flexShrink: 0
});

const sidebarHeadingStyle = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: '#64748b',
  letterSpacing: '0.14em'
};

const severityIconStyle = (accent) => ({
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  background: `${accent}18`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: accent
});

const reportLayerCardStyle = {
  padding: '18px',
  display: 'grid',
  gap: '12px',
  background: 'rgba(255,255,255,0.68)',
  borderRadius: '24px',
  border: '1px solid rgba(226,232,240,0.92)',
  boxShadow: '0 16px 34px rgba(15, 23, 42, 0.06)',
  width: '100%',
  boxSizing: 'border-box'
};

const mapLiveBadgeStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '11px',
  fontWeight: 800,
  color: '#15803d',
  background: '#ecfdf5',
  borderRadius: '999px',
  padding: '6px 10px'
};

const liveDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#22c55e'
};

const reportListItemStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '18px',
  background: active ? 'linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)' : '#ffffff',
  border: active ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
  textAlign: 'left',
  boxShadow: active ? '0 12px 24px rgba(37, 99, 235, 0.08)' : 'none',
  width: '100%',
  boxSizing: 'border-box',
  minWidth: 0
});

const reportTitleStyle = {
  fontSize: '13px',
  fontWeight: 800,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const reportSubtitleStyle = {
  fontSize: '12px',
  color: 'var(--text-muted)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const reportScoreChipStyle = (color) => ({
  minWidth: '38px',
  height: '38px',
  borderRadius: '12px',
  background: `${color}18`,
  color,
  fontSize: '13px',
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0
});

const emptySidebarStateStyle = {
  padding: '18px 14px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.72)',
  border: '1px dashed #cbd5e1',
  color: '#64748b',
  fontSize: '13px',
  lineHeight: 1.6
};

const detailPanelStyle = (isTablet, isMobile) => ({
  position: 'absolute',
  top: isMobile ? 'auto' : isTablet ? '24px' : '40px',
  right: isMobile ? '16px' : isTablet ? '24px' : '40px',
  bottom: isMobile ? '16px' : '24px',
  left: isMobile ? '16px' : 'auto',
  width: isMobile ? 'auto' : isTablet ? '280px' : 'min(430px, calc(100% - 40px))',
  maxHeight: isMobile ? '40%' : 'calc(100% - 48px)',
  zIndex: 1000,
  padding: 0,
  overflow: 'auto',
  borderRadius: isMobile ? '24px' : '32px',
  border: '1px solid rgba(255,255,255,0.58)',
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(40px)',
  WebkitBackdropFilter: 'blur(40px)',
  boxShadow: '0 28px 60px rgba(23, 43, 77, 0.22)'
});

const referenceChipStyle = {
  fontSize: '11px',
  fontWeight: 800,
  color: '#991b1b',
  background: '#fee2e2',
  padding: '6px 11px',
  borderRadius: '999px',
  letterSpacing: '1px'
};

const closeButtonStyle = {
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(226,232,240,0.9)',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const detailMetaRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginBottom: '16px'
};

const detailMetaChipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '8px 12px',
  borderRadius: '999px',
  background: 'rgba(248,250,252,0.92)',
  border: '1px solid #e2e8f0',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 700
};

const detailBoxStyle = {
  background: 'rgba(248,250,252,0.95)',
  padding: '14px 16px',
  borderRadius: '16px'
};

const detailLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: 'var(--text-muted)',
  marginBottom: '4px',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const detailStatsGridStyle = (isMobile) => ({
  display: 'grid',
  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
  gap: '12px',
  marginBottom: '20px'
});

const aiPanelStyle = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '24px'
};

const emptyImageStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '24px',
  background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  border: '1px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  padding: '24px'
};

export default MapPage;
