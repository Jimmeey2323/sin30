// Build script: generates config.live.js from environment variables
// Run automatically by Vercel during deployment
const fs = require('fs');

const spreadsheetId = process.env.SPREADSHEET_ID || '';
const sheetName     = process.env.SHEET_NAME || 'Checkins';
const clientId      = process.env.CLIENT_ID || '';
const clientSecret  = process.env.CLIENT_SECRET || '';
const refreshToken  = process.env.REFRESH_TOKEN || '';

if (!spreadsheetId || !clientId || !clientSecret || !refreshToken) {
  console.warn('WARNING: One or more Google Sheets env vars are missing. Set them in the Vercel dashboard.');
}

const content = `window.GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: '${spreadsheetId}',
  SHEET_NAME: '${sheetName}',
  CLIENT_ID: '${clientId}',
  CLIENT_SECRET: '${clientSecret}',
  REFRESH_TOKEN: '${refreshToken}'
};
`;

fs.writeFileSync('config.live.js', content);
console.log('config.live.js generated from environment variables.');
