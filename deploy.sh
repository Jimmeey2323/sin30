#!/bin/bash

# Stronger in 30 - Quick Deployment Script
# Run this script to deploy your dashboard to Vercel

echo "🚀 Stronger in 30 - Quick Deploy to Vercel"
echo "========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Setting up project..."

# Navigate to project directory
cd "$(dirname "$0")"

echo "🌐 Deploying to Vercel..."
echo "(You may be prompted to login to Vercel)"

# Deploy to Vercel
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📱 Your dashboard is now live!"
echo "🔗 Copy the deployment URL from above and share with your team"
echo ""
echo "💡 Tips:"
echo "   • Any push to GitHub will automatically redeploy"
echo "   • Configure Google Sheets integration in .env for real-time sync"
echo "   • Use keyboard shortcuts: Cmd/Ctrl + 1/2/3 for tabs"