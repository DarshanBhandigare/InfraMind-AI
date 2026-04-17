import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { AlertTriangle, ShieldAlert, Zap, MapPin, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('Critical');

  useEffect(() => {
    // We'll query all and filter in JS to avoid needing complex indexes for a demo
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlerts(data.filter(r => r.category === 'Critical' || r.category === 'High Risk'));
    });
    return unsubscribe;
  }, []);

  const filteredAlerts = filter === 'All' 
    ? alerts 
    : alerts.filter(a => a.category === filter);

  return (
    <div className="section-container" style={{ paddingTop: '120px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={40} color="var(--critical)" /> Priority Alerts
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Immediate attention required for these infrastructure failures.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '0.8rem', background: 'var(--surface-light)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
          {['All', 'Critical', 'High Risk'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.5rem 1.2rem',
                borderRadius: '8px',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        <AnimatePresence>
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <motion.div 
                key={alert.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass-card"
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderLeft: `5px solid ${alert.color}`
                }}
              >
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '15px', 
                    background: `${alert.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <AlertTriangle color={alert.color} size={30} />
                  </div>
                  <div>
                    <h3 style={{ marginBottom: '0.3rem' }}>{alert.type}</h3>
                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={14}/> {alert.address || 'Location detected'}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Clock size={14}/> {alert.createdAt?.toDate().toLocaleString() || 'Just now'}</span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 700, 
                    color: alert.color,
                    marginBottom: '0.2rem'
                  }}>
                    {alert.score}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.7 }}>
                    Risk Score
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '5rem', opacity: 0.5 }}>
              <Zap size={48} style={{ marginBottom: '1rem' }} />
              <p>No active {filter} alerts. Everything looks stable.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Alerts;
