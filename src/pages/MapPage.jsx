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
  const [center] = useState([40.7128, -74.0060]); // Default to NYC for demo

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'reports'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(data.filter(r => r.location)); // Only show reports with location
    });
    return unsubscribe;
  }, []);

  return (
    <div style={{ height: 'calc(100vh - 80px)', marginTop: '80px', position: 'relative' }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {reports.map((report) => (
          <React.Fragment key={report.id}>
            {/* Risk Radius Circle */}
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
            
            <Marker position={[report.location.lat, report.location.lng]}>
              <Popup>
                <div style={{ color: '#333' }}>
                  <h4 style={{ margin: '0 0 5px' }}>{report.type}</h4>
                  <p style={{ margin: '0 0 10px', fontSize: '0.8rem' }}>{report.description}</p>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: report.color, 
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700 
                  }}>
                    Risk Score: {report.score}
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Floating Legend */}
      <div className="glass-effect" style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '1rem',
        borderRadius: 'var(--radius-md)',
        width: '200px'
      }}>
        <h4 style={{ marginBottom: '1rem' }}>Risk Levels</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
            <span>Critical (76-100)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f97316' }}></span>
            <span>High Risk (51-75)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
            <span>Watch (26-50)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
            <span>Safe (0-25)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
