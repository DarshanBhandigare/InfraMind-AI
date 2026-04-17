import React, { useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { calculateRiskScore } from '../utils/riskEngine';
import { useNavigate } from 'react-router-dom';
import { Shield, MapPin, CheckCircle, Clock, Zap, AlertCircle, ChevronDown } from 'lucide-react';

const CitizenReport = () => {
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

      await addDoc(collection(db, 'reports'), {
        ...formData,
        ...riskData,
        status: 'reported',
        createdAt: serverTimestamp()
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

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', paddingTop: 'var(--nav-height)' }}>
      <div className="container" style={{ padding: '60px 0' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>Report an Issue</h1>
        <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '60px', maxWidth: '600px' }}>
          Help us maintain the city's pulse. Your reports directly inform maintenance priorities and infrastructure investments.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '60px', alignItems: 'start' }}>
          {/* Left Side: The Form */}
          <div className="card" style={{ padding: '40px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div>
                  <label style={labelStyle}>INFRASTRUCTURE CATEGORY</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-field" 
                      style={{ appearance: 'none', paddingRight: '40px' }}
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="">Select Issue Type</option>
                      <option>Pothole</option>
                      <option>Streetlight</option>
                      <option>Water Leak</option>
                      <option>Structural Damage</option>
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>SEVERITY LEVEL</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-field" 
                      style={{ appearance: 'none', paddingRight: '40px' }}
                      value={formData.severity}
                      onChange={(e) => setFormData({...formData, severity: e.target.value})}
                    >
                      <option value="1">Low (Cosmetic/Minor)</option>
                      <option value="2">Medium (Nuisance/Repair Needed)</option>
                      <option value="3">High (Safety Hazard)</option>
                      <option value="4">Critical (Immediate Danger)</option>
                    </select>
                    <ChevronDown size={18} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>PRECISE LOCATION</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
                  <input 
                    className="input-field" 
                    placeholder="Enter address or drag map pin" 
                    style={{ paddingLeft: '40px' }}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                {/* Mock Map View */}
                <div style={{ 
                  height: '240px', 
                  background: '#eee', 
                  marginTop: '16px', 
                  borderRadius: '12px', 
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1px solid var(--border)'
                }}>
                   <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=400" alt="Map" style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.3}} />
                   <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%, -50%)' }}>
                     <MapPin size={32} color="var(--primary)" fill="var(--primary-light)" />
                   </div>
                </div>
              </div>

              <div>
                <label style={labelStyle}>INCIDENT DETAILS</label>
                <textarea 
                  className="input-field" 
                  rows="4" 
                  placeholder="Describe the issue, its impact, and any recent changes..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              {/* Login Modal Overlay (Image 3) */}
              <div style={{ 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(8px)', 
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }}>
                <Shield size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Final Step Required</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '300px', margin: '0 auto 32px' }}>
                  To verify reports and ensure public accountability, an account is required to submit infrastructure issues.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <button type="submit" className="btn-primary" style={{ padding:'16px' }}>Sign in to Submit →</button>
                  <button type="button" className="btn-outline" style={{ padding:'16px' }}>Create New Account</button>
                </div>
                <div style={{ fontSize:'10px', textTransform:'uppercase', fontWeight:800, color:'var(--text-muted)', marginTop:'24px', letterSpacing:'1px' }}>
                   Estimated Verification: Instant
                </div>
              </div>
            </form>
          </div>

          {/* Right Side: Sidebar Info */}
          <div style={{ display: 'grid', gap: '32px' }}>
            <div style={{ background:'var(--primary)', borderRadius:'24px', padding:'40px', color:'white' }}>
              <h3 style={{ color:'white', marginBottom:'24px' }}>Why do I need to log in?</h3>
              <div style={benefitRowStyle}>
                <CheckCircle size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight:700 }}>Real-time Tracking</div>
                  <div style={{ fontSize:'14px', opacity:0.8 }}>Get notified the moment a crew is dispatched to your reported location.</div>
                </div>
              </div>
              <div style={benefitRowStyle}>
                <Clock size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight:700 }}>Contribution History</div>
                  <div style={{ fontSize:'14px', opacity:0.8 }}>View all your previous reports and their final resolutions in one dashboard.</div>
                </div>
              </div>
              <div style={benefitRowStyle}>
                <Shield size={20} color="#60a5fa" />
                <div>
                  <div style={{ fontWeight:700 }}>Data Integrity</div>
                  <div style={{ fontSize:'14px', opacity:0.8 }}>Secure identification prevents spam and helps prioritize high-impact issues.</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
               <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize:'10px', fontWeight:800, color:'var(--primary)', marginBottom:'4px', letterSpacing:'1px' }}>RESOLUTION RATE</div>
                  <div style={{ fontSize:'32px', fontWeight:800 }}>94.2%</div>
               </div>
               <div className="card" style={{ padding: '24px' }}>
                  <div style={{ fontSize:'10px', fontWeight:800, color:'var(--primary)', marginBottom:'4px', letterSpacing:'1px' }}>RESPONSE TIME</div>
                  <div style={{ fontSize:'32px', fontWeight:800 }}>&lt; 4hr</div>
               </div>
            </div>

            <div className="card" style={{ padding:'24px', display:'flex', alignItems:'center', gap:'16px'}}>
              <div style={{ width:'48px', height:'48px', borderRadius:'12px', overflow:'hidden' }}>
                <img src="https://images.unsplash.com/photo-1574631027503-455b5420364d?q=80&w=100" alt="Update" />
              </div>
              <div>
                <div style={{ fontSize:'14px', fontWeight:700 }}>Sector 7 Lighting Restored</div>
                <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>RESOLVED 12M AGO</div>
              </div>
            </div>

            <div style={{ background:'var(--primary-light)', borderRadius:'12px', padding:'16px', display:'flex', justifyContent:'space-between', alignItems:'center', color:'var(--primary)' }}>
               <div style={{ display:'flex', alignItems:'center', gap:'8px', fontWeight:700 }}>
                 <Zap size={18} /> System Health: 98%
               </div>
               <Shield size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { fontSize: '10px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', marginBottom: '8px', display: 'block' };
const benefitRowStyle = { display: 'flex', gap: '16px', marginBottom: '24px' };

export default CitizenReport;
