/**
 * Data Sync Service for InfraMind AI
 * Centralizes report processing, AI simulation, and consistency across pages.
 */

// Helper to generate a deterministic random number based on a string (ID)
const seedRandom = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647;
};

const WORK_STEPS = [
  "Structural reinforcement of base",
  "High-pressure cleaning and debris removal",
  "Material replacement (Grade A Concrete)",
  "Safety barrier installation",
  "Advanced sensor grid integration",
  "Waterproofing and sealant application",
  "Traffic flow management during repairs",
  "Final inspection and quality audit"
];

const CATEGORIES = ['Pothole', 'Drainage', 'Lighting', 'Structural', 'Maintenance'];

export const generateAIData = (id, category = 'Maintenance') => {
  const seed = seedRandom(id);
  
  // Cost between 20,000 and 600,000
  const estimatedCost = Math.floor(seed * 580000) + 20000;
  
  // Predictable set of work steps based on seed
  const requiredWork = [];
  const numSteps = Math.floor(seed * 3) + 3; // 3 to 5 steps
  for (let i = 0; i < numSteps; i++) {
    requiredWork.push(WORK_STEPS[(Math.floor(seed * 10) + i) % WORK_STEPS.length]);
  }

  const timeToRepair = `${Math.floor(seed * 7) + 3}-10 Days`;
  const riskLevels = ['Low', 'Elevated', 'Critical', 'Moderate'];
  const riskLevel = riskLevels[Math.floor(seed * riskLevels.length)];

  return {
    estimatedCost,
    requiredWork,
    timeToRepair,
    riskLevel
  };
};

export const processReport = (report) => {
  const id = report.id || `temp-${Math.random()}`;
  const createdAt = report.createdAt?.toDate ? report.createdAt.toDate() : (report.createdAt || new Date());
  const diffDays = Math.floor((new Date() - createdAt) / (1000 * 60 * 60 * 24));
  
  const isDelayed = diffDays >= 10 || report.status === 'Delayed';
  const category = report.category || CATEGORIES[Math.floor(seedRandom(id) * CATEGORIES.length)];
  
  // Use stored AI data if available, otherwise generate it (legacy support)
  const aiData = report.aiData || generateAIData(id, category);

  // Status mapping
  let status = report.status || 'Action Required';
  if (isDelayed && status !== 'Resolved' && status !== 'In Progress') {
    status = 'Delayed';
  }

  return {
    ...report,
    id,
    category,
    createdAt,
    daysDelayed: diffDays,
    isDelayed,
    aiData,
    status,
    score: report.score || Math.floor(seedRandom(id) * 60) + 40,
    acceptedBy: report.acceptedBy || null,
    progress: report.progress || (report.acceptedBy ? 15 : 0),
    color: report.color || getCategoryColor(category)
  };
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Critical': return '#dc2626';
    case 'Pothole': return '#92400e';
    case 'Drainage': return '#0369a1';
    case 'Lighting': return '#eab308';
    default: return '#2563eb';
  }
};

export const syncAllReports = (reports, demoReports = []) => {
  const processed = reports.map(processReport);
  // Add missing demo reports if needed (optional based on page needs)
  return processed;
};
