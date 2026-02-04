#!/bin/bash

# Qunt Edge Production Setup Script

echo "==========================================="
echo "Qunt Edge Production Setup"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
else
    echo "✅ Node.js is installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
else
    echo "✅ npm is installed: $(npm --version)"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "✅ Copied .env.production to .env"
    else
        echo "❌ Neither .env nor .env.production found. Please create your .env file first."
        exit 1
    fi
else
    echo "✅ .env file exists"
fi

# Check if .env has required variables
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "DATABASE_URL"
    "DIRECT_URL"
)

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo "Please update your .env file with the required variables."
    exit 1
else
    echo "✅ All required environment variables are present"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Check if Prisma schema exists
if [ -f "prisma/schema.prisma" ]; then
    echo "💾 Checking database schema..."
    npx prisma db pull
    echo "✅ Database schema checked"
else
    echo "⚠️  Prisma schema not found. Skipping database check."
fi

# Run type check
echo "🔍 Running type check..."
npm run typecheck 2>/dev/null || echo "⚠️  Type check failed or not configured"

# Build the application
echo "🔨 Building application..."
npm run build

echo "==========================================="
echo "Setup Complete!"
echo "==========================================="
echo "To start the application, run: npm start"
echo ""
echo "Before deploying, ensure you have:"
echo "1. Configured all required environment variables"
echo "2. Set up Supabase authentication providers"
echo "3. Configured payment integration (Whop)"
echo "4. Tested OAuth flows locally"
echo ""
echo "For production deployment:"
echo "- Update NEXT_PUBLIC_APP_URL to your production domain"
echo "- Configure SSL certificates"
echo "- Set NODE_ENV=production"
echo "==========================================="