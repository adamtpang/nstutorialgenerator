#!/bin/bash

# Deploy to Vercel Script
# This script automates the deployment process to Vercel

set -e  # Exit on error

echo "🚀 Deploying Tutorial Generator to Vercel"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
    echo ""
fi

# Check if user is logged in
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

echo "✅ Authenticated"
echo ""

# Build check
echo "🔨 Running build check..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi
echo ""

# Deploy
echo "🚀 Deploying to Vercel..."
echo ""
echo "⚠️  IMPORTANT: Make sure you've set the ANTHROPIC_API_KEY"
echo "   environment variable in your Vercel project settings!"
echo ""
read -p "Press Enter to continue with deployment..."

vercel --prod

echo ""
echo "=================================="
echo "✨ Deployment Complete!"
echo "=================================="
echo ""
echo "📝 Next steps:"
echo "  1. Visit your Vercel dashboard"
echo "  2. Go to Project Settings → Environment Variables"
echo "  3. Add: ANTHROPIC_API_KEY = your_api_key"
echo "  4. Redeploy if this is your first deployment"
echo ""
echo "Your app is live! 🎉"
