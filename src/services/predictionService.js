/**
 * InfraMind AI - Prediction Service
 * Detects patterns in reports to predict infrastructure failure before it becomes critical.
 */

/**
 * Classifies the health trajectory of an infrastructure asset.
 * @param {Array} history - Array of previous risk scores for the same asset location.
 */
export const predictHealthState = (history) => {
  if (!history || history.length < 2) return 'Stable';
  
  // Sort by date (descending)
  const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
  const current = sorted[0].score;
  const previous = sorted[1].score;
  
  const diff = current - previous;
  const velocity = diff / history.length; // Normalized by report volume

  if (current > 80) return 'Critical';
  if (velocity > 10) return 'Critical'; // Rapid worsening
  if (velocity > 3) return 'Degrading';  // Gradual worsening
  if (velocity < -2) return 'Improving'; // Getting better (repairs detected)
  
  return 'Stable';
};

/**
 * Calculates Trend Velocity for the risk engine.
 * @param {Array} recentReports - Reports in the last 7 days.
 * @param {Array} historicalReports - Reports in the previous 23 days.
 */
export const calculateTrendVelocity = (recentCount, historicalCount) => {
  if (historicalCount === 0) return 1.0;
  
  const dailyHistory = historicalCount / 23;
  const dailyRecent = recentCount / 7;
  
  const ratio = dailyRecent / dailyHistory;
  
  // Cap at 2.0 (Extreme urgency) and floor at 1.0
  return Math.min(Math.max(ratio, 1.0), 2.0);
};

/**
 * Mock Environmental Analysis
 * Simulates weather impact based on current season.
 */
export const getEnvironmentalMultiplier = () => {
  const month = new Date().getMonth();
  // Monsoon in Mumbai (June to September)
  if (month >= 5 && month <= 8) return 1.4; 
  // High summer (Heat expansion)
  if (month >= 3 && month <= 4) return 1.1;
  return 1.0;
};
