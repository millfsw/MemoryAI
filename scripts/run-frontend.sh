#!/bin/bash
# Run the frontend development server

echo "🚀 Starting MemoryAI frontend server..."

cd client-web-react

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    if command -v pnpm &> /dev/null; then
        pnpm install
    elif command -v npm &> /dev/null; then
        npm install
    else
        echo "Error: pnpm or npm is required"
        exit 1
    fi
fi

# Start development server
echo "Starting development server on http://localhost:5173"
npm run dev
