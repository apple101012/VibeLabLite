# VibeLab Quick Start Script
# This script helps you set up VibeLab quickly

Write-Host "🎵 VibeLab Setup Script" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check npm
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✓ npm $npmVersion installed" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local file found" -ForegroundColor Green
} else {
    Write-Host "⚠ .env.local file not found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Creating .env.local from example..." -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env.local"
        Write-Host "✓ Created .env.local" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ IMPORTANT: Please edit .env.local and add your Supabase credentials!" -ForegroundColor Red
        Write-Host "   You can find these in your Supabase project Settings → API" -ForegroundColor Yellow
        Write-Host ""
        
        $edit = Read-Host "Open .env.local now? (y/n)"
        if ($edit -eq "y") {
            notepad .env.local
        }
    } else {
        Write-Host "✗ .env.example not found. Creating basic template..." -ForegroundColor Red
        $envContent = @"
# VibeLab Environment Variables
VITE_SUPABASE_URL=your-supabase-project-url-here
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
"@
        Set-Content ".env.local" $envContent
        Write-Host "✓ Created .env.local template" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠ Please edit .env.local and add your Supabase credentials!" -ForegroundColor Red
        notepad .env.local
    }
}

Write-Host ""

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "✓ Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "======================" -ForegroundColor Cyan
Write-Host "Setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure .env.local has your Supabase credentials" -ForegroundColor White
Write-Host "2. Run migrations in Supabase (see SETUP.md)" -ForegroundColor White
Write-Host "3. Start dev server with: npm run dev" -ForegroundColor White
Write-Host ""

$startDev = Read-Host "Start development server now? (y/n)"
if ($startDev -eq "y") {
    Write-Host ""
    Write-Host "Starting VibeLab..." -ForegroundColor Cyan
    npm run dev
}
