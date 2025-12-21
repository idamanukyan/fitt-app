#!/bin/bash

# HyperFit Start All Services Script
# Starts both backend and mobile development servers

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "========================================="
echo "  🚀 Starting HyperFit Application"
echo "========================================="
echo ""

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$SCRIPT_DIR/backend"
MOBILE_DIR="$SCRIPT_DIR/mobile"

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
    return $?
}

# Function to wait for service
wait_for_service() {
    local port=$1
    local name=$2
    local max_attempts=30
    local attempt=0

    echo -n "Waiting for $name to start..."
    while [ $attempt -lt $max_attempts ]; do
        if check_port $port; then
            echo -e " ${GREEN}✓${NC}"
            return 0
        fi
        sleep 1
        echo -n "."
        attempt=$((attempt + 1))
    done
    echo -e " ${YELLOW}⚠${NC}"
    return 1
}

# Stop any existing processes
echo -e "${BLUE}→${NC} Stopping existing processes..."
pkill -f "expo|metro|uvicorn" 2>/dev/null
sleep 2

# Start Backend
echo ""
echo -e "${BLUE}→${NC} Starting Backend API..."
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠${NC} Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/hyperfit-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "  Backend PID: ${GREEN}$BACKEND_PID${NC}"

# Wait for backend to start
wait_for_service 8000 "Backend API"

# Start Mobile Dev Server
echo ""
echo -e "${BLUE}→${NC} Starting Mobile Dev Server..."
cd "$MOBILE_DIR"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠${NC} Node modules not found. Please run: npm install"
    exit 1
fi

npx expo start --clear > /tmp/hyperfit-mobile.log 2>&1 &
MOBILE_PID=$!
echo -e "  Mobile PID: ${GREEN}$MOBILE_PID${NC}"

# Wait for mobile dev server to start
wait_for_service 8081 "Mobile Dev Server"

# Display status
echo ""
echo "========================================="
echo "  ✅ HyperFit Services Started!"
echo "========================================="
echo ""
echo -e "${GREEN}Backend API:${NC}      http://localhost:8000"
echo -e "${GREEN}API Docs:${NC}         http://localhost:8000/docs"
echo -e "${GREEN}Mobile Dev Server:${NC} http://localhost:8081"
echo ""
echo "📱 To open the app:"
echo "   iOS Simulator:    Press 'i' in mobile terminal"
echo "   Android Emulator: Press 'a' in mobile terminal"
echo "   Web:              Press 'w' in mobile terminal"
echo "   Expo Go:          Scan QR code from mobile terminal"
echo ""
echo "📋 Logs:"
echo "   Backend:  tail -f /tmp/hyperfit-backend.log"
echo "   Mobile:   tail -f /tmp/hyperfit-mobile.log"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'expo|metro|uvicorn'"
echo ""
echo "========================================="
echo ""

# Keep script running and show mobile logs
echo "Following mobile dev server output (Ctrl+C to exit):"
echo ""
tail -f /tmp/hyperfit-mobile.log
