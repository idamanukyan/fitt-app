#!/bin/bash

# HyperFit Stop All Services Script
# Stops both backend and mobile development servers

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "========================================="
echo "  🛑 Stopping HyperFit Services"
echo "========================================="
echo ""

# Stop all processes
echo "Stopping all services..."
pkill -f "expo|metro|uvicorn" 2>/dev/null

# Wait a moment
sleep 2

# Check if services are stopped
if lsof -ti:8000 > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Backend still running on port 8000"
    lsof -ti:8000 | xargs kill -9 2>/dev/null
else
    echo -e "${GREEN}✓${NC} Backend stopped"
fi

if lsof -ti:8081 > /dev/null 2>&1; then
    echo -e "${RED}✗${NC} Mobile dev server still running on port 8081"
    lsof -ti:8081 | xargs kill -9 2>/dev/null
else
    echo -e "${GREEN}✓${NC} Mobile dev server stopped"
fi

echo ""
echo "========================================="
echo "  ✅ All services stopped!"
echo "========================================="
echo ""
