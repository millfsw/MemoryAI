#!/bin/bash
# Setup script for MemoryAI project

echo "🚀 Setting up MemoryAI project..."

# Check if Python 3.10+ is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.10 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f2)
if [ "$PYTHON_VERSION" -lt 10 ]; then
    echo "❌ Python 3.10 or higher is required."
    exit 1
fi

echo "✓ Python $(python3 --version) found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18 or higher."
    exit 1
fi

echo "✓ Node.js $(node --version) found"

# Setup backend
echo ""
echo "📦 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate || source venv/Scripts/activate

# Install dependencies
echo "Installing backend dependencies..."
pip install -e .

cd ..

# Setup frontend
echo ""
echo "📦 Setting up frontend..."
cd client-web-react

# Install dependencies
echo "Installing frontend dependencies..."
if command -v pnpm &> /dev/null; then
    pnpm install
elif command -v npm &> /dev/null; then
    npm install
else
    echo "❌ pnpm or npm is required for frontend installation."
    exit 1
fi

cd ..

# Create .env file from example if it doesn't exist
if [ ! -f ".env" ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update .env with your actual configuration (especially AI_API_KEY)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo "   1. Update .env with your AI API key"
echo "   2. Run 'docker-compose up' to start with Docker"
echo "   OR"
echo "   2. Run 'python -m backend.app.run' for backend"
echo "   3. Run 'cd client-web-react && npm run dev' for frontend"
echo ""
