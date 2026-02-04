# Supabase Setup Checklist

## ✅ Prerequisites
- [ ] Node.js 20+ installed
- [ ] Supabase account created
- [ ] This repository cloned

## 🚀 Project Setup
- [ ] Create new Supabase project
- [ ] Copy project credentials (URL, anon key, service role key)
- [ ] Fill in `.env` file with credentials
- [ ] Run `npm install` to install dependencies

## 🗄️ Database Setup
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Run additional SQL from `supabase/seed.sql`
- [ ] Verify database tables exist

## 🔐 Authentication Setup
- [ ] Enable Email provider in Supabase Auth
- [ ] Enable Google OAuth provider
- [ ] Enable Discord OAuth provider
- [ ] Configure OAuth redirect URLs
- [ ] Set up Google OAuth credentials
- [ ] Set up Discord OAuth credentials

## 🌐 URL Configuration
- [ ] Set Site URL in Supabase Auth settings
- [ ] Add localhost redirect URLs
- [ ] Add production redirect URLs (when ready)

## 🧪 Testing
- [ ] Start development server: `npm run dev`
- [ ] Visit authentication page
- [ ] Test email signup/login
- [ ] Test Google OAuth
- [ ] Test Discord OAuth
- [ ] Verify dashboard access after login

## 🚀 Production Deployment
- [ ] Add environment variables to Vercel
- [ ] Update redirect URLs for production
- [ ] Test authentication on production
- [ ] Monitor for any issues

## 📋 Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🔧 Troubleshooting
- [ ] Check browser console for errors
- [ ] Check Supabase logs in dashboard
- [ ] Verify redirect URLs match exactly
- [ ] Ensure all environment variables are set
- [ ] Check database connection