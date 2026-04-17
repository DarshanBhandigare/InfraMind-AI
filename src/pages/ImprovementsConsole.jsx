import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { 
  Sparkles, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Trash2,
  MoreVertical,
  ThumbsUp,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImprovementsConsole = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'suggestions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSuggestions(data);
    });

    return unsubscribe;
  }, []);

  const filteredSuggestions = useMemo(() => {
    const queryStr = searchTerm.toLowerCase().trim();
    return suggestions.filter(s => {
      const matchesSearch = !queryStr || s.text?.toLowerCase().includes(queryStr) || s.userEmail?.toLowerCase().includes(queryStr);
      const matchesFilter = activeFilter === 'all' ? true : s.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [suggestions, searchTerm, activeFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'suggestions', id), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this suggestion from the public feed?")) {
      try {
        await deleteDoc(doc(db, 'suggestions', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <div style={badgeStyle}>Citizen Voice</div>
          <h1 style={titleStyle}>Public Improvement Feed</h1>
          <p style={subtitleStyle}>Manage community-driven infrastructure suggestions and improvement ideas.</p>
        </div>
        
        <div style={statsRow}>
           <StatCard icon={<TrendingUp size={16}/>} label="Total Growth" value={suggestions.length} color="#2563eb" />
           <StatCard icon={<CheckCircle2 size={16}/>} label="Implemented" value={suggestions.filter(s => s.status === 'done').length} color="#10b981" />
           <StatCard icon={<Clock size={16}/>} label="Pending" value={suggestions.filter(s => s.status === 'pending' || !s.status).length} color="#f59e0b" />
        </div>
      </header>

      <div style={toolbarStyle}>
        <div style={{ position: 'relative', width: '400px' }}>
          <Search size={18} style={searchIconStyle} />
          <input 
            style={searchInputStyle}
            placeholder="Search suggestions or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={filterGroup}>
          {['all', 'pending', 'reviewing', 'done'].map(f => (
            <button 
              key={f}
              onClick={() => setActiveFilter(f)}
              style={filterButtonStyle(activeFilter === f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={gridStyle}>
        <AnimatePresence>
          {filteredSuggestions.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={cardStyle}
            >
              <div style={cardHeader}>
                 <div style={statusTag(item.status)}>
                   {item.status || 'pending'}
                 </div>
                 <button onClick={() => handleDelete(item.id)} style={iconButton}><Trash2 size={16}/></button>
              </div>

              <div style={suggestionText}>"{item.text}"</div>

              <div style={cardFooter}>
                <div style={userInfo}>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.userEmail || 'User'}`} style={avatarStyle} alt="avatar" />
                   <div style={{ minWidth: 0 }}>
                      <div style={userEmail}>{item.userEmail}</div>
                      <div style={timestamp}>{new Date(item.createdAt?.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleDateString()}</div>
                   </div>
                </div>
              </div>

              <div style={actionRow}>
                 <button 
                   onClick={() => handleStatusUpdate(item.id, 'reviewing')}
                   style={secondaryAction}
                 >
                   Under Review
                 </button>
                 <button 
                   onClick={() => handleStatusUpdate(item.id, 'done')}
                   style={primaryAction}
                 >
                   Approve
                 </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSuggestions.length === 0 && (
        <div style={emptyContainer}>
          <Sparkles size={64} color="#e5e7eb" />
          <h3 style={{ marginTop: '20px', color: '#64748b' }}>No suggestions match your criteria</h3>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle = {
  padding: '60px 5%',
  background: 'linear-gradient(135deg, #f0f7ff 0%, #ffffff 50%, #f0f7ff 100%)',
  minHeight: 'calc(100vh - 80px)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '60px'
};

const badgeStyle = {
  display: 'inline-block',
  padding: '6px 14px',
  background: 'rgba(37, 99, 235, 0.1)',
  color: '#2563eb',
  borderRadius: '999px',
  fontSize: '12px',
  fontWeight: 800,
  letterSpacing: '1px',
  textTransform: 'uppercase',
  marginBottom: '16px'
};

const titleStyle = {
  fontSize: '48px',
  fontWeight: 800,
  letterSpacing: '-1.5px',
  margin: 0,
  color: '#0f172a'
};

const subtitleStyle = {
  fontSize: '18px',
  color: '#64748b',
  marginTop: '12px',
  maxWidth: '600px',
  lineHeight: 1.6
};

const statsRow = {
  display: 'flex',
  gap: '24px'
};

const StatCard = ({ icon, label, value, color }) => (
  <div style={{ background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)', padding: '24px', borderRadius: '24px', minWidth: '160px', boxShadow: '0 10px 25px rgba(0,0,0,0.03)', border: '1px solid rgba(255,255,255,0.4)' }}>
    <div style={{ color, marginBottom: '12px' }}>{icon}</div>
    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>{value}</div>
  </div>
);

const toolbarStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '40px'
};

const searchInputStyle = {
  width: '100%',
  padding: '14px 14px 14px 50px',
  borderRadius: '16px',
  border: '1px solid #dbe4f0',
  fontSize: '15px',
  outline: 'none',
  background: 'white',
  boxShadow: '0 8px 24px rgba(15, 23, 42, 0.04)'
};

const searchIconStyle = {
  position: 'absolute',
  left: '18px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#94a3b8'
};

const filterGroup = {
  display: 'flex',
  gap: '10px'
};

const filterButtonStyle = (isActive) => ({
  padding: '10px 20px',
  borderRadius: '12px',
  border: 'none',
  background: isActive ? '#0f172a' : 'white',
  color: isActive ? 'white' : '#64748b',
  fontSize: '12px',
  fontWeight: 800,
  cursor: 'pointer',
  transition: 'all 0.2s',
  boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
});

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
  gap: '24px'
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.55)',
  backdropFilter: 'blur(24px)',
  padding: '30px',
  borderRadius: '28px',
  border: '1px solid rgba(255, 255, 255, 0.5)',
  boxShadow: '0 15px 35px rgba(0,0,0,0.03)',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column'
};

const cardHeader = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px'
};

const statusTag = (status) => ({
  padding: '6px 12px',
  borderRadius: '8px',
  fontSize: '11px',
  fontWeight: 800,
  textTransform: 'uppercase',
  background: status === 'done' ? '#dcfce7' : status === 'reviewing' ? '#e0f2fe' : '#fef3c7',
  color: status === 'done' ? '#166534' : status === 'reviewing' ? '#075985' : '#854d0e',
});

const iconButton = {
  background: 'none',
  border: 'none',
  color: '#94a3b8',
  cursor: 'pointer',
  padding: '5px'
};

const suggestionText = {
  fontSize: '20px',
  fontWeight: 600,
  color: '#0f172a',
  lineHeight: 1.5,
  marginBottom: '30px',
  flex: 1
};

const cardFooter = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingTop: '20px',
  borderTop: '1px solid #f1f5f9',
  marginBottom: '20px'
};

const userInfo = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  minWidth: 0
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: '#f1f5f9'
};

const userEmail = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#475569',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const timestamp = {
  fontSize: '11px',
  color: '#94a3b8',
  marginTop: '2px'
};

const actionRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px'
};

const primaryAction = {
  padding: '12px',
  borderRadius: '12px',
  background: '#0ea5e9',
  color: 'white',
  fontWeight: 700,
  fontSize: '13px',
  border: 'none',
  cursor: 'pointer'
};

const secondaryAction = {
  padding: '12px',
  borderRadius: '12px',
  background: '#f1f5f9',
  color: '#475569',
  fontWeight: 700,
  fontSize: '13px',
  border: 'none',
  cursor: 'pointer'
};

const emptyContainer = {
  gridColumn: '1 / -1',
  padding: '100px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
};

export default ImprovementsConsole;
