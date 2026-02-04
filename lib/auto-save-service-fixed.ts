import { DashboardLayout } from '@/prisma/generated/prisma'
import { logger } from '@/lib/logger'

interface SaveRequest {
  layout: DashboardLayout
  timestamp: number
  retryCount: number
  priority: 'low' | 'normal' | 'high'
  checksum?: string
}

interface AutoSaveConfig {
  debounceMs: number
  maxRetries: number
  retryBaseDelay: number
  retryMaxDelay: number
  queueMaxSize: number
  enableOfflineSupport: boolean
}

interface AutoSaveEvents {
  onStart?: (request: SaveRequest) => void
  onSuccess?: (request: SaveRequest, duration: number) => void
  onError?: (request: SaveRequest, error: Error) => void
  onRetry?: (request: SaveRequest, attempt: number) => void
  onOffline?: () => void
  onOnline?: () => void
}

type SaveFunction = (layout: DashboardLayout) => Promise<{ success: boolean; error?: string }>

const DEFAULT_CONFIG: AutoSaveConfig = {
  debounceMs: 2000,
  maxRetries: 5,
  retryBaseDelay: 1000,
  retryMaxDelay: 30000,
  queueMaxSize: 10,
  enableOfflineSupport: true,
}

// Simple checksum generator for layout comparison
function generateChecksum(layout: DashboardLayout): string {
  const str = JSON.stringify(layout)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(36)
}

export class AutoSaveService {
  private config: AutoSaveConfig
  private saveFunction: SaveFunction
  private debounceTimer: ReturnType<typeof setTimeout> | null = null
  private currentRequest: SaveRequest | null = null
  private isSaving = false
  private isDisposed = false
  private eventHandlers: AutoSaveEvents = {}
  private saveHistory: Map<string, number> = new Map()
  private conflictDetected = false
  private maxHistorySize = 50 // Reduced from 100 to save memory
  
  constructor(
    saveFunction: SaveFunction,
    config: Partial<AutoSaveConfig> = {}
  ) {
    this.saveFunction = saveFunction
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.setupOfflineListeners()
    logger.info('[AutoSave] Service created', { config: this.config })
  }

  on<EventName extends keyof AutoSaveEvents>(
    event: EventName,
    handler: AutoSaveEvents[EventName]
  ): void {
    // Remove old handler if exists to prevent memory leaks
    if (this.eventHandlers[event]) {
      delete this.eventHandlers[event]
    }
    this.eventHandlers[event] = handler
    logger.debug('[AutoSave] Event handler registered', { event })
  }

  off<EventName extends keyof AutoSaveEvents>(event: EventName): void {
    delete this.eventHandlers[event]
    logger.debug('[AutoSave] Event handler removed', { event })
  }

  private emit<EventName extends keyof AutoSaveEvents>(
    event: EventName,
    ...args: Parameters<NonNullable<AutoSaveEvents[EventName]>>
  ): void {
    const handler = this.eventHandlers[event]
    if (handler && typeof handler === 'function') {
      try {
        (handler as any)(...args)
      } catch (error) {
        logger.error('[AutoSave] Event handler error', { event, error })
      }
    }
  }

  trigger(layout: DashboardLayout, priority: SaveRequest['priority'] = 'normal'): void {
    if (this.isDisposed) {
      logger.warn('[AutoSave] Service disposed, ignoring save request')
      return
    }

    const checksum = generateChecksum(layout)
    
    const request: SaveRequest = {
      layout,
      timestamp: Date.now(),
      retryCount: 0,
      priority,
      checksum,
    }

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    // Priority-based debounce timing
    const debounceTime = priority === 'high' ? 100 : 
                         priority === 'low' ? 5000 : 
                         this.config.debounceMs

    this.debounceTimer = setTimeout(() => {
      this.executeSave(request)
    }, debounceTime)

    logger.debug('[AutoSave] Save scheduled', {
      priority,
      debounceTime,
      timestamp: request.timestamp,
      checksum,
    })
  }

  async flush(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    if (this.currentRequest && !this.isSaving) {
      await this.executeSave(this.currentRequest)
    }
    
    logger.debug('[AutoSave] Flushed pending saves')
  }

  private async executeSave(request: SaveRequest): Promise<void> {
    if (this.isSaving) {
      logger.debug('[AutoSave] Save already in progress, queuing request')
      this.currentRequest = request
      return
    }

    if (!this.isOnline()) {
      logger.warn('[AutoSave] Offline, queuing save request')
      this.emit('onOffline')
      try {
        await OfflineQueueManager.getInstance().enqueue(request)
      } catch (error) {
        logger.error('[AutoSave] Failed to enqueue offline request', { error })
      }
      return
    }

    this.isSaving = true
    this.currentRequest = request
    const startTime = Date.now()

    this.emit('onStart', request)

    try {
      const result = await this.performSaveWithRetry(request)

      if (result.success) {
        const duration = Date.now() - startTime
        this.emit('onSuccess', request, duration)
        
        // Use checksum instead of full layout to save memory
        const key = request.checksum || generateChecksum(request.layout)
        this.saveHistory.set(key, Date.now())
        
        // Trim history periodically
        this.trimHistory()

        logger.info('[AutoSave] Layout saved successfully', {
          duration,
          priority: request.priority,
          retryCount: request.retryCount,
          checksum: key,
        })
      } else {
        throw new Error(result.error || 'Save failed')
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      this.emit('onError', request, err)
      logger.error('[AutoSave] Save failed', { error: err.message, request })
      
      // Enqueue for offline retry if enabled
      if (this.config.enableOfflineSupport && !this.isOnline()) {
        try {
          await OfflineQueueManager.getInstance().enqueue(request)
        } catch (queueError) {
          logger.error('[AutoSave] Failed to queue offline save', { error: queueError })
        }
      }
    } finally {
      this.isSaving = false
      this.currentRequest = null
    }
  }

  private trimHistory(): void {
    if (this.saveHistory.size <= this.maxHistorySize) return
    
    // Remove oldest entries
    const entries = Array.from(this.saveHistory.entries())
    entries.sort((a, b) => a[1] - b[1])
    
    const toRemove = entries.slice(0, entries.length - this.maxHistorySize)
    toRemove.forEach(([key]) => this.saveHistory.delete(key))
    
    logger.debug('[AutoSave] Trimmed save history', {
      removed: toRemove.length,
      remaining: this.saveHistory.size,
    })
  }

  private async performSaveWithRetry(request: SaveRequest): Promise<{ success: boolean; error?: string }> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        logger.debug('[AutoSave] Save attempt', {
          attempt: attempt + 1,
          maxAttempts: this.config.maxRetries + 1,
        })

        const result = await this.saveFunction(request.layout)

        if (result.success) {
          return result
        }

        lastError = new Error(result.error || 'Save failed without error message')

        if (attempt < this.config.maxRetries) {
          this.emit('onRetry', request, attempt + 1)
          const delay = this.calculateRetryDelay(attempt)
          logger.debug('[AutoSave] Retrying after delay', { delay, attempt: attempt + 1 })
          await this.sleep(delay)
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        
        if (attempt < this.config.maxRetries && this.shouldRetry(lastError)) {
          this.emit('onRetry', request, attempt + 1)
          const delay = this.calculateRetryDelay(attempt)
          logger.debug('[AutoSave] Retrying after error', {
            delay,
            attempt: attempt + 1,
            error: lastError.message,
          })
          await this.sleep(delay)
        } else {
          throw lastError
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Max retries exceeded',
    }
  }

  private calculateRetryDelay(attempt: number): number {
    const delay = Math.min(
      this.config.retryBaseDelay * Math.pow(2, attempt),
      this.config.retryMaxDelay
    )
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 500
  }

  private shouldRetry(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i,
      /connection/i,
      /ECONNRESET/i,
      /ETIMEDOUT/i,
      /5\d\d/, // Server errors
    ]

    return retryablePatterns.some(pattern => pattern.test(error.message))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private isOnline(): boolean {
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  }

  private setupOfflineListeners(): void {
    if (typeof window === 'undefined' || !this.config.enableOfflineSupport) {
      return
    }

    const handleOnline = () => {
      logger.info('[AutoSave] Connection restored')
      this.emit('onOnline')
      this.processOfflineQueue().catch(error => {
        logger.error('[AutoSave] Failed to process offline queue', { error })
      })
    }

    const handleOffline = () => {
      logger.warn('[AutoSave] Connection lost')
      this.emit('onOffline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Store cleanup function
    this.cleanup = () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      logger.debug('[AutoSave] Offline listeners cleaned up')
    }
  }

  private async processOfflineQueue(): Promise<void> {
    const queue = OfflineQueueManager.getInstance()
    const requests = await queue.getAll()

    if (requests.length === 0) return

    logger.info('[AutoSave] Processing offline queue', { count: requests.length })

    let processed = 0
    let failed = 0

    for (const request of requests) {
      if (!this.isOnline()) {
        logger.warn('[AutoSave] Connection lost during queue processing')
        break
      }

      try {
        await this.executeSave(request)
        await queue.dequeue(request.timestamp)
        processed++
      } catch (error) {
        logger.error('[AutoSave] Failed to process queued save', { error, request })
        failed++
        
        // Remove failed requests to prevent infinite retries
        await queue.dequeue(request.timestamp)
      }
    }

    logger.info('[AutoSave] Offline queue processing complete', {
      total: requests.length,
      processed,
      failed,
    })
  }

  hasPendingSave(): boolean {
    return this.currentRequest !== null || this.debounceTimer !== null
  }

  getSaveHistory(): Map<string, number> {
    return new Map(this.saveHistory)
  }

  cancelPendingSave(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
      logger.debug('[AutoSave] Pending save cancelled')
    }
  }

  cleanup: () => void = () => {}

  dispose(): void {
    if (this.isDisposed) {
      logger.warn('[AutoSave] Already disposed')
      return
    }

    logger.info('[AutoSave] Disposing service')
    
    this.cancelPendingSave()
    this.cleanup()
    
    // Clear all event handlers
    this.eventHandlers = {}
    
    // Clear history
    this.saveHistory.clear()
    
    this.isDisposed = true
    
    logger.info('[AutoSave] Service disposed')
  }
}

export class OfflineQueueManager {
  private static instance: OfflineQueueManager
  private queueKey = 'autosave-offline-queue'
  private isProcessing = false

  static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager()
    }
    return OfflineQueueManager.instance
  }

  async enqueue(request: SaveRequest): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const queue = await this.getQueue()
      
      // Check for duplicates and remove them
      const filteredQueue = queue.filter(r => r.checksum !== request.checksum)
      
      if (filteredQueue.length >= DEFAULT_CONFIG.queueMaxSize) {
        filteredQueue.shift()
        logger.warn('[AutoSave] Queue full, removed oldest request')
      }

      filteredQueue.push(request)
      await this.saveQueue(filteredQueue)

      logger.info('[AutoSave] Request enqueued', {
        queueSize: filteredQueue.length,
        priority: request.priority,
        checksum: request.checksum,
      })
    } catch (error) {
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        logger.error('[AutoSave] LocalStorage quota exceeded, clearing queue')
        await this.clear()
        throw new Error('Offline queue is full. Please clear browser data.')
      }
      logger.error('[AutoSave] Failed to enqueue request', { error })
      throw error
    }
  }

  async dequeue(timestamp: number): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      const queue = await this.getQueue()
      const filtered = queue.filter(r => r.timestamp !== timestamp)
      await this.saveQueue(filtered)
    } catch (error) {
      logger.error('[AutoSave] Failed to dequeue request', { error })
    }
  }

  async getAll(): Promise<SaveRequest[]> {
    if (typeof window === 'undefined') return []

    try {
      return await this.getQueue()
    } catch (error) {
      logger.error('[AutoSave] Failed to get queue', { error })
      return []
    }
  }

  async clear(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.queueKey)
      logger.info('[AutoSave] Offline queue cleared')
    } catch (error) {
      logger.error('[AutoSave] Failed to clear queue', { error })
    }
  }

  private async getQueue(): Promise<SaveRequest[]> {
    const data = localStorage.getItem(this.queueKey)
    if (!data) return []

    try {
      const parsed = JSON.parse(data)
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      logger.error('[AutoSave] Failed to parse queue', { error })
      return []
    }
  }

  private async saveQueue(queue: SaveRequest[]): Promise<void> {
    try {
      localStorage.setItem(this.queueKey, JSON.stringify(queue))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        // Try to clear and save again
        logger.warn('[AutoSave] Quota exceeded, attempting to clear old data')
        localStorage.removeItem(this.queueKey)
        localStorage.setItem(this.queueKey, JSON.stringify(queue))
      } else {
        throw error
      }
    }
  }
}

export function createAutoSaveService(
  saveFunction: SaveFunction,
  config?: Partial<AutoSaveConfig>
): AutoSaveService {
  return new AutoSaveService(saveFunction, config)
}
