#!/bin/bash

# VibeLab Quick Start Script (Linux/Mac)
# This script helps you set up VibeLab quickly

echo "🎵 VibeLab Setup Script"
echo "======================"
echo ""

# Check Node.js
echo "Checking Node.js installation..."
if command -v node &> /dev/null
then
    nodeVersion=$(node --version)
    echo "✓ Node.js $nodeVersion installed"
else
    echo "✗ Node.js is not installed. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
echo "Checking npm installation..."
if command -v npm &> /dev/null
then
    npmVersion=$(npm --version)
    echo "✓ npm $npmVersion installed"
else
    echo "✗ npm is not installed"
    exit 1
fi

echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✓ .env.local file found"
else
    echo "⚠ .env.local file not found"
    echo ""
    echo "Creating .env.local from example..."
    
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env.local"
        echo "✓ Created .env.local"
        echo ""
        echo "⚠ IMPORTANT: Please edit .env.local and add your Supabase credentials!"
        echo "   You can find these in your Supabase project Settings → API"
        echo ""
        
        read -p "Open .env.local now? (y/n) " edit
        if [ "$edit" = "y" ]; then
            ${EDITOR:-nano} .env.local
        fi
    else
        echo "✗ .env.example not found. Creating basic template..."
        cat > .env.local << EOF
# VibeLab Environment Variables
VITE_SUPABASE_URL=your-supabase-project-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
EOF
        echo "✓ Created .env.local template"
        echo ""
        echo "⚠ Please edit .env.local and add your Supabase credentials!"
        ${EDITOR:-nano} .env.local
    fi
fi

echo ""

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✓ Dependencies already installed"
else
    echo "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✓ Dependencies installed successfully"
    else
        echo "✗ Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "======================"
echo "Setup complete! 🎉"
echo ""
echo "Next steps:"
echo "1. Make sure .env.local has your Supabase credentials"
echo "2. Run migrations in Supabase (see SETUP.md)"
echo "3. Start dev server with: npm run dev"
echo ""

read -p "Start development server now? (y/n) " startDev
if [ "$startDev" = "y" ]; then
    echo ""
    echo "Starting VibeLab..."
    npm run dev
fi
