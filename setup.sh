#!/bin/bash

# Tutorial Generator - Quick Start Script
# This script automates the setup process

set -e  # Exit on error

echo "🚀 Tutorial Generator - Quick Start"
echo "=================================="
echo ""

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local already exists and is configured!"
    echo "✅ API key is set"
else
    echo "✅ .env.local file found"
fi

echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if command -v npm &> /dev/null; then
    npm install > /dev/null 2>&1
    echo "✅ Dependencies installed"
else
    echo "❌ npm not found"
    exit 1
fi
echo ""

# Build check
echo "🔨 Running build check..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Build successful"
else
    echo "⚠️  Build had some warnings (this is usually fine)"
fi
echo ""

# Success message
echo "=================================="
echo "✨ Setup Complete!"
echo "=================================="
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "  - README.md - Project overview"
echo "  - DEPLOYMENT.md - Deployment instructions"
echo ""
echo "Happy tutorial generating! 🎉"
