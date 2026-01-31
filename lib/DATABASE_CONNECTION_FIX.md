# Database Connection Fix - ENETUNREACH Error

## Problem
The error `connect ENETUNREACH 2406:da1a:6b0:f617:b9c2:3e23:ef95:df14:5432 - Local (:::0)` occurs when your system attempts to connect to the database using IPv6, but the network path is unreachable.

## Solution Applied

### 1. Updated Prisma Configuration ([lib/prisma.ts](lib/prisma.ts))
- **Forced IPv4 connections** by adding `family=4` parameter to connection string
- **Increased connection timeout** from 10s to 15s for better reliability
- **Added enhanced logging** for development mode
- **Improved pool event handlers** for better error tracking

### 2. Created Database Health Check ([lib/database-health-check.ts](lib/database-health-check.ts))
- Tests both IPv4 and IPv6 connections
- Provides diagnostic information
- Includes connection retry logic
- Parses database URL for analysis

### 3. Created Resilient Prisma Client ([lib/resilient-prisma.ts](lib/resilient-prisma.ts))
- Automatic retry with exponential backoff
- Health check monitoring
- Connection failure recovery
- Graceful degradation handling

## Configuration Instructions

### Option 1: Use Direct URL with IPv4 (Recommended for Supabase)

For Supabase users, use the pooler connection with IPv4 forced:

```bash
# Format:
DIRECT_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?family=4"

# Example:
DIRECT_URL="postgres://postgres.abcxyz:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?family=4"
```

### Option 2: Force IPv4 in Current Connection String

Add `?family=4` to your existing `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?family=4"
```

### Option 3: Use Direct Pooler URL (Supabase)

For Supabase, the direct URL format is more reliable:

```bash
# Get this from your Supabase project settings -> Database -> Connection Pooling
DIRECT_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## Testing Your Connection

Use the health check utility to test your database connection:

```typescript
import { checkDatabaseHealth, getConnectionRecommendation } from '@/lib/database-health-check'

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

// Get connection recommendations
const recommendations = getConnectionRecommendation(connectionString)
console.log(recommendations)

// Test the connection
const result = await checkDatabaseHealth(connectionString)
console.log(result)
```

## Migration Steps

1. **Backup your current configuration**
   ```bash
   cp .env .env.backup
   ```

2. **Update your .env file with the correct DIRECT_URL**
   ```bash
   # For Supabase, get the pooler URL from your dashboard
   DIRECT_URL="postgres://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?family=4"
   ```

3. **Restart your development server**
   ```bash
   npm run dev
   ```

4. **Check the logs for successful connection**
   Look for: `[Prisma] New client connected to database`

## Troubleshooting

### Still getting ENETUNREACH errors?

1. **Check your network connection**
   ```bash
   ping -c 4 db.your-project.supabase.co
   ```

2. **Test with telnet**
   ```bash
   telnet db.your-project.supabase.co 5432
   ```

3. **Verify your connection string format**
   - Ensure no extra spaces
   - Verify password is URL-encoded if it contains special characters
   - Check that host, port, and database name are correct

4. **Try direct pooler URL** (Supabase only)
   - Go to Supabase Dashboard → Settings → Database
   - Find "Connection Pooling" section
   - Copy the "Transaction mode" URL
   - Add `?family=4` to force IPv4

### Alternative: Disable IPv6 System-wide (Not Recommended)

If you're still having issues, you can temporarily disable IPv6:

```bash
# Linux/Mac
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1

# Windows (as Administrator)
netsh interface ipv6 set state disabled
```

**Warning:** This may affect other applications and is not recommended.

## Additional Resources

- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)
- [Prisma Connection Pool](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#connection-pool)

## Monitoring

The system now includes:
- Automatic health checks every 60 seconds
- Connection retry logic (3 attempts with exponential backoff)
- Detailed error logging
- Connection recovery monitoring

Check your logs for these messages:
- `[Prisma] New client connected to database` - Successful connection
- `[Prisma] Unexpected error on idle client` - Connection issue detected
- `[Database Health Check] IPv4 connection successful` - Health check passed
