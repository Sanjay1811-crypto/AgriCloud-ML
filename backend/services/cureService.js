const fs = require('fs');
const path = require('path');

let curesData = { classes: [] };
let curesMap = new Map();

const loadCures = () => {
  try {
    const filePath = path.join(__dirname, '..', 'data', 'cures.json');
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      curesData = JSON.parse(raw);
      curesMap.clear();
      for (const item of curesData.classes) {
        curesMap.set(item.id, item);
        curesMap.set(item.disease.toLowerCase(), item);
      }
      console.log(`[CureService] Loaded ${curesData.classes.length} disease curation profiles.`);
    }
  } catch (err) {
    console.error('[CureService] Failed to load cures.json:', err.message);
  }
};

loadCures();

const getCureByClass = (rawClassOrName) => {
  if (!rawClassOrName) return null;
  
  // Direct match by ID
  if (curesMap.has(rawClassOrName)) {
    return curesMap.get(rawClassOrName);
  }
  
  // Lowercase match
  const lower = rawClassOrName.toLowerCase();
  if (curesMap.has(lower)) {
    return curesMap.get(lower);
  }
  
  // Fuzzy search in classes
  for (const item of curesData.classes) {
    if (
      item.id.toLowerCase().includes(lower) ||
      item.disease.toLowerCase().includes(lower) ||
      lower.includes(item.disease.toLowerCase())
    ) {
      return item;
    }
  }

  // Fallback if not found
  return {
    id: rawClassOrName,
    crop: 'General Plant',
    disease: rawClassOrName,
    isHealthy: rawClassOrName.toLowerCase().includes('healthy'),
    cause: 'Pathological or physiological anomaly requiring expert field inspection.',
    symptoms: 'Foliar discoloration, chlorosis, or necrotic spots.',
    treatment: 'Isolate plant; apply broad-spectrum copper fungicide or appropriate bio-agent; prune affected foliage.',
    prevention: 'Maintain proper plant spacing, drip irrigation, and sterile tool practices.'
  };
};

const getAllClasses = () => curesData.classes;

module.exports = {
  getCureByClass,
  getAllClasses,
  loadCures
};
