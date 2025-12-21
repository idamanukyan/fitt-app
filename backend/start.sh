#!/bin/bash
# HyperFit Backend Startup Script

echo "🚀 Starting HyperFit Backend..."
echo "================================"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
else
    echo "✓ Virtual environment found"
    source venv/bin/activate
fi

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "✓ Environment ready"
echo "✓ Starting FastAPI server on http://localhost:8000"
echo "✓ API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo "================================"
echo ""

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
