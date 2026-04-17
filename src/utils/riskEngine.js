/**
 * InfraMind AI - Risk Scoring Engine
 * Calculates a Risk Score (0-100) based on multiple infrastructure factors.
 */

export const calculateRiskScore = (data) => {
  const {
    severity = 1,      // 1-4 (Low, Med, High, Critical)
    frequency = 1,     // Number of similar reports in vicinity
    isSensitive = false, // Proximity to schools/hospitals
    yearsSinceLastRepair = 1,
    weatherFactor = 1.0  // 1.0 to 1.5 multiplier based on conditions
  } = data;

  // Weight distribution
  const weights = {
    severity: 40,
    frequency: 20,
    sensitivity: 20,
    age: 20
  };

  // 1. Severity Score (normalized 0-1)
  const severityScore = (severity / 4);

  // 2. Frequency Score (capped at 10 reports for max score)
  const frequencyScore = Math.min(frequency / 10, 1);

  // 3. Sensitivity Score
  const sensitivityScore = isSensitive ? 1 : 0.2;

  // 4. Age Score (capped at 5 years since repair)
  const ageScore = Math.min(yearsSinceLastRepair / 5, 1);

  // Calculate Base Score
  let baseScore = (
    (severityScore * weights.severity) +
    (frequencyScore * weights.frequency) +
    (sensitivityScore * weights.sensitivity) +
    (ageScore * weights.age)
  );

  // Apply Weather Multiplier (simulating environmental pressure)
  baseScore *= weatherFactor;

  // Clamp 0-100
  const finalScore = Math.min(Math.max(Math.round(baseScore), 0), 100);

  return {
    score: finalScore,
    category: getRiskCategory(finalScore),
    color: getRiskColor(finalScore)
  };
};

export const getRiskCategory = (score) => {
  if (score < 25) return 'Safe';
  if (score < 50) return 'Watch';
  if (score < 75) return 'High Risk';
  return 'Critical';
};

export const getRiskColor = (score) => {
  if (score < 25) return '#10b981'; // Green
  if (score < 50) return '#f59e0b'; // Yellow (Amber)
  if (score < 75) return '#f97316'; // Orange
  return '#ef4444'; // Red
};
