#!/bin/bash
# HyperFit Mobile App Startup Script

echo "📱 Starting HyperFit Mobile App..."
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found!"
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✓ node_modules found"
    # Clean install to remove old React Navigation packages
    echo "🧹 Cleaning up removed dependencies..."
    npm install
fi

echo ""
echo "✓ Dependencies ready"
echo "✓ Starting Expo development server..."
echo ""
echo "Options:"
echo "  - Press 'i' for iOS simulator"
echo "  - Press 'a' for Android emulator"
echo "  - Scan QR code with Expo Go app on your phone"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start Expo
npm start
