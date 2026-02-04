import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const forceIPv4ConnectionString = (connectionString: string): string => {
  if (!connectionString) return ''
  try {
    const url = new URL(connectionString)

    if (url.hostname.includes(':')) {
      return connectionString
    }

    const family = 4
    const separator = connectionString.includes('?') ? '&' : '?'
    return `${connectionString}${separator}family=${family}`
  } catch (error) {
    return connectionString
  }
}

const fixSSLCertificateIssue = (connectionString: string): string => {
  if (!connectionString) return ''
  try {
    const url = new URL(connectionString)
    const params = new URLSearchParams(url.search)

    params.set('sslmode', 'no-verify')
    
    url.search = params.toString()
    return url.toString()
  } catch (error) {
    return connectionString
  }
}

const connectionString = fixSSLCertificateIssue(
  forceIPv4ConnectionString(
    process.env.DIRECT_URL || process.env.DATABASE_URL || ''
  )
)

const poolConfig: pg.PoolConfig = {
  connectionString: connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  ssl: {
    rejectUnauthorized: false
  }
}

export const prisma = globalForPrisma.prisma ?? (() => {
  const pool = new pg.Pool(poolConfig)

  pool.on('error', (err) => {
    console.error('[Prisma] Unexpected error on idle client', err)
  })

  pool.on('connect', () => {
    console.log('[Prisma] New client connected to database')
  })

  const adapter = new PrismaPg(pool)

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
})()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 