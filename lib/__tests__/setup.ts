import { beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { mockPrisma } from './mocks/prismaMock'

// Intercept module import to ensure tests use the mock when no DB is available
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma
}))

let prisma: PrismaClient
let pool: pg.Pool

beforeAll(async () => {
  const connectionString = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL

  if (connectionString) {
    try {
      // Try to connect to real DB if configured, with a short timeout
      const testPool = new pg.Pool({
        connectionString,
        max: 1,
        connectionTimeoutMillis: 2000
      })

      // Verify connection
      const client = await testPool.connect()
      client.release()

      pool = testPool
      const adapter = new PrismaPg(pool)
      prisma = new PrismaClient({ adapter })

        // Update global and module mock with real instance
        ; (global as any).prisma = prisma
        ; (global as any).pool = pool

      // Restore original implementation if possible, or update the mock return
      const realModule = await vi.importActual<typeof import('@/lib/prisma')>('@/lib/prisma')
      vi.mocked(await import('@/lib/prisma')).prisma = prisma as any

      console.log('Using REAL database for tests')
    } catch (e) {
      console.warn('Database connection failed or not reachable, falling back to IN-MEMORY MOCK.', e)
      prisma = mockPrisma as unknown as PrismaClient
    }
  } else {
    console.warn('DATABASE_URL not configured. Using IN-MEMORY MOCK.')
    prisma = mockPrisma as unknown as PrismaClient
  }
})

afterAll(async () => {
  // Only disconnect if it's a real client
  if (pool) await pool.end()
  if (prisma && prisma !== (mockPrisma as unknown as PrismaClient)) {
    await prisma.$disconnect()
  }
})

beforeEach(async () => {
  // If it's the mock, clear data
  if ((prisma as any) === mockPrisma || (prisma as any)?._clear || prisma === (mockPrisma as unknown as PrismaClient)) {
    if ((mockPrisma as any)._clear) (mockPrisma as any)._clear()
    // Manually clear known models if _clear isn't on the root
    Object.values(mockPrisma).forEach((val: any) => {
      if (val && typeof val._clear === 'function') val._clear()
    })
    return
  }

  const tables = [
    'PaymentTransaction',
    'Invoice',
    'Refund',
    'SubscriptionEvent',
    'PaymentMethod',
    'Promotion',
    'UsageMetric',
    'Subscription',
  ]

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE public."${table}" CASCADE;`)
    } catch (error) {
      // Check if connection is dead/mocked
      if (process.env.NODE_ENV === 'test' && !pool) {
        // ignore
      } else {
        console.warn(`Could not truncate table ${table}:`, error)
      }
    }
  }
})

export { prisma }
