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
  Hammer,
  X,
  Check
} from 'lucide-react';
import { collection, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { processReport } from '../services/dataSyncService';

import { doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';

const EscalationHub = () => {
  const { t } = useTranslation();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportIds, setSelectedReportIds] = useState(new Set());

  const toggleReportSelection = (id) => {
    setSelectedReportIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredEscalations.map(e => e.id);
    setSelectedReportIds(new Set(allFilteredIds));
  };

  const clearSelection = () => {
    setSelectedReportIds(new Set());
  };

  const filteredEscalations = useMemo(() => {
    let list = escalations.filter(e => e.isDelayed || e.status === 'Escalated');
    if (selectedCategory !== 'All') {
      list = list.filter(e => e.category === selectedCategory);
    }
    return list;
  }, [escalations, selectedCategory]);

  const totalEscalationCost = useMemo(() => {
    return filteredEscalations.reduce((acc, curr) => acc + (curr.aiData?.estimatedCost || 0), 0);
  }, [filteredEscalations]);

  const selectedEscalations = useMemo(() => {
    return filteredEscalations.filter(e => selectedReportIds.has(e.id));
  }, [filteredEscalations, selectedReportIds]);

  const selectedTotalCost = useMemo(() => {
    return selectedEscalations.reduce((acc, curr) => acc + (curr.aiData?.estimatedCost || 0), 0);
  }, [selectedEscalations]);

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
      alert(t('hub.acceptOk', { org: orgName }));
    } catch (err) {
      console.error("Error accepting task:", err);
      alert(t('hub.acceptFail'));
    }
  };


  return (
    <div style={pageContainerStyle}>
      <section style={headerSectionStyle}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ maxWidth: '800px' }}
        >
          <div style={tagStyle}>
            <Clock size={14} style={{ marginRight: '6px' }} />
            {t('hub.tag')}
          </div>
          <h1 style={titleStyle}>{t('hub.title')} <span style={{ color: 'var(--primary)' }}>{t('hub.titleAccent')}</span></h1>
          <p style={subtitleStyle}>
            {t('hub.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
            <button 
              onClick={() => {
                if (selectedReportIds.size === 0) {
                  alert(t('hub.selectOne'));
                  return;
                }
                setShowReportModal(true);
              }}
              className="btn-primary"
              style={{ ...secondaryButtonStyle, background: selectedReportIds.size > 0 ? 'var(--primary)' : 'white', color: selectedReportIds.size > 0 ? 'white' : 'var(--text-muted)' }}
            >
              <FileText size={18} /> {selectedReportIds.size > 0 ? t('hub.generateSelected', { count: selectedReportIds.size }) : t('hub.generateDelayed')}
            </button>
            {selectedReportIds.size > 0 && (
              <button onClick={clearSelection} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                {t('hub.clearSelection')}
              </button>
            )}
          </div>
        </motion.div>

        <div className="hub-stats-row">
          <StatCard label={t('hub.statDelayed')} value={filteredEscalations.length} color="#ef4444" />
          <StatCard label={t('hub.statAccepted')} value={escalations.filter(e => e.acceptedBy).length} color="#10b981" />
          <StatCard label={t('hub.statCost')} value={`₹${(totalEscalationCost / 100000).toFixed(1)}L`} color="#3b82f6" />
        </div>
      </section>

      <div className="hub-content-grid">
        <div style={{ ...feedContainerStyle, gridColumn: 'span 2' }}>
          <div className="hub-filter-row">
            <h2 style={sectionTitleStyle}>{t('hub.feedTitle')}</h2>
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
                  {t(`hub.categories.${cat}`)}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
             <div style={{ padding: '40px', textAlign: 'center' }}>{t('hub.loading')}</div>
          ) : filteredEscalations.length === 0 ? (
            <div style={emptyStateStyle}>
              <CheckCircle2 size={48} color="#10b981" />
              <h3>{t('hub.allClearTitle')}</h3>
              <p>{t('hub.allClearBody')}</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              <AnimatePresence>
                {filteredEscalations.map((item, index) => (
                  <EscalationCard 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedReportIds.has(item.id)}
                    onToggle={() => toggleReportSelection(item.id)}
                    onAccept={(org) => handleAcceptTask(item.id, org)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showReportModal && (
          <div style={modalOverlayStyle}>
             <motion.div 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.9 }}
               style={modalContentStyle}
             >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '24px' }}>{t('hub.modalTitle')}</h2>
                  <button onClick={() => setShowReportModal(false)} style={iconButtonStyle}><X size={20}/></button>
                </div>

                <div style={reportSummaryGridStyle}>
                  <div style={reportStatStyle}>
                    <div style={infoLabelStyle}>{t('hub.selected')}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedReportIds.size}</div>
                  </div>
                  <div style={reportStatStyle}>
                    <div style={infoLabelStyle}>{t('hub.totalBudget')}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>₹{(selectedTotalCost / 100000).toFixed(1)}L</div>
                  </div>
                  <div style={reportStatStyle}>
                    <div style={infoLabelStyle}>{t('hub.priorityHigh')}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800 }}>{selectedEscalations.filter(e => e.category === 'Critical').length}</div>
                  </div>
                </div>

                <div style={{ marginTop: '24px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #f1f5f9', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '10px' }}>{t('hub.included')}</div>
                  {selectedEscalations.map(esc => (
                    <div key={esc.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                      <div style={{ fontWeight: 600 }}>{esc.type}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{esc.address?.split(',')[0]}</div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    alert(t('hub.generating', { count: selectedReportIds.size }));
                    setShowReportModal(false);
                  }}
                  className="btn-primary" 
                  style={{ width: '100%', marginTop: '30px', padding: '16px', display: 'flex', justifyContent: 'center', gap: '8px', borderRadius: '14px' }}
                >
                  <FileText size={18} /> {t('hub.downloadPdf')}
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EscalationCard = ({ item, isSelected, onToggle, onAccept }) => {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{ ...cardStyle, border: isSelected ? '2px solid var(--primary)' : '1px solid #f1f5f9', background: isSelected ? '#f8fbff' : 'white' }}
    >
      <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          style={{ 
            width: '28px', 
            height: '28px', 
            borderRadius: '8px', 
            border: isSelected ? 'none' : '2px solid #cbd5e1', 
            background: isSelected ? 'var(--primary)' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {isSelected && <Check size={18} color="white" strokeWidth={3} />}
        </button>
      </div>
      <div style={cardHeaderStyle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ ...badgeStyle, background: item.category === 'Critical' ? '#fee2e2' : '#fef3c7', color: item.category === 'Critical' ? '#991b1b' : '#92400e' }}>
              {item.category || t('hub.maintenance')}
            </span>
            <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 700 }}>
              {t('hub.delayedBy', { days: item.daysDelayed })}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '20px' }}>{item.type}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '4px 0 0' }}>{item.address}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t('hub.aiId')}</div>
          <div style={{ fontWeight: 700 }}>#ESC-{item.id.slice(-4)}</div>
        </div>
      </div>

      <div style={infoRowStyle}>
        <div style={infoItemStyle}>
          <DollarSign size={16} />
          <div>
            <div style={infoLabelStyle}>{t('hub.estimatedCost')}</div>
            <div style={infoValueStyle}>₹{item.aiData.estimatedCost.toLocaleString()}</div>
          </div>
        </div>
        <div style={infoItemStyle}>
          <Wrench size={16} />
          <div>
            <div style={infoLabelStyle}>{t('hub.requiredWork')}</div>
            <div style={infoValueStyle}>{item.aiData.timeToRepair}</div>
          </div>
        </div>
        <div style={infoItemStyle}>
          <Shield size={16} />
          <div>
            <div style={infoLabelStyle}>{t('hub.priorityField')}</div>
            <div style={infoValueStyle}>{item.aiData.riskLevel}</div>
          </div>
        </div>
      </div>

      {item.acceptedBy ? (
        <div style={acceptedByStyle}>
          <CheckCircle2 size={18} color="#10b981" />
          <span>{t('hub.acceptedByPrefix')} <strong>{item.acceptedBy}</strong></span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div style={{ fontSize: '12px' }}>{t('hub.progressPct', { pct: item.progress ?? 0 })}</div>
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
            <Hammer size={16} /> {t('hub.takeResponsibility')}
          </button>
          <button 
            style={detailsToggleStyle}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? t('hub.hideAnalysis') : t('hub.showAnalysis')}
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
          <div style={{ fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>{t('hub.aiWorkPlan')}</div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: 1.6 }}>
            {item.aiData?.requiredWork?.map((step, i) => (
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

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.4)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3000,
  padding: '20px'
};

const modalContentStyle = {
  background: 'white',
  padding: '40px',
  borderRadius: '32px',
  width: '100%',
  maxWidth: '600px',
  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
};

const reportSummaryGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '16px'
};

const reportStatStyle = {
  background: '#f1f5f9',
  padding: '16px',
  borderRadius: '16px',
  textAlign: 'center'
};

export default EscalationHub;
