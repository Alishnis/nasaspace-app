#!/bin/bash

# NASA TEMPO Air Quality Monitor - Development Startup Script

echo "🌍 Starting NASA TEMPO Air Quality Monitor..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your API keys and configuration"
fi

# Create logs directory
mkdir -p logs

# Start the application
echo "🚀 Starting the application..."
echo "📊 Health check: http://localhost:3001/health"
echo "🌐 Web interface: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the application"
echo ""

# Start with nodemon for development
npm run dev
