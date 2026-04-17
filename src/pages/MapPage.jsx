import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
  const [reports, setReports] = useState([]);
  const [center] = useState([40.7128, -74.0060]);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data.filter(r => r.location));
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 72px)', marginTop: '72px', display: 'flex', background: '#f8f9fb' }}>
      {/* Left Sidebar */}
      <aside style={{ width: '320px', padding: '32px', borderRight: '1px solid var(--border)', background: 'white', display: 'flex', flexDirection: 'column', gap: '40px', zIndex: 1001 }}>
        <div>
          <h4 style={sidebarHeadingStyle}>Issue Type</h4>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <FilterCheckbox label="Potholes" checked={true} />
            <FilterCheckbox label="Drainage" checked={true} />
            <FilterCheckbox label="Lighting" checked={true} />
          </div>
        </div>

        <div>
          <h4 style={sidebarHeadingStyle}>Severity</h4>
          <div style={{ display: 'grid', gap: '8px', marginTop: '16px' }}>
            <SeverityPill label="High / Critical" color="#fee2e2" textColor="#ef4444" icon="!" />
            <SeverityPill label="Medium Risk" color="#fef3c7" textColor="#b45309" icon="▲" />
            <SeverityPill label="Low Priority" color="#dcfce7" textColor="#10b981" icon="✓" />
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <div className="pill pill-blue" style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '13px' }}>
            <Activity size={14} /> System Health: 98.4%
          </div>
        </div>
      </aside>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer 
          center={center} 
          zoom={13} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />
          
          {reports.map((report) => (
            <React.Fragment key={report.id}>
              <Circle 
                center={[report.location.lat, report.location.lng]}
                radius={300}
                pathOptions={{ 
                  fillColor: report.color, 
                  color: report.color,
                  fillOpacity: 0.2,
                  weight: 1
                }}
              />
              <Marker 
                position={[report.location.lat, report.location.lng]}
                eventHandlers={{ click: () => setSelectedIssue(report) }}
              >
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>

        {/* Floating Detail Overlay (If Selected) */}
        {selectedIssue && (
          <div className="glass-card" style={{
            position: 'absolute',
            top: '40px',
            left: '40px',
            width: '400px',
            zIndex: 1000,
            padding: 0,
            overflow: 'hidden',
            border: 'none',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ position: 'relative', height: '200px' }}>
              <img src="https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800" alt="Incident" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button 
                onClick={() => setSelectedIssue(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'white', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '4px' }}>
                  REF: {selectedIssue.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{selectedIssue.type}</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>
                {selectedIssue.description || "Identified risk requiring immediate assessment and resolution strategy."}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div style={detailBoxStyle}>
                  <div style={detailLabelStyle}>STATUS</div>
                  <div style={{ fontWeight: 700, color: selectedIssue.color }}>Action Required</div>
                </div>
                <div style={detailBoxStyle}>
                  <div style={detailLabelStyle}>IMPACT SCORE</div>
                  <div style={{ fontWeight: 700 }}>{selectedIssue.score}/100</div>
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', padding: '14px' }}>
                Dispatch Crew
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SidebarHeadingStyle = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  letterSpacing: '1px'
};

const FilterCheckbox = ({ label, checked }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
    <input type="checkbox" checked={checked} readOnly style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
    {label}
  </label>
);

const SeverityPill = ({ label, color, textColor, icon }) => (
  <div style={{ 
    padding: '12px 16px', 
    background: color, 
    color: textColor, 
    borderRadius: '12px', 
    fontSize: '14px', 
    fontWeight: 700,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    {label}
    <span>{icon}</span>
  </div>
);

const detailBoxStyle = {
  background: '#f8f9fb',
  padding: '12px',
  borderRadius: '8px',
};

const detailLabelStyle = {
  fontSize: '10px',
  fontWeight: 800,
  color: 'var(--text-muted)',
  marginBottom: '4px'
};

const sidebarHeadingStyle = {
  fontSize: '12px',
  fontWeight: 800,
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  letterSpacing: '1px'
};

import { Activity } from 'lucide-react';

export default MapPage;
