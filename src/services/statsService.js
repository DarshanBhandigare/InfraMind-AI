import { db } from './firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc, getDoc } from 'firebase/firestore';

const STATS_DOC_PATH = 'metadata/stats';

/**
 * Initializes stats document if it doesn't exist
 */
export const initializeStats = async () => {
  const statsRef = doc(db, STATS_DOC_PATH);
  const snap = await getDoc(statsRef);
  
  if (!snap.exists()) {
    await setDoc(statsRef, {
      totalReports: 0,
      highRiskCount: 0,
      resolvedCount: 0,
      delayedCount: 0,
      totalEstimatedCost: 0,
      lastUpdated: new Date()
    });
  }
};

/**
 * Subscribes to global stats in real-time
 */
export const subscribeToStats = (callback) => {
  const statsRef = doc(db, STATS_DOC_PATH);
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    }
  });
};

/**
 * Atomic updates for global counters
 */
export const updateGlobalStats = async (updates) => {
  const statsRef = doc(db, STATS_DOC_PATH);
  
  // Transform key-value pairs into increment calls
  const firebaseUpdates = {};
  Object.keys(updates).forEach(key => {
    firebaseUpdates[key] = increment(updates[key]);
  });
  firebaseUpdates.lastUpdated = new Date();

  try {
    await updateDoc(statsRef, firebaseUpdates);
  } catch (err) {
    // If update fails, doc might not exist, try initializing and then update
    await initializeStats();
    await updateDoc(statsRef, firebaseUpdates);
  }
};
