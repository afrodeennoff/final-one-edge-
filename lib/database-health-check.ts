import pg from 'pg'

export interface DatabaseHealthCheckResult {
  healthy: boolean
  message: string
  latency?: number
  error?: string
  connectionType: 'ipv4' | 'ipv6' | 'unknown'
}

export async function checkDatabaseHealth(
  connectionString: string
): Promise<DatabaseHealthCheckResult> {
  const startTime = Date.now()

  const testConnection = async (family: 4 | 6): Promise<DatabaseHealthCheckResult> => {
    const client = new pg.Client({
      connectionString,
      connectionTimeoutMillis: 10000,
    })

    try {
      await client.connect()
      const latency = Date.now() - startTime

      await client.query('SELECT 1')
      await client.end()

      return {
        healthy: true,
        message: `Database connection successful via ${family === 4 ? 'IPv4' : 'IPv6'}`,
        latency,
        connectionType: family === 4 ? 'ipv4' : 'ipv6',
      }
    } catch (error) {
      await client.end().catch(() => { })

      return {
        healthy: false,
        message: `Failed to connect via ${family === 4 ? 'IPv4' : 'IPv6'}`,
        error: error instanceof Error ? error.message : 'Unknown error',
        connectionType: family === 4 ? 'ipv4' : 'ipv6',
      }
    }
  }

  console.log('[Database Health Check] Testing IPv4 connection...')
  const ipv4Result = await testConnection(4)

  if (ipv4Result.healthy) {
    console.log('[Database Health Check] IPv4 connection successful')
    return ipv4Result
  }

  console.log('[Database Health Check] IPv4 failed, testing IPv6...')
  const ipv6Result = await testConnection(6)

  if (ipv6Result.healthy) {
    console.log('[Database Health Check] IPv6 connection successful')
    return ipv6Result
  }

  console.error('[Database Health Check] Both IPv4 and IPv6 failed')

  return {
    healthy: false,
    message: 'Failed to connect to database via both IPv4 and IPv6',
    error: `IPv4: ${ipv4Result.error}, IPv6: ${ipv6Result.error}`,
    connectionType: 'unknown',
  }
}

export async function testDatabaseConnectionWithRetry(
  connectionString: string,
  maxRetries = 3,
  retryDelay = 2000
): Promise<DatabaseHealthCheckResult> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[Database] Connection attempt ${attempt}/${maxRetries}`)

    const result = await checkDatabaseHealth(connectionString)

    if (result.healthy) {
      console.log(`[Database] Connection successful on attempt ${attempt}`)
      return result
    }

    lastError = result.error ? new Error(result.error) : new Error('Unknown error')

    if (attempt < maxRetries) {
      console.log(`[Database] Waiting ${retryDelay}ms before retry...`)
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      retryDelay *= 2
    }
  }

  console.error('[Database] All connection attempts failed')

  return {
    healthy: false,
    message: `Failed to connect after ${maxRetries} attempts`,
    error: lastError?.message || 'Unknown error',
    connectionType: 'unknown',
  }
}

export function parseDatabaseUrl(connectionString: string): {
  host: string
  port: number
  database: string
  user: string
  isIpv6: boolean
} {
  try {
    const url = new URL(connectionString)

    return {
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.slice(1),
      user: url.username,
      isIpv6: url.hostname.includes(':'),
    }
  } catch (error) {
    throw new Error(`Invalid database connection string: ${error}`)
  }
}

export function getConnectionRecommendation(
  connectionString: string
): string[] {
  const recommendations: string[] = []
  const parsed = parseDatabaseUrl(connectionString)

  recommendations.push(`Database host: ${parsed.host}`)
  recommendations.push(`Database port: ${parsed.port}`)
  recommendations.push(`Connection type: ${parsed.isIpv6 ? 'IPv6 detected' : 'IPv4'}`)

  if (parsed.host.includes('.supabase.co')) {
    recommendations.push('⚠️  Supabase detected - ensure DIRECT_URL is set for pooler connections')
    recommendations.push('   Use: postgres://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres')
  }

  if (parsed.host.includes('localhost') || parsed.host === '127.0.0.1') {
    recommendations.push('ℹ️  Local database detected - ensure PostgreSQL is running')
  }

  if (!parsed.isIpv6) {
    recommendations.push('✓ IPv4 connection - this should work reliably')
    recommendations.push('   If you still see ENETUNREACH errors, the issue may be network connectivity')
  } else {
    recommendations.push('⚠️  IPv6 detected - this may cause ENETUNREACH errors')
    recommendations.push('   Recommendation: Use IPv4 hostname or add ?family=4 to connection string')
  }

  return recommendations
}
