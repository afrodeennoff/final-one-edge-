# Supabase Setup Guide for Qunt Edge

## Prerequisites
- Node.js 20+ installed
- Supabase account (free tier available)
- This project repository

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Project name**: qunt-edge
   - **Database password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
6. Click "Create Project" (takes 1-2 minutes)

## Step 2: Get Project Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon)
2. Click **API** in the left sidebar
3. Copy these values:
   - **Project URL** (SUPABASE_URL)
   - **anon public key** (SUPABASE_ANON_KEY)
   - **service_role secret** (SUPABASE_SERVICE_ROLE_KEY)

## Step 3: Configure Environment Variables

Create or update your `.env` file with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Database URL (Supabase will provide this)
DATABASE_URL=your_database_url_here

# Other required variables
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Step 4: Set up Database Schema

Run these commands to set up your database:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Link your project (optional, for local development)
supabase link --project-ref YOUR_PROJECT_ID

# Push the Prisma schema to Supabase
npx prisma generate
npx prisma db push
```

## Step 5: Configure Authentication

In your Supabase dashboard:

1. Go to **Authentication** → **Providers**
2. Enable these providers:
   - **Email** (should be enabled by default)
   - **Google** 
   - **Discord**

### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create credentials → OAuth 2.0 Client IDs
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-vercel-url.vercel.app/api/auth/callback`

### Discord OAuth Setup:
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create new application
3. Go to OAuth2 → General
4. Add redirect URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-vercel-url.vercel.app/api/auth/callback`

## Step 6: Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL**: `http://localhost:3000` (and your production URL)

**Additional Redirect URLs**:
```
http://localhost:3000/api/auth/callback
http://localhost:3000/authentication
https://your-production-url.vercel.app/api/auth/callback
https://your-production-url.vercel.app/authentication
```

## Step 7: Test the Setup

1. Start your development server:
```bash
npm run dev
```

2. Visit `http://localhost:3000/authentication`
3. Try signing up with email or OAuth providers

## Troubleshooting

**Common Issues:**

1. **"session_invalid" errors**: Check redirect URLs in Supabase dashboard
2. **Database connection errors**: Verify DATABASE_URL is correct
3. **OAuth not working**: Ensure redirect URLs match exactly
4. **CORS issues**: Check SITE_URL configuration

**Useful Commands:**
```bash
# Check Supabase status
supabase status

# Reset local database
supabase db reset

# View logs
supabase logs
```

## Production Deployment

When deploying to Vercel:
1. Add all environment variables to Vercel project settings
2. Update redirect URLs in Supabase to include your Vercel domain
3. Test authentication on production