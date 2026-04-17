import React, { useEffect, useMemo, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';
import { Activity, AlertTriangle, CheckCircle2, Lightbulb, Share2, Waves, X } from 'lucide-react';
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
  minLat: 18.89,
  maxLat: 19.31,
  minLng: 72.77,
  maxLng: 72.99
};

const MUMBAI_DEMO_REPORTS = [
  {
    id: 'bmc-pothole-9021',
    type: 'Critical Pothole Cluster',
    category: 'Critical',
    address: 'Dr. Annie Besant Road, Worli',
    location: { lat: 19.0178, lng: 72.8162 },
    description: 'Multiple deep potholes reported along the BMC corridor near Worli Naka. Fast-moving traffic and bus movement make immediate patching necessary.',
    color: '#dc2626',
    score: 84,
    status: 'Action Required',
    impactLabel: '8.4/10',
    assets: ['Primary Road Grid W-4', 'Adjacent Drainage Zone A2'],
    image: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'bmc-drain-4110',
    type: 'Drainage Overflow Risk',
    category: 'High Risk',
    address: 'LBS Marg, Kurla West',
    location: { lat: 19.0726, lng: 72.8777 },
    description: 'Recurring drainage choke point flagged before monsoon runoff. Water logging risk is elevated around the bus corridor and pedestrian access lane.',
    color: '#d97706',
    score: 71,
    status: 'Crew Review',
    impactLabel: '7.1/10',
    assets: ['Stormwater Line K-2', 'Pedestrian Crossing P7'],
    image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=900&auto=format&fit=crop'
  },
  {
    id: 'bmc-light-2380',
    type: 'Streetlight Failure Pocket',
    category: 'Medium Risk',
    address: 'SV Road, Andheri West',
    location: { lat: 19.1364, lng: 72.8276 },
    description: 'Three consecutive streetlights remain offline near a busy junction, reducing nighttime visibility and increasing safety complaints from residents.',
    color: '#16a34a',
    score: 52,
    status: 'Scheduled',
    impactLabel: '5.2/10',
    assets: ['Lighting Circuit A-9', 'Traffic Junction Node 11'],
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=900&auto=format&fit=crop'
  }
];

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
  image: report.image || 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=900&auto=format&fit=crop'
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
  const [issueFilters, setIssueFilters] = useState({
    Potholes: true,
    Drainage: true,
    Lighting: true
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map((doc) => processReport({ id: doc.id, ...doc.data() }));
      setReports(data.filter((report) => report.location));
    });

    return unsubscribe;
  }, []);

  const baseReports = useMemo(() => {
    const normalizedReports = reports.map(normalizeReport);
    const mumbaiReports = normalizedReports.filter((report) => isInMumbaiRegion(report.location));
    return mumbaiReports.length > 0 ? mumbaiReports : MUMBAI_DEMO_REPORTS.map(processReport);
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
      return activeKeys.some((key) => normalizedType.includes(key.slice(0, -1)) || normalizedType.includes(key));
    });
  }, [baseReports, issueFilters]);

  const selectedIssue = useMemo(
    () => (selectedIssueId ? displayReports.find((report) => report.id === selectedIssueId) || null : null),
    [displayReports, selectedIssueId]
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

  return (
    <div style={{ height: 'calc(100vh - 72px)', marginTop: '72px', display: 'flex', background: '#f6f0e8' }}>
      <aside style={{ width: '320px', padding: '32px', borderRight: '1px solid var(--border)', background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '32px', zIndex: 1001 }}>
        <div>
          <h4 style={sidebarHeadingStyle}>Issue Type</h4>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <FilterCheckbox
              label="Potholes"
              checked={issueFilters.Potholes}
              onChange={() => toggleIssueFilter('Potholes', setIssueFilters)}
            />
            <FilterCheckbox
              label="Drainage"
              checked={issueFilters.Drainage}
              onChange={() => toggleIssueFilter('Drainage', setIssueFilters)}
            />
            <FilterCheckbox
              label="Lighting"
              checked={issueFilters.Lighting}
              onChange={() => toggleIssueFilter('Lighting', setIssueFilters)}
            />
          </div>
        </div>

        <div>
          <h4 style={sidebarHeadingStyle}>Severity</h4>
          <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
            <SeverityPill label="High / Critical" color="#fee2e2" textColor="#b91c1c" icon="!" />
            <SeverityPill label="Medium Risk" color="#fef3c7" textColor="#92400e" icon="^" />
            <SeverityPill label="Low Priority" color="#dcfce7" textColor="#15803d" icon="+" />
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'grid', gap: '12px' }}>
          <div style={{ ...sidebarHeadingStyle, color: 'var(--primary)' }}>BMC Mumbai Demo Layer</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)' }}>
            The map now starts in Mumbai. Until ward-level live reports arrive here, example incidents are shown around the BMC service area.
          </div>
          {!displayReports.length && (
            <div style={{ fontSize: '12px', color: '#b45309', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '10px 12px' }}>
              No issues match the selected filters right now.
            </div>
          )}
          <div style={{ display: 'grid', gap: '10px' }}>
            {displayReports.slice(0, 3).map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedIssueId(report.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '14px',
                  background: selectedIssue?.id === report.id ? '#eef4ff' : '#f8f9fb',
                  border: selectedIssue?.id === report.id ? '1px solid #bfd4ff' : '1px solid transparent',
                  textAlign: 'left'
                }}
              >
                <IssueIcon issueType={report.type} color={report.color} />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700 }}>{report.type}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{report.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="pill pill-blue" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '13px' }}>
            <Activity size={14} /> System Health: 98.4%
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={MUMBAI_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false}>
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
                  fillOpacity: report.isDelayed ? 0.4 : 0.2,
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

        {selectedIssue && (
          <div
            className="glass-card"
            style={{
              position: 'absolute',
              top: '40px',
              left: '40px',
              width: '430px',
              zIndex: 1000,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.45)',
              background: 'rgba(255,255,255,0.68)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 24px 44px rgba(23, 43, 77, 0.18)'
            }}
          >
            <div style={{ padding: '24px 24px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#991b1b', background: '#fee2e2', padding: '4px 10px', borderRadius: '6px', letterSpacing: '1px' }}>
                  REF: {selectedIssue.id.substring(0, 8).toUpperCase()}
                </span>
                <button
                  onClick={() => setSelectedIssueId(null)}
                  style={{ background: 'transparent', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px', lineHeight: 1.15 }}>{selectedIssue.type}</h2>
            </div>

            <div style={{ position: 'relative', height: '220px', padding: '0 24px' }}>
              <img src={selectedIssue.image} alt={selectedIssue.type} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }} />
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ ...detailLabelStyle, marginBottom: '10px' }}>Description</div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.6 }}>
                {selectedIssue.description || 'Identified risk requiring immediate assessment and resolution strategy.'}
              </p>

              {selectedIssue.isDelayed && (
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '16px', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ ...detailLabelStyle, color: '#0369a1', margin: 0 }}>AI ESTIMATED COST</div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1' }}>₹{selectedIssue.aiData.estimatedCost.toLocaleString()}</div>
                  </div>
                  <div style={detailLabelStyle}>AI WORK PLAN</div>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '18px', fontSize: '13px', color: '#0c4a6e', lineHeight: 1.5 }}>
                    {selectedIssue.aiData.requiredWork.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={detailBoxStyle}>
                  <div style={detailLabelStyle}>Status</div>
                  <div style={{ fontWeight: 700, color: selectedIssue.color }}>{selectedIssue.status}</div>
                </div>
                <div style={detailBoxStyle}>
                  <div style={detailLabelStyle}>Impact Score</div>
                  <div style={{ fontWeight: 700 }}>{selectedIssue.impactLabel}</div>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={detailLabelStyle}>Affected Assets</div>
                <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                  {selectedIssue.assets.map((asset) => (
                    <div key={asset} style={assetRowStyle}>
                      <CheckCircle2 size={18} color="var(--primary)" />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{asset}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button style={{ ...detailBoxStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', gap: '8px', cursor: 'pointer', border: 'none' }} aria-label="Share alert">
                  <Share2 size={18} /> Share
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
    <input type="checkbox" checked={checked} onChange={onChange} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
    {label}
  </label>
);

const SeverityPill = ({ label, color, textColor, icon }) => (
  <div
    style={{
      padding: '12px 16px',
      background: color,
      color: textColor,
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 700,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}
  >
    {label}
    <span>{icon}</span>
  </div>
);

const IssueIcon = ({ issueType, color }) => {
  const Icon = getIssueIcon(issueType);

  return (
    <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={18} color={color} />
    </div>
  );
};

const detailBoxStyle = {
  background: '#f8f9fb',
  padding: '12px',
  borderRadius: '14px'
};

const detailLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: 'var(--text-muted)',
  marginBottom: '4px',
  letterSpacing: '1px',
  textTransform: 'uppercase'
};

const sidebarHeadingStyle = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  letterSpacing: '1px'
};

const assetRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'white'
};

export default MapPage;
