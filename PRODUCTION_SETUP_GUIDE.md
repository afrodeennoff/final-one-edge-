# Complete Production Setup Guide for Qunt Edge

## 1. Whop Payment Service Configuration

### Current State Analysis
- **API Key**: Configured via `process.env.WHOP_API_KEY` in `/lib/whop.ts`
- **Plan Configurations**: Defined in `PLAN_CONFIGS` object in `/server/payment-service.ts`
- **Webhook Handler**: Implemented in `/app/api/whop/webhook/route.ts` using Whop SDK verification
- **Checkout Flow**: Implemented in `/app/api/whop/checkout/route.ts`

### Plan Configuration Details
```typescript
export const PLAN_CONFIGS: Record<string, PlanConfig> = {
  monthly: {
    id: process.env.NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID || 'plan_55MGVOxft6Ipz',
    name: 'Monthly',
    lookupKey: 'monthly',
    amount: 2900, // cents
    currency: 'USD',
    interval: 'month',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support']
  },
  quarterly: {
    id: process.env.NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID || 'plan_LqkGRNIhM2A2z',
    name: 'Quarterly',
    lookupKey: 'quarterly',
    amount: 7500, // cents
    currency: 'USD',
    interval: 'quarter',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support', 'Save 15%']
  },
  yearly: {
    id: process.env.NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID || 'plan_JWhvqxtgDDqFf',
    name: 'Yearly',
    lookupKey: 'yearly',
    amount: 25000, // cents
    currency: 'USD',
    interval: 'year',
    features: ['Full platform access', 'Unlimited accounts', 'Priority support', 'Save 30%']
  },
  lifetime: {
    id: process.env.NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID || '',
    name: 'Lifetime',
    lookupKey: 'lifetime',
    amount: 49900, // cents
    currency: 'USD',
    interval: 'lifetime',
    features: ['Lifetime access', 'All future updates', 'Priority support', 'Exclusive features']
  }
}
```

### Required Environment Variables
```bash
# Whop API Credentials
WHOP_API_KEY=your_whop_api_key
WHOP_CLIENT_SECRET=your_whop_client_secret
WHOP_WEBHOOK_SECRET=your_webhook_secret
WHOP_COMPANY_ID=your_company_id

# Public Whop Config
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_PRODUCT_URL=https://whop.com/your-store/

# Plan IDs (from Whop Dashboard)
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_TEAM_PLAN_ID=plan_xxxxx
```

### Webhook Event Handling
The webhook service handles these events:
- `membership.activated` - Subscription activation
- `membership.deactivated` - Subscription cancellation
- `membership.updated` - Plan changes
- `membership.trialing` - Trial start
- `payment.succeeded` - Successful payments
- `payment.failed` - Failed payments (retry logic)
- `payment.refunded` - Full refunds
- `payment.partially_refunded` - Partial refunds
- `invoice.created` - Invoice generation
- `invoice.paid` - Invoice payment
- `invoice.payment_failed` - Invoice payment failure

### Setup Instructions

1. **Create Whop Account & Company**
   - Go to https://dash.whop.com
   - Create company and get `WHOP_COMPANY_ID`

2. **Configure API Credentials**
   - In Whop Dashboard → Settings → Developer
   - Copy API Key and Client Secret

3. **Create Subscription Plans**
   - In Whop Dashboard → Products
   - Create plans matching the lookup keys above
   - Copy each Plan ID to environment variables

4. **Configure Webhook**
   - In Whop Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/whop/webhook`
   - Select all payment/subscription events
   - Copy webhook secret

5. **Verification Steps**
   ```bash
   # Test webhook endpoint
   curl -X POST https://your-domain.com/api/whop/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"test","id":"test_123"}'
   
   # Test checkout creation
   curl -X POST https://your-domain.com/api/whop/checkout \
     -d "lookup_key=monthly"
   ```

## 2. Supabase Authentication Setup

### Current Implementation
- Supabase project already configured in `.env` file
- Uses Supabase Auth for user management
- Database connection via Prisma ORM

### Current Configuration in .env
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://rtfknzopyeigfwbbnwxf.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Zmtuem9weWVpZ2Z3YmJud3hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjQwNzksImV4cCI6MjA4NTcwMDA3OX0.GFgHeQnwp46gBsrYY6vt0quqycLek_Ytu36VbKXIseQ"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0Zmtuem9weWVpZ2Z3YmJud3hmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDEyNDA3OSwiZXhwIjoyMDg1NzAwMDc5fQ.xB6xQpTQizWhQM13nqBiSHQ16yRT72zV2T9p0j3hW0o"
```

### Database Configuration
```bash
# Database (Supabase PostgreSQL)
DATABASE_URL="postgres://postgres.rtfknzopyeigfwbbnwxf:A%40fr0deenn1%2F@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://postgres.rtfknzopyeigfwbbnwxf:A%40fr0deenn1%2F@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"
DATABASE_HOST="db.rtfknzopyeigfwbbnwxf.supabase.co"
```

### Supabase Setup Instructions

1. **Supabase Dashboard Login**
   - Go to https://supabase.com/dashboard
   - Login with your credentials
   - Select project: `rtfknzopyeigfwbbnwxf` (or create new project)

2. **Authentication Configuration**
   - Navigate to **Authentication > URL Configuration**
   - Set **Site URL**: `https://your-domain.com` (replace with your domain)
   - Add **Redirect URLs**:
     ```
     https://your-domain.com/*
     https://your-domain.com/api/auth/callback
     https://your-domain.com/dashboard
     https://your-domain.com/authentication
     ```

3. **Database Schema**
   - Schema is managed via Prisma migrations in `/prisma/`
   - Run initial setup:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **OAuth Providers Setup**

   **Google OAuth:**
   - Go to **Authentication > Providers**
   - Click on **Google** provider
   - Enable the provider
   - You'll need to configure Google Cloud Console first (see Google OAuth section below)

   **Discord OAuth:**
   - Go to **Authentication > Providers**
   - Click on **Discord** provider
   - Enable the provider
   - Add Client ID and Secret from Discord Developer Portal

5. **Database Policies (Security)**
   - Navigate to **Database > Policies**
   - Ensure proper Row Level Security (RLS) policies are enabled
   - Check that tables have appropriate access controls
   - Example policy for user-owned data:
   ```sql
   CREATE POLICY "Users can view own data" ON table_name
   FOR SELECT USING (auth.uid() = user_id);
   ```

6. **Storage Configuration (if needed)**
   - Navigate to **Storage > Buckets**
   - Create buckets for user uploads if required
   - Configure bucket policies for security

## 3. Discord OAuth Integration

### Current Implementation
- Configured in `/server/auth.ts` with `signInWithDiscord()` function
- Uses Supabase OAuth provider
- Redirect URI: `/api/auth/callback`

### Required Environment Variables
```bash
# Discord OAuth (configured in Supabase)
DISCORD_ID=your_discord_client_id
DISCORD_SECRET=your_discord_client_secret
REDIRECT_URL=https://your-domain.com/api/auth/callback
```

### Setup Instructions

1. **Discord Developer Portal**
   - Go to https://discord.com/developers/applications
   - Create new application: "Qunt Edge"
   - Go to OAuth2 → General
   - Add redirect URI: `https://rtfknzopyeigfwbbnwxf.supabase.co/auth/v1/callback`

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Discord provider
   - Add Client ID and Secret from Discord
   - Set redirect URI: `https://rtfknzopyeigfwbbnwxf.supabase.co/auth/v1/callback`

3. **Verification Steps**
   ```bash
   # Test OAuth flow
   # Visit: https://your-domain.com/authentication
   # Click "Sign in with Discord"
   # Should redirect to Discord OAuth and back
   ```

## 4. Google OAuth with Supabase

### Current Implementation
- Configured in `/server/auth.ts` with `signInWithGoogle()` function
- Uses Supabase OAuth provider with Google
- Redirect URI: `/api/auth/callback`

### Setup Instructions

1. **Google Cloud Console**
   - Go to https://console.cloud.google.com
   - Create new project or select existing
   - Enable Google+ API
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     ```
     https://rtfknzopyeigfwbbnwxf.supabase.co/auth/v1/callback
     ```
   - Add authorized JavaScript origins:
     ```
     https://your-domain.com
     https://rtfknzopyeigfwbbnwxf.supabase.co
     ```

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add Client ID from Google Cloud Console
   - No client secret needed for web applications

3. **Verification Steps**
   ```bash
   # Test OAuth flow
   # Visit: https://your-domain.com/authentication
   # Click "Sign in with Google"
   # Should redirect to Google OAuth and back
   ```

## 5. OpenAI Integration

### Current Implementation
- Configured in `/app/api/ai/transcribe/route.ts`
- Uses Z.AI API endpoint (custom provider)
- Implements audio transcription with Whisper model

### Current Code
```typescript
const openai = new OpenAI({
  baseURL: "https://api.z.ai/api/paas/v4", // Custom endpoint
  apiKey: process.env.OPENAI_API_KEY,
})
```

### Required Environment Variables
```bash
OPENAI_API_KEY=your_openai_api_key
```

### Setup Instructions

1. **Get API Key**
   - OpenAI: https://platform.openai.com/api-keys
   - Or Z.AI if using custom provider

2. **Rate Limiting Considerations**
   - Default Whisper model has rate limits
   - Consider implementing request queuing for high volume
   - Monitor usage in OpenAI dashboard

3. **Verification Steps**
   ```bash
   # Test transcription endpoint
   curl -X POST https://your-domain.com/api/ai/transcribe \
     -F "audio=@test-audio.mp3"
   ```

## 6. Environment Variables Management

### Complete .env File Template

```bash
# ==============================================================================
# QuntEdge - Professional Trading Analytics Platform
# Production Environment Variables Configuration
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. APPLICATION CORE
# ------------------------------------------------------------------------------
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# ------------------------------------------------------------------------------
# 2. DATABASE (Supabase PostgreSQL)
# ------------------------------------------------------------------------------
# Transaction pooler (Port 6543) - Use this for standard app queries
DATABASE_URL="postgresql://username:password@host:6543/postgres?sslmode=require&pgbouncer=true"
# Direct connection (Port 5432) - Required for Prisma schema changes/migrations
DIRECT_URL="postgresql://username:password@host:5432/postgres?sslmode=require"
DATABASE_HOST=your-db-host.supabase.co

# ------------------------------------------------------------------------------
# 3. SUPABASE (Authentication & Realtime)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ------------------------------------------------------------------------------
# 4. AUTHENTICATION & SECURITY
# ------------------------------------------------------------------------------
# Encryption key for sensitive data (must be a strong 32-character string)
ENCRYPTION_KEY=your_32_character_encryption_key_here_must_be_32_chars
# Secret for cron job verification
CRON_SECRET=your_cron_secret_here
# Secret for cross-widget communication security
WIDGET_MESSAGE_BUS_SECRET=your_widget_bus_secret_here

# Discord OAuth Configuration (Handled via Supabase mostly, but used for specific actions)
DISCORD_ID=your_discord_client_id
DISCORD_SECRET=your_discord_client_secret
REDIRECT_URL=https://your-domain.com/api/auth/callback

# Admin Access Control
# Comma-separated list of allowed admin user IDs or email domains
ADMIN_USER_ID=your_primary_admin_user_id
ALLOWED_ADMIN_USER_ID=your_primary_admin_user_id
ADMIN_EMAIL_DOMAINS=yourcompany.com

# ------------------------------------------------------------------------------
# 5. INTEGRATIONS - PAYMENTS (Whop)
# ------------------------------------------------------------------------------
# API credentials from Whop Dashboard
WHOP_API_KEY=your_whop_api_key
WHOP_CLIENT_SECRET=your_whop_client_secret
WHOP_WEBHOOK_SECRET=your_whop_webhook_secret
WHOP_COMPANY_ID=your_company_id

# Public Whop Config
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
NEXT_PUBLIC_WHOP_PRODUCT_URL=https://whop.com/your-store/

# Whop Subscription Plan IDs
NEXT_PUBLIC_WHOP_FREE_PLAN_ID=plan_free_id
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_monthly_id
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_6month_id
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_yearly_id
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=plan_lifetime_id
NEXT_PUBLIC_WHOP_TEAM_PLAN_ID=plan_team_id

# ------------------------------------------------------------------------------
# 6. INTEGRATIONS - BROKERS (Tradovate & Rithmic)
# ------------------------------------------------------------------------------
# Tradovate API Credentials
TRADOVATE_CLIENT_ID=your_tradovate_client_id
TRADOVATE_CLIENT_SECRET=your_tradovate_client_secret
TRADOVATE_REDIRECT_URI=https://your-domain.com/api/auth/callback/tradovate
TRADOVATE_DEBUG=false

# Rithmic Configuration
NEXT_PUBLIC_RITHMIC_API_URL=https://your-rithmic-service-url.com

# ------------------------------------------------------------------------------
# 7. INTEGRATIONS - MARKET DATA & AI
# ------------------------------------------------------------------------------
# Databento API Key for historical tick data
DATABENTO_API_KEY=your_databento_api_key

# OpenAI API Key for trading analysis and AI journaling
OPENAI_API_KEY=your_openai_api_key

# YouTube API Key for syncing update videos/transcripts
YOUTUBE_API_KEY=your_youtube_api_key

# ------------------------------------------------------------------------------
# 8. EMAIL SERVICE (Resend)
# ------------------------------------------------------------------------------
RESEND_API_KEY=your_resend_api_key
SUPPORT_EMAIL=support@your-domain.com
SUPPORT_TEAM_EMAIL=team@your-domain.com

# ------------------------------------------------------------------------------
# 9. UI & ONBOARDING (Tutorial Videos)
# ------------------------------------------------------------------------------
# IDs or URLs for tutorial videos shown in the app
NEXT_PUBLIC_ONBOARDING_VIDEO_ID=your_video_id
NEXT_PUBLIC_ONBOARDING_VIDEO_ID_EN=your_video_id_en
NEXT_PUBLIC_ONBOARDING_VIDEO_ID_FR=your_video_id_fr

# Feature-specific tutorials
NEXT_PUBLIC_RITHMIC_SYNC_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_RITHMIC_ORDER_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_RITHMIC_PERFORMANCE_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_TRADOVATE_SYNC_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_TRADEOVATE_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_NINJATRADER_PERFORMANCE_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_ATAS_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_QUANTOWER_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_PDF_IMPORT_TUTORIAL_VIDEO=url_here
NEXT_PUBLIC_THOR_SYNC_TUTORIAL_VIDEO=url_here

# ------------------------------------------------------------------------------
# 10. SOCIAL & REPO
# ------------------------------------------------------------------------------
NEXT_PUBLIC_DISCORD_INVITATION=https://discord.gg/your-invite
NEXT_PUBLIC_REPO_OWNER=hugodemenez
NEXT_PUBLIC_REPO_NAME=qunt-edge

# ------------------------------------------------------------------------------
# 11. LOGGING & DEBUGGING
# ------------------------------------------------------------------------------
# Choices: error, warn, info, debug
LOG_LEVEL=info
```

### Security Best Practices
1. Never commit `.env` files to version control
2. Use strong, random values for secrets (32+ characters)
3. Rotate API keys periodically
4. Use environment-specific configurations
5. Store secrets in secure vault for production

## 7. Testing Procedures

### Unit Tests
- Payment service tests exist in `vitest.payment.config.ts`
- Test coverage for webhook processing
- Test plan configuration mapping

### Integration Tests

1. **Payment Flow Testing**
   ```bash
   # Test checkout creation
   curl -X POST https://your-domain.com/api/whop/checkout \
     -d "lookup_key=monthly&referral=test123"
   
   # Test webhook simulation
   curl -X POST https://your-domain.com/api/whop/webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"membership.activated","id":"test_123","data":{}}'
   ```

2. **OAuth Flow Testing**
   ```bash
   # Manual testing required
   # 1. Visit authentication page
   # 2. Try Google OAuth
   # 3. Try Discord OAuth
   # 4. Verify user creation in database
   ```

3. **API Endpoint Validation**
   ```bash
   # Health check
   curl https://your-domain.com/api/health/db
   
   # Auth callback test
   curl https://your-domain.com/api/auth/callback
   ```

### Verification Checklist
- [ ] All environment variables configured
- [ ] Database connection working
- [ ] Supabase authentication configured
- [ ] Google OAuth working
- [ ] Discord OAuth working
- [ ] Whop payment plans created
- [ ] Webhook endpoint receiving events
- [ ] Checkout flow completing
- [ ] User records created properly
- [ ] Subscription status updating
- [ ] Payment transactions recorded

## 8. Troubleshooting Common Issues

### Payment Issues
- **Webhook not receiving**: Check URL in Whop dashboard, verify SSL certificate
- **Checkout failing**: Verify plan IDs match Whop dashboard
- **Subscription not updating**: Check webhook logs, verify event handling

### OAuth Issues
- **Redirect loops**: Check redirect URIs in both Supabase and provider dashboards
- **Invalid credentials**: Verify client IDs/secrets match provider dashboards
- **User creation failures**: Check database connection and permissions

### API Issues
- **Rate limiting**: Implement request queuing for OpenAI calls
- **Timeouts**: Increase timeout values for long-running operations
- **Authentication failures**: Verify API keys and token expiration

## 9. Security Considerations

1. **API Key Security**
   - Rotate keys every 90 days
   - Use least-privilege access
   - Monitor usage patterns

2. **Webhook Security**
   - Verify signatures on all webhook requests
   - Use HTTPS endpoints only
   - Implement idempotency handling

3. **Database Security**
   - Use connection pooling
   - Implement proper access controls
   - Regular backup procedures

4. **Authentication Security**
   - Use secure session management
   - Implement proper logout procedures
   - Monitor for suspicious activity

## 10. Deployment Instructions

1. **Prepare Environment**
   - Create complete `.env.production` file with all required variables
   - Verify all external service accounts are set up

2. **Database Setup**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Build Application**
   ```bash
   npm run build
   ```

4. **Start Application**
   ```bash
   npm start
   ```

5. **Monitor Logs**
   - Check application logs for errors
   - Verify all services are connecting properly
   - Test user registration and payment flows