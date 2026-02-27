#!/bin/bash

# Stronger in 30 - Local Test Script
# Test the dashboard locally before deployment

echo "🧪 Testing Stronger in 30 Dashboard"
echo "=================================="

# Navigate to project directory
cd "$(dirname "$0")"

echo "🌐 Starting local server on port 8080..."
echo "📱 Open your browser to: http://localhost:8080"
echo ""
echo "✅ What to test:"
echo "   • All 3 tabs load properly (Beginner, Intermediate, Advanced)"
echo "   • HTML files display in full screen within iframes"
echo "   • Auto-refresh indicator appears every 5 minutes"  
echo "   • Manual refresh works with Cmd/Ctrl + R"
echo "   • Tab switching with Cmd/Ctrl + 1/2/3"
echo "   • Status bar shows 'Google Sheets not configured · Using manual mode'"
echo ""
echo "❌ To stop server: Press Ctrl+C"
echo ""

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 8080 is in use. Trying port 8081..."
    python3 -m http.server 8081
else
    python3 -m http.server 8080
fi