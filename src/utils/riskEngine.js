/**
 * InfraMind AI - Advanced Risk Scoring Engine (v2.0)
 * Calculates a Predictive Risk Score (0-100) based on city-scale variables.
 */

export const calculateRiskScore = (data) => {
  const {
    severity = 1,       // 1-4 (Low, Med, High, Critical)
    frequency = 1,      // Reports in same location
    isSensitive = false, // Proximity to schools/hospitals
    userTrust = 50,     // 0-100 User reputation
    trendFactor = 1.0,  // Velocity of new reports (1.0 - 2.0)
    weatherFactor = 1.0 // Environmental pressure
  } = data;

  // Weight distribution (Targeting Corruption Resilience & Prediction)
  const weights = {
    severity: 0.35,      // Visual/Technical Damage
    context: 0.20,       // Sensitive Locations
    credibility: 0.15,   // User Trust influence
    velocity: 0.30       // Trend/Urgency
  };

  // 1. Severity Score (normalized 1-4 to 0-1)
  const sScore = (severity - 1) / 3;

  // 2. Context Score (Sensitive location bonus)
  const cScore = isSensitive ? 1.0 : 0.2;

  // 3. Credibility Score (Normalizing trust score)
  const trustScore = userTrust / 100;

  // 4. Velocity/Trend Score
  const vScore = Math.min((frequency / 5) * trendFactor, 1.5); // Can exceed 1 for urgency

  // Calculate Weighted Component Base
  let totalScore = (
    (sScore * weights.severity) +
    (cScore * weights.context) +
    (trustScore * weights.credibility) +
    (vScore * weights.velocity)
  ) * 100;

  // Apply Environmental Multiplier
  totalScore *= weatherFactor;

  // Clamp 0-100
  const finalScore = Math.min(Math.max(Math.round(totalScore), 0), 100);

  return {
    score: finalScore,
    category: getRiskCategory(finalScore),
    color: getRiskColor(finalScore),
    factors: {
      isHighVelocity: trendFactor > 1.3,
      isUnverified: userTrust < 30,
      environmentalPressure: weatherFactor > 1.2
    }
  };
};

export const getRiskCategory = (score) => {
  if (score < 30) return 'Stable';
  if (score < 55) return 'Watch';
  if (score < 80) return 'Degrading';
  return 'Critical';
};

export const getRiskColor = (score) => {
  if (score < 25) return '#10b981'; // Green
  if (score < 50) return '#f59e0b'; // Yellow (Amber)
  if (score < 75) return '#f97316'; // Orange
  return '#ef4444'; // Red
};
