# Service Configuration Analysis & Setup Guide

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

## 2. Discord OAuth Integration

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
   - Create new application
   - Go to OAuth2 → General
   - Add redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Discord provider
   - Add Client ID and Secret from Discord
   - Set redirect URI: `https://your-supabase-project.supabase.co/auth/v1/callback`

3. **Verification Steps**
   ```bash
   # Test OAuth flow
   # Visit: https://your-domain.com/authentication
   # Click "Sign in with Discord"
   # Should redirect to Discord OAuth and back
   ```

## 3. OpenAI Integration

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
   - Add authorized redirect URIs:
     ```
     https://your-supabase-project.supabase.co/auth/v1/callback
     ```

2. **Supabase Configuration**
   - In Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add Client ID and Secret from Google Cloud
   - Set authorized client IDs

3. **Required Environment Variables**
   ```bash
   # Configured in Supabase, not needed in .env
   # But ensure Supabase auth settings are correct
   ```

4. **Verification Steps**
   ```bash
   # Test OAuth flow
   # Visit: https://your-domain.com/authentication
   # Click "Sign in with Google"
   # Should redirect to Google OAuth and back
   ```

## 5. Environment Variables Management

### Current State
- `.env.example` exists with template
- `.env` contains partial configuration
- Missing several critical credentials

### Required Environment Variables

```bash
# Application Core
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Database
DATABASE_URL=your_database_url
DIRECT_URL=your_direct_database_url
DATABASE_HOST=your_database_host

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Security
ENCRYPTION_KEY=32_character_encryption_key
CRON_SECRET=cron_secret_here
WIDGET_MESSAGE_BUS_SECRET=widget_bus_secret

# OAuth
DISCORD_ID=your_discord_client_id
DISCORD_SECRET=your_discord_client_secret
REDIRECT_URL=https://your-domain.com/api/auth/callback

# Payments
WHOP_API_KEY=your_whop_api_key
WHOP_CLIENT_SECRET=your_whop_client_secret
WHOP_WEBHOOK_SECRET=your_webhook_secret
WHOP_COMPANY_ID=your_company_id

NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_PRODUCT_URL=https://whop.com/your-store/
NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID=plan_xxxxx
NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID=plan_xxxxx

# AI Services
OPENAI_API_KEY=your_openai_api_key

# Email
RESEND_API_KEY=your_resend_api_key
SUPPORT_EMAIL=support@your-domain.com

# Admin (set after first user signup)
ADMIN_USER_ID=your_admin_user_id
ALLOWED_ADMIN_USER_ID=your_admin_user_id
```

### Security Best Practices
1. Never commit `.env` files to version control
2. Use strong, random values for secrets (32+ characters)
3. Rotate API keys periodically
4. Use environment-specific configurations
5. Store secrets in secure vault for production

## 6. Testing Procedures

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

## Troubleshooting Common Issues

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

## Security Considerations

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