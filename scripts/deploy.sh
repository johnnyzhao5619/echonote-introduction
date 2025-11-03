#!/bin/bash

# EchoNote Introduction Page Deployment Script
# This script builds and deploys the site to GitHub Pages

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if git is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes. Consider committing them first."
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled."
        exit 1
    fi
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci
fi

# Run quality checks
echo "🔍 Running quality checks..."
npm run type-check
npm run lint:check

# Build the project
echo "🏗️  Building project..."
npm run build:production

# Check if build was successful
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build failed or dist directory not found."
    exit 1
fi

echo "✅ Build completed successfully!"

# Display build info
echo "📊 Build information:"
echo "   - JavaScript files: $(find dist/js -name "*.js" 2>/dev/null | wc -l)"
echo "   - CSS files: $(find dist/css -name "*.css" 2>/dev/null | wc -l)"
echo "   - Image files: $(find dist/images -name "*" -type f 2>/dev/null | wc -l)"
echo "   - Total size: $(du -sh dist | cut -f1)"

# Check if we're on the main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "⚠️  Warning: You're not on the main branch (current: $CURRENT_BRANCH)"
    echo "   GitHub Pages deployment will only trigger from the main branch."
fi

echo "🎉 Deployment preparation complete!"
echo "   Push to main branch to trigger automatic deployment via GitHub Actions."
echo "   Or run 'npm run preview' to test the build locally."