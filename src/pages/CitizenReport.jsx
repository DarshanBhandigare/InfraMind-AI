import React, { useState, useEffect, useMemo, useRef } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateRiskScore } from '../utils/riskEngine';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  MapPin, 
  CheckCircle, 
  Clock, 
  Zap, 
  AlertCircle, 
  ChevronDown,
  Upload,
  Search,
  ArrowRight,
  Info
} from 'lucide-react';

import { updateGlobalStats } from '../services/statsService';
import { generateAIData } from '../services/dataSyncService';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MUMBAI_CENTER = [19.076, 72.8777];

const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ lat, lng });
    },
  });
  return null;
};

const CitizenReport = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    severity: '1',
    description: '',
    location: { lat: 19.076, lng: 72.8777 },
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.type) return alert("Please select an issue type");
    setLoading(true);

    try {
      const aiFactors = {
        severity: parseInt(formData.severity),
        frequency: Math.floor(Math.random() * 5) + 1,
        isSensitive: Math.random() > 0.7,
        yearsSinceLastRepair: Math.floor(Math.random() * 4) + 1,
        weatherFactor: 1.1
      };

      const riskData = calculateRiskScore(aiFactors);
      const tempId = `rep-${Date.now()}`;
      const aiMetadata = generateAIData(tempId, formData.type);

      await addDoc(collection(db, 'reports'), {
        ...formData,
        ...riskData,
        aiData: aiMetadata,
        userId: user.uid,
        status: 'reported',
        createdAt: serverTimestamp(),
        fileName: selectedFileName
      });

      // Try to update stats, but don't block the UI if it fails
      try {
        await updateGlobalStats({
          totalReports: 1,
          highRiskCount: riskData.score > 70 ? 1 : 0
        });
      } catch (statsErr) {
        console.warn("Global stats update failed, but report was saved.", statsErr);
      }

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Submission failed: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircle size={80} color="var(--safe)" style={{ marginBottom: '24px' }} />
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Report Received</h1>
          <p style={{ color: 'var(--text-muted)' }}>Our AI Engine is prioritizing your submission...</p>
        </div>
      </div>
    );
  }

  const renderPublicView = () => (
    <div className="dot-grid" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="container" style={{ paddingBottom: '60px' }}>
        <h1 style={{ fontSize: '56px', marginBottom: '16px', letterSpacing: '-2px' }}>Report an Issue</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '64px', maxWidth: '600px' }}>
          Help us maintain the city's pulse. Your reports directly inform maintenance priorities and infrastructure investments.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '64px', alignItems: 'start' }}>
          {/* Form Container with Overlay */}
          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: '48px', opacity: user ? 1 : 0.4, pointerEvents: user ? 'all' : 'none' }}>
              <div style={{ display: 'grid', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={labelStyle}>CATEGORY</label>
                    <select className="input-field" disabled>
                      <option>Select Issue Type</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>SEVERITY</label>
                    <select className="input-field" disabled>
                      <option>Low (Cosmetic/Minor)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>PRECISE LOCATION</label>
                  <input className="input-field" disabled placeholder="Sign in to define location" />
                </div>
              </div>
            </div>

            {!user && (
              <div className="glass" style={{ 
                position: 'absolute', 
                inset: '-10px', 
                borderRadius: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                zIndex: 10
              }}>
                <div style={{ maxWidth: '360px', textAlign: 'center', padding: '40px' }}>
                  <div style={{ width: '64px', height: '64px', background: 'var(--primary)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Shield size={32} />
                  </div>
                  <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Authentication Required</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
                    To ensure accountability and track progress, an account is required to submit infrastructure reports.
                  </p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <Link to="/login" className="btn-primary" style={{ padding: '16px', textDecoration: 'none' }}>Sign in to Submit &rarr;</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div style={{ display: 'grid', gap: '22px' }}>
            <div className="card">
               <h4 style={{ ...labelStyle, color: 'var(--primary)' }}>Real-time Accountability</h4>
               <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Every report is time-stamped and assigned a priority score instantly by our predictive maintenance engine.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMemberView = () => (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Asset Report Entry</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Logged in as {user.email}. Precisely define the infrastructure issue for rapid response.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        <div style={{ display: 'grid', gap: '32px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
              <Shield size={24} />
              <h3 style={{ fontSize: '18px' }}>Technical Parameters</h3>
            </div>
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={labelStyle}>INFRASTRUCTURE CATEGORY</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-field" 
                    style={{ background: '#F8F9FB', border: '1px solid var(--border)', appearance: 'none' }}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Select asset class</option>
                    <option>Pothole</option>
                    <option>Drainage</option>
                    <option>Streetlight</option>
                    <option>Water Leakage</option>
                    <option>Traffic System</option>
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>SEVERITY ESTIMATE</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-field" 
                    style={{ background: '#F8F9FB', border: '1px solid var(--border)', appearance: 'none' }}
                    value={formData.severity}
                    onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  >
                    <option value="1">Low - Minor Utility Impact</option>
                    <option value="2">Medium - Functional Impairment</option>
                    <option value="3">High - Safety Hazard</option>
                    <option value="4">Critical - Immediate Structural Threat</option>
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>TECHNICAL DESCRIPTION</label>
                <textarea 
                  className="input-field" 
                  rows="5" 
                  placeholder="Describe the visible damage, approximate dimensions, and impact on city services..."
                  style={{ background: '#F8F9FB', border: '1px solid var(--border)' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
              <Upload size={24} />
              <h3 style={{ fontSize: '18px' }}>Evidence Upload</h3>
            </div>
            <div style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: '16px', 
              padding: '40px', 
              textAlign: 'center',
              background: '#F8F9FB'
            }}>
              <div style={{ width: '48px', height: '48px', background: '#D1E2FF', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={24} />
              </div>
              {selectedFileName ? (
                <div style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>{selectedFileName}</div>
              ) : (
                <div style={{ fontWeight: 700, marginBottom: '4px' }}>Evidence required (JPG/PNG)</div>
              )}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Maximum file size: 10MB</div>
              <input 
                ref={fileInputRef} 
                type="file" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button 
                className="btn-outline" 
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '10px 24px', background: 'white' }}
              >
                Browse Files
              </button>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '32px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
            <MapPin size={24} />
            <h3 style={{ fontSize: '18px' }}>Geographic Context</h3>
          </div>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={labelStyle}>PRIMARY ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="input-field" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  style={{ paddingLeft: '48px', background: '#F8F9FB', border: '1px solid var(--border)' }} 
                  placeholder="Enter specific ward or street address..." 
                />
              </div>
            </div>
            <div style={{ height: '480px', borderRadius: '16px', overflow: 'hidden', position: 'relative', border: '1px solid var(--border)' }}>
               <MapContainer center={MUMBAI_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  <LocationPicker onLocationSelect={(latlng) => setFormData({...formData, location: latlng})} />
                  <Marker position={[formData.location.lat, formData.location.lng]} icon={defaultIcon} />
               </MapContainer>
               <div style={{ position: 'absolute', right: '16px', top: '16px', zIndex: 1000 }}>
                  <div className="glass" style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>
                     CLICK MAP TO SET PIN
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--safe)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={14} />
          </div>
          <span style={{ fontSize: '14px' }}>Data will be processed into the city's maintenance grid within 15 minutes.</span>
        </div>
        <button 
          className="btn-primary" 
          onClick={handleSubmit} 
          disabled={loading}
          style={{ padding: '16px 48px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          {loading ? 'Processing...' : <><ArrowRight size={20} /> Finalize Report</>}
        </button>
      </div>
    </div>
  );

  return user ? renderMemberView() : renderPublicView();
};

const labelStyle = { fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px', display: 'block' };

const BenefitItem = ({ icon, title, text }) => (
  <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
    <div style={{ color: '#60a5fa' }}>{icon}</div>
    <div>
      <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
      <div style={{ fontSize: '13px', opacity: 0.8, lineHeight: 1.4 }}>{text}</div>
    </div>
  </div>
);

const FileText = ({ size }) => <Shield size={size} />; // Placeholder as Shield is used in both designs

export default CitizenReport;
