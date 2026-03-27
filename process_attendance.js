const fs = require('fs');
const path = require('path');
const normalizeClass = require('./normalize_classes');

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

// Generate summary
console.log('Week,Total Classes,Qualified Classes,Bonus Used');
Object.entries(weekData).forEach(([week, stats]) => {
  console.log(`${week},${stats.total},${stats.qualified},${stats.bonusUsed}`);
});