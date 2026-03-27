const fs = require('fs');
const path = require('path');
const { normalizeClass } = require('./normalize_classes');

// Read and process the CSV file
const csvFilePath = path.join(__dirname, 'Day End Report - Part 4 - Checkins (5).csv');
const csv = fs.readFileSync(csvFilePath, 'utf-8');

// Parse CSV into rows
const rows = csv.split('\n').map(row => row.split(','));
const headers = rows[0];
const data = rows.slice(1);

// Extract relevant columns
const cleanedClassIndex = headers.indexOf('Cleaned Class');
const dateIndex = headers.indexOf('Date (IST)');
const checkedInIndex = headers.indexOf('Checked In');
const complementaryIndex = headers.indexOf('Complementary');

// Group data by week
const weekData = {};
data.forEach(row => {
  const cleanedClass = normalizeClass(row[cleanedClassIndex]);
  const date = new Date(row[dateIndex]);
  const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`;
  const checkedIn = row[checkedInIndex] === 'TRUE';
  const complementary = row[complementaryIndex] === 'TRUE';

  if (!weekData[week]) {
    weekData[week] = { total: 0, qualified: 0, bonusUsed: 0 };
  }

  weekData[week].total += 1;
  if (checkedIn) {
    weekData[week].qualified += 1;
    if (complementary) {
      weekData[week].bonusUsed += 1;
    }
  }
});

// Update weekData to dynamically apply bonus classes
function applyBonusClasses(weekData, bonusClasses) {
  Object.keys(weekData).forEach(week => {
    const weekStats = weekData[week];
    const missingFormats = calculateMissingFormats(weekStats);

    missingFormats.forEach(format => {
      const bonusIndex = bonusClasses.findIndex(bonus => bonus.format === format && !bonus.used);
      if (bonusIndex !== -1) {
        const bonus = bonusClasses[bonusIndex];
        weekStats.bonusUsed += 1;
        weekStats.qualified += 1;
        bonus.used = true;
      }
    });
  });
}

function calculateMissingFormats(weekStats) {
  const requiredFormats = ['Cardio', 'Strength', 'Flexibility']; // Example formats
  const completedFormats = weekStats.completedFormats || [];

  return requiredFormats.filter(format => !completedFormats.includes(format));
}

// Export updated CSV
function exportCSV(weekData) {
  const headers = ['Week', 'Total Classes', 'Qualified', 'Bonus Classes Used', 'Qualified After Bonus'];
  const rows = [headers];

  Object.keys(weekData).forEach(week => {
    const { total, qualified, bonusUsed } = weekData[week];
    rows.push([week, total, qualified, bonusUsed, qualified]);
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  fs.writeFileSync('Updated_Report.csv', csvContent);
}

// Example usage
const bonusClasses = [
  { format: 'Strength', used: false },
  { format: 'Cardio', used: false }
];
applyBonusClasses(weekData, bonusClasses);
exportCSV(weekData);

// Generate summary
console.log('Week,Total Classes,Qualified Classes,Bonus Used');
Object.entries(weekData).forEach(([week, stats]) => {
  console.log(`${week},${stats.total},${stats.qualified},${stats.bonusUsed}`);
});