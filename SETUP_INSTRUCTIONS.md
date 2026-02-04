# Qunt Edge Production Setup Guide

Welcome to the Qunt Edge production setup guide. This document provides comprehensive instructions for setting up the trading analytics platform for production use.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [External Service Setup](#external-service-setup)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Authentication Setup](#authentication-setup)
7. [Payment Integration](#payment-integration)
8. [Deployment](#deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

## Overview

Qunt Edge is a professional trading analytics platform built with:
- Next.js 15 (App Router)
- Supabase (Authentication & Database)
- Whop (Payment Processing)
- Prisma ORM (Database)
- TypeScript
- Tailwind CSS

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm or bun package manager
- Git
- Access to a Supabase project
- Access to Whop account for payments
- API keys for external services (OpenAI, etc.)

## External Service Setup

### 1. Supabase Setup

1. **Create Supabase Account** (if needed)
   - Go to https://supabase.com
   - Sign up for a new account
   - Create a new project

2. **Get Supabase Credentials**
   - Project URL: Found in Project Settings > General Settings
   - Anon Key: Found in Project Settings > API
   - Service Role Key: Found in Project Settings > API

3. **Database Configuration**
   - The project uses PostgreSQL with transaction pooling
   - Connection strings are configured in environment variables

### 2. Whop Payment Setup

1. **Create Whop Account**
   - Go to https://dash.whop.com
   - Sign up for a new account
   - Create your company profile

2. **Get API Credentials**
   - In Whop Dashboard → Settings → Developer
   - Copy API Key and Client Secret
   - Note your Company ID

3. **Create Subscription Plans**
   - In Whop Dashboard → Products → Create Product
   - Create the following plans:
     - Monthly Plan
     - Quarterly Plan
     - Yearly Plan
     - Lifetime Plan
   - Note the Plan IDs for each plan

4. **Configure Webhook**
   - In Whop Dashboard → Webhooks → Create Webhook
   - Endpoint: `https://your-domain.com/api/whop/webhook`
   - Select all subscription and payment events
   - Copy the webhook secret

### 3. OAuth Provider Setup

#### Google OAuth

1. **Google Cloud Console**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable Google+ API
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```
   - Add authorized JavaScript origins:
     ```
     https://your-domain.com
     https://your-supabase-project.supabase.co
     ```

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add Client ID from Google Cloud Console

#### Discord OAuth

1. **Discord Developer Portal**
   - Go to https://discord.com/developers/applications
   - Create new application
   - Go to OAuth2 → General
   - Add redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Discord provider
   - Add Client ID and Secret from Discord

## Environment Configuration

### 1. Copy Environment Template

```bash
cp .env.production .env
```

### 2. Update Environment Variables

Edit the `.env` file with your specific values:

```env
# Application URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database Configuration
DATABASE_URL="postgresql://username:password@host:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://username:password@host:5432/postgres?sslmode=require"

# Whop Configuration
WHOP_API_KEY=your_whop_api_key
WHOP_CLIENT_SECRET=your_whop_client_secret
WHOP_WEBHOOK_SECRET=your_webhook_secret
WHOP_COMPANY_ID=your_company_id
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_xxxxx
# ... other plan IDs

# Security Keys
ENCRYPTION_KEY=your_32_character_encryption_key
CRON_SECRET=your_cron_secret
WIDGET_MESSAGE_BUS_SECRET=your_widget_message_bus_secret
```

### 3. Required Environment Variables

| Variable | Description | Source |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard |
| `DATABASE_URL` | Database connection (transaction pooler) | Supabase Dashboard |
| `DIRECT_URL` | Direct database connection | Supabase Dashboard |
| `WHOP_API_KEY` | Whop API key | Whop Dashboard |
| `WHOP_COMPANY_ID` | Whop company ID | Whop Dashboard |
| `ENCRYPTION_KEY` | 32-character encryption key | Manual creation |

## Database Setup

### 1. Install Dependencies

```bash
npm install
# or
bun install
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Push Database Schema

```bash
npx prisma db push
```

### 4. Run Migrations (Alternative)

```bash
npx prisma migrate dev --name init
```

## Authentication Setup

### 1. Supabase Authentication Configuration

1. **URL Configuration**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Set Site URL: `https://your-domain.com`
   - Add Redirect URLs:
     ```
     https://your-domain.com/*
     https://your-domain.com/api/auth/callback
     https://your-domain.com/dashboard
     ```

2. **OAuth Providers**
   - Enable Google and/or Discord providers as configured above
   - Ensure redirect URLs match between providers and Supabase

### 2. Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/authentication`
3. Test OAuth flows with Google and Discord

## Payment Integration

### 1. Whop Configuration

1. **Plan Mapping**
   - The application expects specific plan IDs in the environment
   - Ensure plan IDs in `.env` match those in Whop Dashboard
   - Plan lookup keys: `monthly`, `quarterly`, `yearly`, `lifetime`

2. **Webhook Configuration**
   - Webhook endpoint: `/api/whop/webhook`
   - Handles subscription and payment events
   - Requires webhook secret from Whop

### 2. Test Payment Flow

1. **Local Testing**
   - Use Whop test mode for development
   - Create test customers and plans

2. **Production Testing**
   - Test with real payment methods (small amounts)
   - Verify webhook delivery
   - Confirm subscription status updates

## Deployment

### 1. Build Application

```bash
npm run build
```

### 2. Environment-Specific Deployments

#### Vercel Deployment
1. Install Vercel CLI: `npm install -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`

#### Self-Hosting
1. Ensure all environment variables are set on the server
2. Run: `npm start`

### 3. Post-Deployment Steps

1. **Verify Environment Variables**
   - Check that all required variables are set in production
   - Verify that URLs point to correct domain

2. **Test Functionality**
   - Test authentication flows
   - Verify payment processing
   - Check database connectivity

## Testing

### 1. Local Testing Commands

```bash
# Run development server
npm run dev

# Run type checks
npm run typecheck

# Run linting
npm run lint

# Build application
npm run build
```

### 2. API Endpoint Testing

```bash
# Health check
curl https://your-domain.com/api/health/db

# Test webhook endpoint
curl -X POST https://your-domain.com/api/whop/webhook \
  -H "Content-Type: application/json" \
  -d '{"type":"test","id":"test_123"}'
```

### 3. OAuth Flow Testing

1. Visit `/authentication`
2. Test Google OAuth
3. Test Discord OAuth
4. Verify user creation in database

### 4. Payment Flow Testing

1. Visit pricing page
2. Initiate checkout
3. Complete test payment
4. Verify subscription status

## Troubleshooting

### Common Issues

#### Authentication Issues
- **Redirect loops**: Check redirect URIs in both Supabase and OAuth providers
- **Invalid credentials**: Verify client IDs/secrets match provider dashboards
- **User creation failures**: Check database connection and permissions

#### Payment Issues
- **Webhook not receiving**: Check URL in Whop dashboard, verify SSL certificate
- **Checkout failing**: Verify plan IDs match Whop dashboard
- **Subscription not updating**: Check webhook logs, verify event handling

#### Database Issues
- **Connection failures**: Verify database URLs and credentials
- **Migration errors**: Run `npx prisma migrate status` to check status
- **Permission errors**: Check Row Level Security (RLS) policies in Supabase

#### API Issues
- **Rate limiting**: Implement request queuing for external APIs
- **Timeouts**: Increase timeout values for long-running operations
- **Authentication failures**: Verify API keys and token expiration

### Debugging Tips

1. **Check Logs**
   - Application logs for error messages
   - Database logs for query issues
   - External service logs (Whop, Supabase)

2. **Environment Verification**
   - Double-check all environment variables
   - Ensure no typos in credentials
   - Verify URLs are correct

3. **Incremental Testing**
   - Test components individually
   - Start with authentication
   - Then test database connectivity
   - Finally test payment flows

### Support Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Whop Documentation](https://docs.whop.com)
- [Prisma Documentation](https://www.prisma.io/docs)

## Security Considerations

### API Key Security
- Rotate keys every 90 days
- Use least-privilege access
- Monitor usage patterns

### Webhook Security
- Verify signatures on all webhook requests
- Use HTTPS endpoints only
- Implement idempotency handling

### Database Security
- Use connection pooling
- Implement proper access controls
- Regular backup procedures

### Authentication Security
- Use secure session management
- Implement proper logout procedures
- Monitor for suspicious activity

## Maintenance

### Regular Tasks
- Monitor application logs
- Check external service status
- Update dependencies regularly
- Rotate API keys periodically

### Backup Strategy
- Database backups (handled by Supabase)
- Configuration backups
- Code version control

---

For additional support, please refer to the documentation files:
- `PRODUCTION_SETUP_GUIDE.md` - Detailed setup instructions
- `SERVICE_CONFIGURATION_ANALYSIS.md` - Service configuration details