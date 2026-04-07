#!/bin/bash
# Run the backend server

echo "🚀 Starting MemoryAI backend server..."

cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -e .

# Initialize database
echo "Initializing database..."
python scripts/init_db.py

# Start server
echo "Starting server on http://localhost:8000"
python -m app.run
