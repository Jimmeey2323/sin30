# Deployment Guide

## GitHub Deployment

### Option 1: Using GitHub Web Interface + Git CLI

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `stronger-in-30` (or your preferred name)
   - Keep it public for Vercel access
   - Click "Create repository"

2. **Link and push from your local machine:**
   ```bash
   cd "/Users/jimmeeygondaa/Manual Library/Developer/Momence Login/Sin30"
   
   # Add GitHub remote (replace USERNAME with your GitHub username)
   git remote add origin https://github.com/USERNAME/stronger-in-30.git
   git branch -M main
   git push -u origin main
   ```

3. **Verify:**
   - Visit `https://github.com/USERNAME/stronger-in-30` to confirm files are uploaded

---

## Vercel Deployment

### Option 1: GitHub Integration (Recommended)

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Click "Sign Up" → "Continue with GitHub"
   - Authorize Vercel to access your GitHub account

2. **Deploy the project:**
   - Click "New Project"
   - Select your `stronger-in-30` repository
   - Framework Preset: Choose "Other"
   - Click "Deploy"

3. **Your dashboard is live!**
   - Vercel assigns a URL: `https://stronger-in-30.vercel.app`
   - Any push to `main` branch automatically redeploys

### Option 2: Direct Vercel CLI Deployment

```bash
# Install Vercel CLI globally
npm install -g vercel

# Navigate to project directory
cd "/Users/jimmeeygondaa/Manual Library/Developer/Momence Login/Sin30"

# Deploy to Vercel
vercel

# Follow prompts:
# - Link to existing project? (No for first deployment)
# - Project name: stronger-in-30
# - Deploy from current directory? (Yes)

# Your live URL will be displayed
```

---

## Manual Quick Start

If you want to test locally before deployment:

```bash
cd "/Users/jimmeeygondaa/Manual Library/Developer/Momence Login/Sin30"

# Start local server (macOS)
python3 -m http.server 8000

# Open browser: http://localhost:8000
```

---

## Dashboard Features

✅ **Tab Navigation**: Switch between Beginner, Intermediate, Advanced boards
✅ **Google Sheets Integration**: Real-time check-in sync
✅ **Interactive Stickers**: Click cells to add/remove sticker badges
✅ **Weekly Scoring**: Automatic completion tracking
✅ **Location Grouping**: Members organized by studio location
✅ **Responsive Design**: Works on all devices

---

## Post-Deployment

After going live:

1. Share your Vercel URL: `https://stronger-in-30.vercel.app`
2. Members can access the dashboard from any device
3. Push updates to GitHub → Vercel auto-deploys
4. Monitor performance via Vercel Dashboard

---

## Troubleshooting

**iframe not loading?**
- Ensure all three HTML files are in the same directory
- Check browser console for CORS errors

**Google Sheets not updating?**
- Verify OAuth tokens in the HTML files are current
- Check "Refresh" button in the dashboard

**Vercel build fails?**
- Static sites don't require build configuration
- Ensure vercel.json is properly formatted
- Check for any syntax errors in HTML files
