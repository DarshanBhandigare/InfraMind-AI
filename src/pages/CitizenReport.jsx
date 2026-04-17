import React, { useState } from 'react';
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

const CitizenReport = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    type: '',
    severity: '1',
    description: '',
    location: null,
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return; // Should be blocked by overlay but safety first
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

      // 1. Submit the report doc with embedded AI insights
      await addDoc(collection(db, 'reports'), {
        ...formData,
        ...riskData,
        aiData: aiMetadata, // Persist AI data to Firebase
        userId: user.uid,
        status: 'reported',
        createdAt: serverTimestamp()
      });

      // 2. Update global statistics atomically
      await updateGlobalStats({
        totalReports: 1,
        highRiskCount: riskData.score > 70 ? 1 : 0
      });

      setSubmitted(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error("Error submitting report:", error);
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

  // --- RENDERING LOGIC ---

  const renderPublicView = () => (
    <div className="dot-grid" style={{ minHeight: '100vh', paddingTop: '40px' }}>
      <div className="container">
        <h1 style={{ fontSize: '56px', marginBottom: '16px', letterSpacing: '-2px' }}>Report an Issue</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '64px', maxWidth: '600px' }}>
          Help us maintain the city's pulse. Your reports directly inform maintenance priorities and infrastructure investments.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '64px', alignItems: 'start' }}>
          {/* Form Container with Overlay */}
          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: '48px', opacity: user ? 1 : 0.4, pointerEvents: user ? 'all' : 'none' }}>
               <form style={{ display:'grid', gap:'32px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                      <label style={labelStyle}>INFRASTRUCTURE CATEGORY</label>
                      <div style={{ position: 'relative' }}>
                        <select className="input-field" style={{ appearance: 'none' }}>
                          <option>Select Issue Type</option>
                          <option>Pothole</option>
                          <option>Streetlight</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>SEVERITY LEVEL</label>
                      <div style={{ position: 'relative' }}>
                        <select className="input-field" style={{ appearance: 'none' }}>
                          <option>Low (Cosmetic/Minor)</option>
                        </select>
                        <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>PRECISE LOCATION</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                      <input className="input-field" style={{ paddingLeft: '48px' }} placeholder="Enter address or drag map pin" />
                    </div>
                    <div style={{ height: '240px', background: '#eee', marginTop: '20px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
                       <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=600" alt="Map" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.3}} />
                       <MapPin size={32} color="var(--primary)" style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)' }} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>INCIDENT DETAILS</label>
                    <textarea className="input-field" rows="4" placeholder="Describe the issue, its impact, and any recent changes..."></textarea>
                  </div>
               </form>
            </div>

            {/* Login Overlay */}
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
                  <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>Final Step Required</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>
                    To verify reports and ensure public accountability, an account is required to submit infrastructure issues.
                  </p>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    <Link to="/login" className="btn-primary" style={{ padding: '16px', textDecoration: 'none' }}>Sign in to Submit &rarr;</Link>
                    <Link to="/signup" className="btn-outline" style={{ padding: '16px', textDecoration: 'none' }}>Create New Account</Link>
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', marginTop: '24px', letterSpacing: '1px' }}>
                    ESTIMATED VERIFICATION: INSTANT
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'grid', gap: '32px' }}>
            <div style={{ background: 'var(--primary)', padding: '40px', borderRadius: '24px', color: 'white' }}>
              <h3 style={{ color: 'white', fontSize: '20px', marginBottom: '24px' }}>Why do I need to log in?</h3>
              <BenefitItem icon={<Zap size={20} />} title="Real-time Tracking" text="Get notified the moment a crew is dispatched to your reported location." />
              <BenefitItem icon={<Clock size={20} />} title="Contribution History" text="View all your previous reports and their final resolutions in one dashboard." />
              <BenefitItem icon={<Shield size={20} />} title="Data Integrity" text="Secure identification prevents spam and helps prioritize high-impact issues." />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className="card">
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>RESOLUTION RATE</div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>94.2%</div>
              </div>
              <div className="card">
                <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px' }}>RESPONSE TIME</div>
                <div style={{ fontSize: '32px', fontWeight: 800 }}>&lt; 4hr</div>
              </div>
            </div>

            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#eee', overflow: 'hidden' }}>
                <img src="https://images.unsplash.com/photo-1574631027503-455b5420364d?q=80&w=100" alt="Repair" style={{ width:'100%', height:'100%', objectFit:'cover'}} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Sector 7 Lighting Restored</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RESOLVED 12M AGO</div>
              </div>
            </div>

            <div style={{ background: '#EBF2FF', padding: '16px 24px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700 }}>
                 <Zap size={18} /> System Health: 98%
               </div>
               <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMemberView = () => (
    <div style={{ padding: '40px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px' }}>Report an Issue</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Help us maintain District 4. Submit details regarding infrastructure damage or maintenance needs, and our team will prioritize the dispatch.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
        {/* Left Column */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Issue Details Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
              <FileText size={24} />
              <h3 style={{ fontSize: '18px' }}>Issue Details</h3>
            </div>
            <div style={{ display: 'grid', gap: '24px' }}>
              <div>
                <label style={labelStyle}>ISSUE TYPE</label>
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-field" 
                    style={{ background: '#F8F9FB', border: '1px solid var(--border)', appearance: 'none' }}
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="">Select an issue type</option>
                    <option>Pothole</option>
                    <option>Water Leak</option>
                  </select>
                  <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>DESCRIPTION</label>
                <textarea 
                  className="input-field" 
                  rows="6" 
                  placeholder="Provide as much detail as possible about the issue..."
                  style={{ background: '#F8F9FB', border: '1px solid var(--border)' }}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
              <Upload size={24} />
              <h3 style={{ fontSize: '18px' }}>Upload Photo</h3>
            </div>
            <div style={{ 
              border: '2px dashed var(--border)', 
              borderRadius: '16px', 
              padding: '48px', 
              textAlign: 'center',
              background: '#F8F9FB'
            }}>
              <div style={{ width: '48px', height: '48px', background: '#D1E2FF', color: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Upload size={24} />
              </div>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Drag and drop images here</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>PNG, JPG up to 10MB</div>
              <button className="btn-outline" style={{ padding: '10px 24px', background: 'white' }}>Browse Files</button>
            </div>
          </div>
        </div>

        {/* Right Column: Location */}
        <div className="card" style={{ padding: '32px', height: 'fit-content' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--primary)' }}>
            <MapPin size={24} />
            <h3 style={{ fontSize: '18px' }}>Location</h3>
          </div>
          <div style={{ display: 'grid', gap: '24px' }}>
            <div>
              <label style={labelStyle}>ADDRESS OR LOCATION</label>
              <div style={{ position: 'relative' }}>
                <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  className="input-field" 
                  style={{ paddingLeft: '48px', background: '#F8F9FB', border: '1px solid var(--border)' }} 
                  placeholder="Search address..." 
                />
              </div>
            </div>
            <div style={{ height: '480px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
               <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=600" alt="Map" style={{ width:'100%', height:'100%', objectFit:'cover'}} />
               <MapPin size={64} color="var(--primary)" style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)' }} />
               <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)' }}>
                 <div className="glass" style={{ padding: '16px', borderRadius: '12px', writingMode: 'vertical-lr', fontSize: '11px', fontWeight: 800 }}>
                    CLICK AND DRAG PIN
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="card" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8F9FB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
          <div style={{ width: '24px', height: '24px', background: 'var(--safe)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={14} />
          </div>
          <span style={{ fontSize: '14px' }}>Your report will be reviewed by the District 4 technical team within 24 hours.</span>
        </div>
        <button className="btn-primary" onClick={handleSubmit} style={{ padding: '16px 40px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {loading ? 'Submitting...' : 'Submit Report'} <ArrowRight size={20} />
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
