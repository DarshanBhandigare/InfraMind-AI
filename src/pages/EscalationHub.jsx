import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Wrench, 
  Shield, 
  Users, 
  CheckCircle2, 
  ChevronRight, 
  Share2, 
  FileText,
  Award,
  Zap,
  Hammer
} from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';

import { doc, updateDoc } from 'firebase/firestore';

const EscalationHub = () => {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);

  // Mock NGOs for recognition
  const topNGOs = [
    { name: 'Mumbai Foundation', tasks: 12, rating: 4.8 },
    { name: 'City Care NGO', tasks: 8, rating: 4.9 },
    { name: 'Green Path Services', tasks: 5, rating: 4.7 }
  ];

  useEffect(() => {
    // Standard query for reports
    const q = query(collection(db, 'reports')); // Removed orderBy temporarily to avoid index issues
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const data = snapshot.docs.map(doc => processReport({ id: doc.id, ...doc.data() }));
        setEscalations(data);
        setLoading(false);
      } catch (err) {
        console.error("Error processing reports:", err);
        setLoading(false); // Stop loading even on error
      }
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      setLoading(false); // Stop loading if query fails (e.g. missing index)
    });

    return unsubscribe;
  }, []);

  const handleAcceptTask = async (id, orgName) => {
    try {
      const reportRef = doc(db, 'reports', id);
      await updateDoc(reportRef, {
        acceptedBy: orgName,
        status: 'In Progress',
        progress: 15, // Starting progress
        acceptedAt: serverTimestamp()
      });
      alert(`${orgName} has successfully taken responsibility for this task!`);
    } catch (err) {
      console.error("Error accepting task:", err);
      alert("Failed to accept task. Please try again.");
    }
  };

  const filteredEscalations = useMemo(() => {
    let list = escalations.filter(e => e.isDelayed || e.status === 'Escalated');
    if (selectedCategory !== 'All') {
      list = list.filter(e => e.category === selectedCategory);
    }
    return list;
  }, [escalations, selectedCategory]);

  return (
    <div style={pageContainerStyle}>
      {/* Header Section */}
      <section style={headerSectionStyle}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px' }}
        >
          <div style={tagStyle}>
            <Clock size={14} style={{ marginRight: '6px' }} />
            Automatic Escalation Protocol
          </div>
          <h1 style={titleStyle}>Escalation <span style={{ color: 'var(--primary)' }}>Hub</span></h1>
          <p style={subtitleStyle}>
            Complaints unresolved for over 10 days are automatically listed here. 
            NGOs and private contractors can take ownership to ensure no issue is left behind.
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} /> View Urgent Tasks
            </button>
            <button 
              onClick={() => setShowReportModal(true)}
              style={secondaryButtonStyle}
            >
              <FileText size={18} /> Generate Hub Report
            </button>
          </div>
        </motion.div>

        {/* Stats Summary */}
        <div style={statsContainerStyle}>
          <StatCard label="Delayed Issues" value={filteredEscalations.length} color="#ef4444" />
          <StatCard label="Tasks Accepted" value={escalations.filter(e => e.acceptedBy).length} color="#10b981" />
          <StatCard label="Estimated City Cost" value="₹1.2Cr" color="#3b82f6" />
        </div>
      </section>

      {/* Main Content */}
      <div style={contentGridStyle}>
        {/* Left Side: Escalation Feed */}
        <div style={feedContainerStyle}>
          <div style={filterRowStyle}>
            <h2 style={sectionTitleStyle}>Delayed Complaints Feed</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Critical', 'Pothole', 'Drainage'].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...filterButtonStyle,
                    background: selectedCategory === cat ? 'var(--primary)' : 'white',
                    color: selectedCategory === cat ? 'white' : 'var(--text-muted)'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center' }}>Loading escalation data...</div>
          ) : filteredEscalations.length === 0 ? (
            <div style={emptyStateStyle}>
              <CheckCircle2 size={48} color="#10b981" />
              <h3>All clear!</h3>
              <p>No complaints have been delayed past the 10-day threshold.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              <AnimatePresence>
                {filteredEscalations.map((item, index) => (
                  <EscalationCard 
                    key={item.id} 
                    item={item} 
                    onAccept={(org) => handleAcceptTask(item.id, org)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Right Side: NGO Leaderboard & Recognition */}
        <div style={sideContainerStyle}>
          <div style={recognitionCardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Award color="var(--primary)" size={24} />
              <h3 style={{ margin: 0 }}>Top Organizations</h3>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Recognizing partners taking action for a better Mumbai.
            </p>
            <div style={{ display: 'grid', gap: '12px' }}>
              {topNGOs.map((ngo, idx) => (
                <div key={idx} style={ngoRowStyle}>
                  <div style={{ fontWeight: 600 }}>{ngo.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)' }}>{ngo.tasks} Tasks Completed</div>
                </div>
              ))}
            </div>
          </div>

          <div style={transparencyCardStyle}>
            <h3>Transparency Report</h3>
            <p style={{ fontSize: '14px', lineHeight: 1.5, color: '#475569' }}>
              Daily system audit of delayed civic services. Live data synchronization with BMC Command Center.
            </p>
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px' }}>Last System Crawl</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>2 mins ago</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px' }}>Accuracy Rate</span>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>99.8%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EscalationCard = ({ item, onAccept }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={cardStyle}
    >
      <div style={cardHeaderStyle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ ...badgeStyle, background: item.category === 'Critical' ? '#fee2e2' : '#fef3c7', color: item.category === 'Critical' ? '#991b1b' : '#92400e' }}>
              {item.category || 'Maintenance'}
            </span>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
              DELAYED BY {item.daysDelayed} DAYS
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '20px' }}>{item.type}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>{item.address}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AI Escalation ID</div>
          <div style={{ fontWeight: 700 }}>#ESC-{item.id.slice(-4)}</div>
        </div>
      </div>

      <div style={infoRowStyle}>
        <div style={infoItemStyle}>
          <DollarSign size={16} />
          <div>
            <div style={infoLabelStyle}>Estimated Cost</div>
            <div style={infoValueStyle}>₹{item.aiData.estimatedCost.toLocaleString()}</div>
          </div>
        </div>
        <div style={infoItemStyle}>
          <Wrench size={16} />
          <div>
            <div style={infoLabelStyle}>Required Work</div>
            <div style={infoValueStyle}>{item.aiData.timeToRepair}</div>
          </div>
        </div>
        <div style={infoItemStyle}>
          <Shield size={16} />
          <div>
            <div style={infoLabelStyle}>Priority</div>
            <div style={infoValueStyle}>{item.aiData.riskLevel}</div>
          </div>
        </div>
      </div>

      {item.acceptedBy ? (
        <div style={acceptedByStyle}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>Accepted by <strong>{item.acceptedBy}</strong></span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ fontSize: '12px' }}>{item.progress}% Progress</div>
             <div style={progressBarContainerStyle}>
                <div style={{ ...progressBarFillStyle, width: `${item.progress}%` }} />
             </div>
          </div>
        </div>
      ) : (
        <div style={actionRowStyle}>
          <button 
            onClick={() => onAccept('NGO Representative')}
            style={acceptButtonStyle}
          >
            <Hammer size={16} /> Take Responsibility
          </button>
          <button 
            style={detailsToggleStyle}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide AI Analysis' : 'Show AI Analysis'}
          </button>
          <button style={iconButtonStyle}><Share2 size={18} /></button>
        </div>
      )}

      {showDetails && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          style={aiDetailsPanelStyle}
        >
          <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>AI-Generated Work Plan:</div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.6 }}>
            {item.aiData.requiredWork.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={overviewStatCardStyle}>
    <div style={{ ...statDotStyle, background: color }} />
    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
  </div>
);

// Styles
const pageContainerStyle = {
  minHeight: '100vh',
  padding: '120px 5% 60px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
};

const headerSectionStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '60px',
  flexWrap: 'wrap',
  gap: '30px'
};

const titleStyle = {
  fontSize: '56px',
  fontWeight: 800,
  letterSpacing: '-2px',
  margin: '12px 0',
  lineHeight: 1
};

const subtitleStyle = {
  fontSize: '18px',
  color: 'var(--text-muted)',
  maxWidth: '600px',
  lineHeight: 1.6
};

const tagStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '6px 12px',
  background: 'white',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: 700,
  color: 'var(--primary)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

const statsContainerStyle = {
  display: 'flex',
  gap: '16px'
};

const overviewStatCardStyle = {
  background: 'white',
  padding: '20px 24px',
  borderRadius: '20px',
  minWidth: '180px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.03)',
  border: '1px solid #f1f5f9'
};

const statDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  marginBottom: '10px'
};

const contentGridStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr 340px',
  gap: '40px',
  alignItems: 'start'
};

const feedContainerStyle = {
  display: 'grid',
  gap: '24px'
};

const filterRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '10px'
};

const filterButtonStyle = {
  padding: '8px 16px',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 600,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const sectionTitleStyle = {
  fontSize: '24px',
  margin: 0
};

const cardStyle = {
  background: 'white',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
  border: '1px solid #f1f5f9',
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '20px'
};

const badgeStyle = {
  padding: '4px 8px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase'
};

const infoRowStyle = {
  display: 'flex',
  gap: '30px',
  padding: '20px 0',
  borderTop: '1px solid #f1f5f9',
  borderBottom: '1px solid #f1f5f9',
  marginBottom: '20px'
};

const infoItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: 'var(--primary)'
};

const infoLabelStyle = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 700
};

const infoValueStyle = {
  fontSize: '15px',
  fontWeight: 800,
  color: '#0f172a'
};

const actionRowStyle = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center'
};

const acceptButtonStyle = {
  padding: '12px 20px',
  borderRadius: '14px',
  background: '#0ea5e9',
  color: 'white',
  fontWeight: 700,
  border: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer'
};

const detailsToggleStyle = {
  background: '#f1f5f9',
  border: 'none',
  padding: '12px 18px',
  borderRadius: '14px',
  fontSize: '14px',
  fontWeight: 600,
  color: '#475569',
  cursor: 'pointer'
};

const iconButtonStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  width: '44px',
  height: '44px',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const aiDetailsPanelStyle = {
  marginTop: '20px',
  padding: '16px',
  background: '#f8fafc',
  borderRadius: '16px',
  borderLeft: '4px solid #0ea5e9',
  overflow: 'hidden'
};

const acceptedByStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '12px 16px',
  background: '#f0fdf4',
  borderRadius: '14px',
  color: '#15803d',
  fontSize: '14px'
};

const progressBarContainerStyle = {
  width: '100px',
  height: '6px',
  background: '#dcfce7',
  borderRadius: '3px',
  overflow: 'hidden'
};

const progressBarFillStyle = {
  height: '100%',
  background: '#22c55e',
  borderRadius: '3px'
};

const sideContainerStyle = {
  display: 'grid',
  gap: '24px',
  position: 'sticky',
  top: '120px'
};

const recognitionCardStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '24px',
  border: '1px solid #f1f5f9',
  boxShadow: '0 10px 25px rgba(0,0,0,0.03)'
};

const ngoRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  padding: '12px',
  background: '#f8fafc',
  borderRadius: '12px'
};

const transparencyCardStyle = {
  background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
  padding: '24px',
  borderRadius: '24px',
  color: '#0369a1'
};

const secondaryButtonStyle = {
  background: 'white',
  border: '1px solid #e2e8f0',
  padding: '16px 22px',
  borderRadius: '16px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
};

const emptyStateStyle = {
  padding: '80px 40px',
  textAlign: 'center',
  background: 'white',
  borderRadius: '24px',
  border: '2px dashed #e2e8f0'
};

export default EscalationHub;
