import { PrismaClient } from '@/prisma/generated/prisma'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { checkDatabaseHealth, testDatabaseConnectionWithRetry } from './database-health-check'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  resilientPrisma: ResilientPrismaClient | undefined
}

export interface ResilientPrismaConfig {
  maxRetries?: number
  retryDelay?: number
  enableHealthCheck?: boolean
  healthCheckInterval?: number
  forceIPv4?: boolean
}

export class ResilientPrismaClient {
  private prisma: PrismaClient | null = null
  private pool: pg.Pool | null = null
  private healthCheckTimer: NodeJS.Timeout | null = null
  private isHealthy = true
  private config: Required<ResilientPrismaConfig>

  constructor(config: ResilientPrismaConfig = {}) {
    this.config = {
      maxRetries: 3,
      retryDelay: 2000,
      enableHealthCheck: true,
      healthCheckInterval: 60000,
      forceIPv4: true,
      ...config,
    }
  }

  async initialize(): Promise<void> {
    const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || ''

    if (!connectionString) {
      throw new Error('DATABASE_URL or DIRECT_URL environment variable is required')
    }

    console.log('[ResilientPrisma] Initializing database connection...')

    const finalConnectionString = this.config.forceIPv4
      ? this.forceIPv4ConnectionString(connectionString)
      : connectionString

    const poolConfig: pg.PoolConfig = {
      connectionString: finalConnectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    }

    this.pool = new pg.Pool(poolConfig)

    this.setupPoolEventHandlers()

    const adapter = new PrismaPg(this.pool)

    this.prisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

    if (this.config.enableHealthCheck) {
      await this.performInitialHealthCheck(connectionString)
      this.startHealthCheckMonitoring(connectionString)
    }

    console.log('[ResilientPrisma] Database connection initialized successfully')
  }

  private forceIPv4ConnectionString(connectionString: string): string {
    try {
      const url = new URL(connectionString)
      
      if (url.hostname.includes(':')) {
        console.log('[ResilientPrisma] IPv6 address detected, forcing IPv4...')
      }
      
      const separator = connectionString.includes('?') ? '&' : '?'
      return `${connectionString}${separator}family=4`
    } catch (error) {
      console.warn('[ResilientPrisma] Failed to parse connection string, using original')
      return connectionString
    }
  }

  private setupPoolEventHandlers(): void {
    if (!this.pool) return

    this.pool.on('error', (err) => {
      console.error('[ResilientPrisma] Pool error:', err)
      this.isHealthy = false
    })

    this.pool.on('connect', () => {
      if (!this.isHealthy) {
        console.log('[ResilientPrisma] Connection restored')
        this.isHealthy = true
      }
    })

    this.pool.on('remove', () => {
      console.log('[ResilientPrisma] Client removed from pool')
    })
  }

  private async performInitialHealthCheck(connectionString: string): Promise<void> {
    console.log('[ResilientPrisma] Performing initial health check...')
    
    const result = await testDatabaseConnectionWithRetry(
      connectionString,
      this.config.maxRetries,
      this.config.retryDelay
    )

    if (!result.healthy) {
      console.warn('[ResilientPrisma] Initial health check failed, but continuing...')
      console.warn('[ResilientPrisma] Error:', result.error)
    } else {
      console.log('[ResilientPrisma] Health check passed')
      console.log(`[ResilientPrisma] Connection type: ${result.connectionType}, Latency: ${result.latency}ms`)
    }
  }

  private startHealthCheckMonitoring(connectionString: string): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
    }

    this.healthCheckTimer = setInterval(async () => {
      const result = await checkDatabaseHealth(connectionString)
      
      if (!result.healthy && this.isHealthy) {
        console.warn('[ResilientPrisma] Health check failed:', result.error)
        this.isHealthy = false
      } else if (result.healthy && !this.isHealthy) {
        console.log('[ResilientPrisma] Connection recovered')
        this.isHealthy = true
      }
    }, this.config.healthCheckInterval)
  }

  getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('[ResilientPrisma] Client not initialized. Call initialize() first.')
    }
    return this.prisma
  }

  async disconnect(): Promise<void> {
    console.log('[ResilientPrisma] Disconnecting...')

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer)
      this.healthCheckTimer = null
    }

    if (this.prisma) {
      await this.prisma.$disconnect()
      this.prisma = null
    }

    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }

    console.log('[ResilientPrisma] Disconnected')
  }

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName = 'database operation'
  ): Promise<T> {
    let lastError: Error | undefined

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        if (!this.prisma) {
          throw new Error('Prisma client not initialized')
        }

        return await operation()
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        console.warn(
          `[ResilientPrisma] ${operationName} failed (attempt ${attempt}/${this.config.maxRetries}):`,
          lastError.message
        )

        if (attempt < this.config.maxRetries) {
          const delay = this.config.retryDelay * attempt
          console.log(`[ResilientPrisma] Retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    console.error(`[ResilientPrisma] ${operationName} failed after ${this.config.maxRetries} attempts`)
    throw lastError
  }

  isConnectionHealthy(): boolean {
    return this.isHealthy
  }
}

let resilientClient: ResilientPrismaClient | null = null

export async function getResilientPrisma(
  config?: ResilientPrismaConfig
): Promise<ResilientPrismaClient> {
  if (!resilientClient) {
    resilientClient = new ResilientPrismaClient(config)
    await resilientClient.initialize()
  }
  return resilientClient
}

export function getResilientPrismaSync(): ResilientPrismaClient {
  if (!resilientClient) {
    throw new Error('[ResilientPrisma] Client not initialized. Call getResilientPrisma() first.')
  }
  return resilientClient
}

export async function closeResilientPrisma(): Promise<void> {
  if (resilientClient) {
    await resilientClient.disconnect()
    resilientClient = null
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export * from '@/prisma/generated/prisma'
