import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: pg.Pool | undefined
}

const forceIPv4ConnectionString = (connectionString: string): string => {
  const url = new URL(connectionString)
  
  if (url.hostname.includes(':')) {
    return connectionString
  }
  
  return `${connectionString}${connectionString.includes('?') ? '&' : '?'}family=4`
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

const poolConfig: pg.PoolConfig = {
  connectionString: forceIPv4ConnectionString(connectionString),
  max: 20,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  maxLifetimeSeconds: 3600,
}

let pool: pg.Pool

if (process.env.NODE_ENV === 'production') {
  pool = new pg.Pool(poolConfig)
} else {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool(poolConfig)
  }
  pool = globalForPrisma.pool
}

pool.on('error', (err) => {
  console.error('[Prisma Pool] Unexpected error on idle client', err)
})

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ 
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'minimal',
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function disconnectPrisma() {
  await prisma.$disconnect()
  await pool.end()
}

process.on('beforeExit', async () => {
  await disconnectPrisma()
})
