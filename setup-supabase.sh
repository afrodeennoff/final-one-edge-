#!/bin/bash

echo "🚀 Qunt Edge Supabase Setup Script"
echo "==================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please fill in your Supabase credentials."
else
    echo "✅ .env file already exists"
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
else
    echo "✅ Supabase CLI already installed"
fi

# Check if Prisma is installed
if ! command -v prisma &> /dev/null; then
    echo "Installing Prisma CLI..."
    npm install -g prisma
else
    echo "✅ Prisma CLI already installed"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Get your project credentials from Supabase Dashboard → Settings → API"
echo "3. Fill in your .env file with the credentials"
echo "4. Run: npx prisma generate && npx prisma db push"
echo "5. Start development: npm run dev"

echo ""
echo "📝 Required .env variables:"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY" 
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- DATABASE_URL"

echo ""
echo "📖 For detailed setup instructions, see SUPABASE_SETUP.md"