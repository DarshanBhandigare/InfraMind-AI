/**
 * InfraMind AI - User Trust Service
 * Manages citizen reputation scores to prevent corruption and handle report credibility.
 */

import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

/**
 * Retrieves the trust score for a specific user.
 * Defaults to 50 for new users.
 */
export const getUserTrustScore = async (userId) => {
  if (!userId) return 50;
  
  try {
    const userRef = doc(db, 'users_meta', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data().trustScore || 50;
    } else {
      // Initialize with base trust
      await setDoc(userRef, { trustScore: 50, reportCount: 0, verifiedCount: 0 });
      return 50;
    }
  } catch (error) {
    console.error("Error fetching trust score:", error);
    return 50;
  }
};

/**
 * Updates trust score based on event.
 * @param {string} userId
 * @param {'verify' | 'reject' | 'report'} action 
 */
export const updateTrustScore = async (userId, action) => {
  if (!userId) return;
  
  const userRef = doc(db, 'users_meta', userId);
  let adjustment = 0;
  
  switch(action) {
    case 'verify': adjustment = 5; break;  // Report was accurate
    case 'reject': adjustment = -15; break; // Report was found to be fraudulent
    case 'report': adjustment = 1; break;  // Successful submission
    default: adjustment = 0;
  }
  
  try {
    await updateDoc(userRef, {
      trustScore: increment(adjustment),
      reportCount: action === 'report' ? increment(1) : increment(0),
      verifiedCount: action === 'verify' ? increment(1) : increment(0)
    });
  } catch (error) {
    console.warn("Could not update trust metadata:", error);
  }
};

/**
 * Logic to detect if a report is likely consistent with others nearby.
 * Returns a 'Consistency Bonus' multiplier.
 */
export const calculateConsistency = (reportArea, nearbyReports) => {
  if (!nearbyReports || nearbyReports.length === 0) return 1.0;
  
  const similarTypeCount = nearbyReports.filter(r => r.type === reportArea.type).length;
  
  // If many people are reporting the same thing, trust floor is higher
  if (similarTypeCount >= 3) return 1.4;
  if (similarTypeCount >= 1) return 1.2;
  
  return 1.0;
};
