# Stronger in 30 — Challenge Dashboard

A beautiful multi-level fitness challenge tracking dashboard built with vanilla HTML, CSS, and JavaScript.

## Overview

This project displays three difficulty levels of a 30-day fitness challenge:
- **Beginner** ⭐
- **Intermediate** ⭐⭐  
- **Advanced** ⭐⭐⭐

Each level has its own tracking board with member profiles, weekly goals, sticker tracking, and real-time scoring integrated with Google Sheets.

## Features

- 🎯 **Tabbed Dashboard**: Switch between difficulty levels seamlessly with auto-refresh every 5 minutes
- 📊 **Interactive Boards**: Click to place stickers, view weekly goals
- 🔄 **Google Sheets Integration**: Auto-populate check-ins from Google Sheets (requires setup)
- 🏆 **Scoring System**: Track completion by week and total classes
- 📍 **Location Grouping**: Members organized by studio location
- 🎨 **Responsive Design**: Works on desktop, tablet, and mobile
- ✨ **Smooth Animations**: Polished user experience with transitions
- ⌨️ **Keyboard Shortcuts**: Ctrl/Cmd + 1/2/3 for tabs, Ctrl/Cmd + R for refresh

## Project Structure

```
Sin30/
├── index.html                         # Main dashboard (tabs view)
├── stronger-in-30-beginner.html      # Beginner level board
├── stronger-in-30-intermediate.html  # Intermediate level board
├── stronger-in-30-advanced.html      # Advanced level board
├── package.json                       # Project metadata
├── vercel.json                        # Vercel deployment config
└── README.md                          # This file
```

## Running Locally

1. Clone the repository
2. Open `index.html` in your browser
3. Navigate through tabs to view different difficulty levels

No build process or dependencies required!

## Deployment

### GitHub

```bash
git init
git add .
git commit -m "Initial commit: Stronger in 30 dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sin30.git
git push -u origin main
```

### Vercel

1. Connect your GitHub repo to Vercel
2. Vercel automatically detects and deploys static sites
3. Your dashboard is live at: `https://sin30-USERNAME.vercel.app`

Or deploy directly:
```bash
npm i -g vercel
vercel
```

## Tech Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom properties, grid, flexbox, animations
- **Vanilla JavaScript**: No frameworks, pure DOM manipulation
- **Google Sheets API**: Real-time data integration
- **OAuth 2.0**: Secure authentication

## Configuration

### Google Sheets Integration Setup

The dashboard can connect to Google Sheets for real-time check-in data:

1. **Set up Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google Sheets API

2. **Create OAuth Credentials:**
   - Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Add your domain to authorized origins

3. **Generate Refresh Token:**
   - Use [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Select "Google Sheets API v4"
   - Exchange authorization code for tokens

4. **Update Configuration in HTML files:**
   Edit the `GOOGLE_SHEETS_CONFIG` object in each HTML file:
   ```javascript
   const GOOGLE_SHEETS_CONFIG = {
     SPREADSHEET_ID: 'your_actual_spreadsheet_id', 
     SHEET_NAME: 'Checkins',
     CLIENT_ID: 'your_actual_client_id',
     CLIENT_SECRET: 'your_actual_client_secret', 
     REFRESH_TOKEN: 'your_actual_refresh_token'
   };
   ```

5. **Find the config in each file:**
   - Search for `GOOGLE_SHEETS_CONFIG` in stronger-in-30-advanced.html
   - Search for `GOOGLE_SHEETS_CONFIG` in stronger-in-30-intermediate.html  
   - Search for `GOOGLE_SHEETS_CONFIG` in stronger-in-30-beginner.html

### Manual Mode

If you don't need Google Sheets integration:
- The dashboard works fully without it
- Use the sticker picker to manually track progress
- All data is stored in browser localStorage

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)

## License

Built with ❤️ for Physique 57

## Support

For issues or questions, contact the development team.
