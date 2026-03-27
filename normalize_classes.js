// Normalize class formats based on EQUIV_GROUPS
const EQUIV_GROUPS = {
  'CB_HIIT': ['Cardio Barre', 'HIIT'],
  'CB_AMP': ['Cardio Barre', 'Amped Up'],
  'CB_CBP': ['Cardio Barre', 'Cardio Barre Plus'],
  'CB_TC': ['Cardio Barre', "Trainer's Choice"],
  'FIT_LAB': ['FIT', 'Strength Lab'],
  'FIT_BBB': ['FIT', 'Back Body Blaze'],
  'LAB_BBB': ['Strength Lab', 'Back Body Blaze'],
  'PC_interchangeable': ['PowerCycle', 'Cardio'],
  'B57_interchangeable': ['Barre 57', 'Cardio'],
  'Mat_interchangeable': ['Mat 57', 'Cardio'],
  'REC_interchangeable': ['Recovery', 'Strength']
};

// Add normalization toggle
let normalizationEnabled = true; // Default to enabled

function setNormalizationEnabled(enabled) {
  normalizationEnabled = enabled;
}

function normalizeClass(cleanedClass) {
  if (!normalizationEnabled) {
    return cleanedClass; // Return as is if normalization is disabled
  }

  for (const group of Object.values(EQUIV_GROUPS)) {
    if (group.includes(cleanedClass)) {
      return group[0]; // Normalize to the first class in the group
    }
  }
  return cleanedClass; // Return as is if no match found
}

module.exports = { normalizeClass, setNormalizationEnabled };