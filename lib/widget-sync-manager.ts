import { DashboardLayoutWithWidgets } from '@/store/user-store'
import { widgetStorageService } from './widget-storage-service'
import { widgetConflictResolver } from './widget-conflict-resolution'
import { widgetVersionService } from './widget-version-service'
import { widgetValidator } from './widget-validator'
import { useWidgetSyncStore, SyncStatus, SaveTrigger } from '@/store/widget-sync-store'

export interface SyncOptions {
  immediate?: boolean
  debounceMs?: number
  description?: string
  changeType?: 'manual' | 'auto' | 'migration' | 'conflict_resolution'
}

export interface SyncResult {
  success: boolean
  source: 'database' | 'local' | 'cache'
  status: SyncStatus
  version?: number
  error?: string
  hadConflict?: boolean
  retryRecommended?: boolean
}

const DEFAULT_DEBOUNCE_MS = 2000
const MAX_RETRY_ATTEMPTS = 3
const BASE_RETRY_DELAY = 1000

class WidgetSyncManager {
  private debounceTimers = new Map<string, NodeJS.Timeout>()
  private pendingLayouts = new Map<string, DashboardLayoutWithWidgets>()
  private activeSyncs = new Set<string>()
  private retryAttempts = new Map<string, number>()

  async saveLayout(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    const syncStore = useWidgetSyncStore.getState()
    
    if (!this.activeSyncs.has(userId)) {
      syncStore.incrementPendingChanges()
      this.activeSyncs.add(userId)
    }

    this.pendingLayouts.set(userId, layout)
    syncStore.setUnsavedChanges(true)

    if (options.immediate) {
      return this.performSync(userId, layout, trigger, options)
    }

    const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE_MS

    return new Promise((resolve) => {
      const existingTimer = this.debounceTimers.get(userId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(async () => {
        const result = await this.performSync(userId, layout, trigger, options)
        resolve(result)
      }, debounceMs)

      this.debounceTimers.set(userId, timer)
    })
  }

  private async performSync(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger,
    options: SyncOptions
  ): Promise<SyncResult> {
    const syncStore = useWidgetSyncStore.getState()
    const currentRetryAttempt = this.retryAttempts.get(userId) ?? 0

    try {
      syncStore.setSyncing(true)
      syncStore.setSyncStatus('syncing')

      const validation = widgetValidator.validateLayout(layout.desktop)
      if (!validation.valid) {
        const error = `Validation failed: ${validation.errors.map(e => e.message).join(', ')}`
        syncStore.recordError(trigger, error)
        return {
          success: false,
          source: 'local',
          status: 'error',
          error,
          retryRecommended: false
        }
      }

      const conflictResult = await this.handleConflicts(userId, layout)
      if (conflictResult.hadConflict) {
        Object.assign(layout, conflictResult.mergedLayout)
      }

      const storageResult = await widgetStorageService.saveWithRetry(userId, layout)

      if (!storageResult.success) {
        throw new Error(storageResult.error || 'Save failed')
      }

      if (storageResult.source === 'database') {
        await this.createVersion(userId, layout, options)
        this.retryAttempts.delete(userId)
        syncStore.recordSuccess(trigger, layout.version)
      } else {
        syncStore.setSyncStatus('offline')
      }

      this.debounceTimers.delete(userId)
      this.pendingLayouts.delete(userId)
      this.activeSyncs.delete(userId)
      syncStore.decrementPendingChanges()

      return {
        success: true,
        source: storageResult.source,
        status: storageResult.source === 'database' ? 'success' : 'offline',
        version: layout.version,
        hadConflict: conflictResult.hadConflict
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      if (this.shouldRetry(errorMessage, currentRetryAttempt)) {
        syncStore.incrementRetryCount()
        this.retryAttempts.set(userId, currentRetryAttempt + 1)

        const delay = BASE_RETRY_DELAY * Math.pow(2, currentRetryAttempt)
        await new Promise(resolve => setTimeout(resolve, delay))

        return this.performSync(userId, layout, trigger, options)
      } else {
        syncStore.recordError(trigger, errorMessage)
        this.retryAttempts.delete(userId)
        this.activeSyncs.delete(userId)
        syncStore.decrementPendingChanges()

        return {
          success: false,
          source: 'local',
          status: 'error',
          error: errorMessage,
          retryRecommended: this.isRecoverableError(errorMessage)
        }
      }
    }
  }

  private async handleConflicts(
    userId: string,
    currentLayout: DashboardLayoutWithWidgets
  ): Promise<{ hadConflict: boolean; mergedLayout?: DashboardLayoutWithWidgets }> {
    try {
      const remoteLayout = await widgetStorageService.load(userId)
      if (!remoteLayout) {
        return { hadConflict: false }
      }

      const hasConflict = widgetConflictResolver.detectConflict(
        currentLayout,
        remoteLayout
      )

      if (hasConflict) {
        const resolution = widgetConflictResolver.suggestResolution(
          currentLayout,
          remoteLayout
        )

        const mergedLayout = widgetConflictResolver.resolveConflict(
          currentLayout,
          remoteLayout,
          resolution.strategy
        )

        useWidgetSyncStore.getState().setSyncStatus('conflict')

        return { hadConflict: true, mergedLayout }
      }

      return { hadConflict: false }
    } catch (error) {
      console.error('[WidgetSyncManager] Conflict detection failed:', error)
      return { hadConflict: false }
    }
  }

  private async createVersion(
    userId: string,
    layout: DashboardLayoutWithWidgets,
    options: SyncOptions
  ): Promise<void> {
    try {
      const checksum = widgetVersionService.generateChecksum(layout)
      const deviceId = widgetVersionService['getOrCreateDeviceId']()
      const changes = widgetVersionService.compareVersions(layout, layout)
      const description = options.description || widgetVersionService.generateDescription(changes)

      await widgetVersionService.saveVersionToDatabase(
        userId,
        {
          desktop: layout.desktop,
          mobile: layout.mobile,
          version: layout.version || 1,
          checksum,
          description,
          deviceId,
          changeType: options.changeType || 'auto'
        }
      )
    } catch (error) {
      console.warn('[WidgetSyncManager] Version creation failed (non-critical):', error)
    }
  }

  private shouldRetry(error: string, attempt: number): boolean {
    if (attempt >= MAX_RETRY_ATTEMPTS) return false

    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /ECONNREFUSED/i,
      /ETIMEDOUT/i,
      /5\d\d/,
      /temporarily/i
    ]

    return retryablePatterns.some(pattern => pattern.test(error))
  }

  private isRecoverableError(error: string): boolean {
    const recoverablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i
    ]

    return recoverablePatterns.some(pattern => pattern.test(error))
  }

  async syncNow(userId: string): Promise<SyncResult> {
    const syncStore = useWidgetSyncStore.getState()
    const pendingLayout = this.pendingLayouts.get(userId)

    if (!pendingLayout) {
      const result = await widgetStorageService.sync(userId)
      
      if (result.success) {
        syncStore.setSyncStatus('success')
      } else {
        syncStore.recordError('manual', result.error || 'Sync failed')
      }

      return {
        success: result.success,
        source: result.source,
        status: result.success ? 'success' as SyncStatus : 'error' as SyncStatus,
        error: result.error
      }
    }

    return this.performSync(userId, pendingLayout, 'manual', { immediate: true })
  }

  async loadLayout(userId: string): Promise<DashboardLayoutWithWidgets | null> {
    try {
      return await widgetStorageService.load(userId)
    } catch (error) {
      console.error('[WidgetSyncManager] Load failed:', error)
      return null
    }
  }

  cancelPendingSave(userId: string): void {
    const timer = this.debounceTimers.get(userId)
    if (timer) {
      clearTimeout(timer)
      this.debounceTimers.delete(userId)
    }

    this.pendingLayouts.delete(userId)
    this.activeSyncs.delete(userId)
    useWidgetSyncStore.getState().decrementPendingChanges()
  }

  hasPendingSave(userId: string): boolean {
    return this.pendingLayouts.has(userId) || this.activeSyncs.has(userId)
  }

  getPendingLayout(userId: string): DashboardLayoutWithWidgets | undefined {
    return this.pendingLayouts.get(userId)
  }

  clearAll(): void {
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    this.pendingLayouts.clear()
    this.activeSyncs.clear()
    this.retryAttempts.clear()
  }
}

export const widgetSyncManager = new WidgetSyncManager()
