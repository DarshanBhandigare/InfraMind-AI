import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Inbox, 
  Search, 
  User, 
  Mail, 
  Building2, 
  Clock3, 
  CheckCircle2, 
  Trash2, 
  MessageSquare,
  Navigation,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { X } from 'lucide-react';

const InquiriesConsole = () => {
  const [inquiries, setInquiries] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('id');

  const setSelectedId = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) newParams.set('id', id);
    else newParams.delete('id');
    setSearchParams(newParams);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    });

    return unsubscribe;
  }, []);

  const selectedInquiry = useMemo(
    () => inquiries.find(i => i.id === selectedId) || null,
    [inquiries, selectedId]
  );

  const filteredInquiries = useMemo(() => {
    const queryStr = searchTerm.toLowerCase().trim();
    return inquiries.filter(i => {
      const matchesSearch = !queryStr || 
        i.name?.toLowerCase().includes(queryStr) || 
        i.email?.toLowerCase().includes(queryStr) || 
        i.message?.toLowerCase().includes(queryStr);
      
      const matchesFilter = filter === 'all' ? true : i.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [inquiries, searchTerm, filter]);

  const handleMarkReplied = async (id) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { status: 'replied' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this inquiry?")) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
        setSelectedId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleString();
  };

  return (
    <div style={containerStyle}>
      {/* Master List Pane */}
      <aside style={masterPaneStyle}>
        <div style={paneHeaderStyle}>
          <div style={sectionHeaderStyle}>
            <Inbox size={18} color="#0f766e" />
            <span style={terminalLabelStyle}>Citizen Inquiries</span>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={16} style={searchIconStyle} />
            <input
              style={searchInputStyle}
              placeholder="Search by name, email or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div style={filterScrollStyle}>
             <button onClick={() => setFilter('all')} style={filterChipStyle(filter === 'all')}>All</button>
             <button onClick={() => setFilter('unread')} style={filterChipStyle(filter === 'unread')}>Unread</button>
             <button onClick={() => setFilter('replied')} style={filterChipStyle(filter === 'replied')}>Replied</button>
          </div>
        </div>

        <div style={listScrollStyle}>
          {filteredInquiries.map((inquiry) => (
            <button
              key={inquiry.id}
              onClick={() => setSelectedId(inquiry.id)}
              style={itemButtonStyle(inquiry.id === selectedId)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 800, fontSize: '15px' }}>{inquiry.name}</span>
                {inquiry.status === 'unread' && <div style={unreadBadge} />}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>{inquiry.email}</div>
              <div style={previewTextStyle}>{inquiry.message?.substring(0, 60)}...</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>{formatTimestamp(inquiry.createdAt)}</div>
            </button>
          ))}
          {filteredInquiries.length === 0 && (
            <div style={emptyStateStyle}>No inquiries found.</div>
          )}
        </div>
      </aside>

      {/* Detail Pane */}
      <section style={detailPaneStyle}>
        <AnimatePresence mode="wait">
          {selectedInquiry ? (
            <motion.div
              key={selectedInquiry.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <div style={detailHeaderStyle}>
                <div>
                  <div style={badgeStyle}>Citizen Inquiry</div>
                  <h1 style={titleStyle}>{selectedInquiry.name}</h1>
                  <div style={subtitleStyle}>{selectedInquiry.email}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedInquiry.status !== 'replied' && (
                    <button onClick={() => handleMarkReplied(selectedInquiry.id)} style={replyButtonStyle}>
                      <CheckCircle2 size={18} /> Mark as Replied
                    </button>
                  )}
                  <button onClick={() => handleDelete(selectedInquiry.id)} style={deleteButtonStyle}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div style={contentAreaStyle}>
                 <div style={cardStyle}>
                   <div style={cardHeaderStyle}>
                     <MessageSquare size={16} />
                     CITIZEN MESSAGE
                   </div>
                   <div style={messageContentStyle}>{selectedInquiry.message}</div>
                 </div>

                 <div style={metadataGrid}>
                    <div style={cardStyle}>
                       <div style={cardHeaderStyle}><Building2 size={16} /> ORIGIN</div>
                       <div style={metadataValue}>{selectedInquiry.department || 'General Inquiry'}</div>
                    </div>
                    <div style={cardStyle}>
                       <div style={cardHeaderStyle}><Clock3 size={16} /> RECEIVED</div>
                       <div style={metadataValue}>{formatTimestamp(selectedInquiry.createdAt)}</div>
                    </div>
                 </div>

                 <div style={nextStepsCard}>
                    <div style={{ fontWeight: 800, color: '#1e3a8a', marginBottom: '12px', fontSize: '14px' }}>Required Actions:</div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                       <div style={actionRow}><ArrowUpRight size={14} /> Triage within department protocols</div>
                       <div style={actionRow}><ArrowUpRight size={14} /> Forward to Infrastructure Planning if applicable</div>
                       <div style={actionRow}><ArrowUpRight size={14} /> Send confirmation mail to citizen dashboard</div>
                    </div>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div style={noSelectionStyle}>
               <Navigation size={48} color="#94a3b8" />
               <p style={{ marginTop: '16px', fontWeight: 600, color: '#64748b' }}>Select an inquiry to read details</p>
            </div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
};

// Styles
const containerStyle = {
  display: 'flex',
  height: 'calc(100vh - 80px)',
  background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f0f7ff 100%)'
};

const masterPaneStyle = {
  width: '380px',
  background: 'rgba(255, 255, 255, 0.45)',
  backdropFilter: 'blur(32px)',
  borderRight: '1px solid rgba(255, 255, 255, 0.3)',
  display: 'flex',
  flexDirection: 'column'
};

const paneHeaderStyle = {
  padding: '24px',
  borderBottom: '1px solid #e2e8f0'
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px'
};

const terminalLabelStyle = {
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#475569'
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 14px 12px 40px',
  borderRadius: '12px',
  border: '1px solid #dbe4f0',
  fontSize: '14px',
  outline: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
};

const searchIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8'
};

const filterScrollStyle = {
  display: 'flex',
  gap: '8px',
  marginTop: '16px'
};

const filterChipStyle = (isActive) => ({
  padding: '6px 14px',
  borderRadius: '999px',
  border: 'none',
  background: isActive ? '#0f766e' : '#f1f5f9',
  color: isActive ? 'white' : '#64748b',
  fontSize: '12px',
  fontWeight: 700,
  cursor: 'pointer'
});

const listScrollStyle = {
  flex: 1,
  overflowY: 'auto',
  padding: '16px'
};

const itemButtonStyle = (isActive) => ({
  width: '100%',
  padding: '20px',
  borderRadius: '18px',
  background: isActive ? 'linear-gradient(135deg, #ffffff 0%, #eef7ff 100%)' : 'rgba(255, 255, 255, 0.6)',
  border: isActive ? '1px solid #0052cc' : '1px solid rgba(255, 255, 255, 0.4)',
  textAlign: 'left',
  marginBottom: '12px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: isActive ? '0 10px 25px rgba(0, 82, 204, 0.1)' : '0 4px 12px rgba(0,0,0,0.02)'
});

const unreadBadge = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: '#ef4444'
};

const previewTextStyle = {
  fontSize: '12px',
  color: '#64748b',
  lineHeight: 1.4,
  marginTop: '6px'
};

const emptyStateStyle = {
  padding: '40px',
  textAlign: 'center',
  color: '#94a3b8',
  fontSize: '14px'
};

const detailPaneStyle = {
  flex: 1,
  padding: '40px 60px',
  overflowY: 'auto'
};

const detailHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '40px'
};

const badgeStyle = {
  display: 'inline-block',
  padding: '6px 12px',
  background: '#eff6ff',
  color: '#2563eb',
  borderRadius: '999px',
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
  marginBottom: '12px'
};

const titleStyle = {
  fontSize: '36px',
  fontWeight: 800,
  margin: 0,
  color: '#0f172a'
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#64748b',
  marginTop: '4px'
};

const replyButtonStyle = {
  padding: '12px 24px',
  background: '#0f766e',
  color: 'white',
  border: 'none',
  borderRadius: '14px',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
  boxShadow: '0 8px 16px rgba(15, 118, 110, 0.2)'
};

const deleteButtonStyle = {
  width: '48px',
  height: '48px',
  background: '#fff1f2',
  color: '#e11d48',
  border: '1px solid #fecdd3',
  borderRadius: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer'
};

const contentAreaStyle = {
  display: 'grid',
  gap: '24px'
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(20px)',
  padding: '32px',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 10px 30px rgba(0,0,0,0.03)'
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '11px',
  fontWeight: 900,
  color: '#94a3b8',
  marginBottom: '20px',
  letterSpacing: '0.1em'
};

const messageContentStyle = {
  fontSize: '18px',
  lineHeight: 1.7,
  color: '#1e293b',
  whiteSpace: 'pre-wrap'
};

const metadataGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '24px'
};

const metadataValue = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#0f172a'
};

const nextStepsCard = {
  padding: '24px 32px',
  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
  borderRadius: '24px',
  border: '1px solid #bfdbfe'
};

const actionRow = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '13px',
  color: '#1e40af',
  fontWeight: 600
};

const noSelectionStyle = {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

export default InquiriesConsole;
