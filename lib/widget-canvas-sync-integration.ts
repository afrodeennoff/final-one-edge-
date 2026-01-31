import { DashboardLayoutWithWidgets, Widget } from '@/store/user-store'
import { useWidgetSync } from '@/hooks/use-widget-sync'
import type { SaveTrigger } from '@/store/widget-sync-store'

export interface WidgetCanvasSyncOptions {
  onLayoutSaved?: (result: SyncResult) => void
  onSyncError?: (error: Error) => void
}

export type SyncResult = {
  success: boolean
  source: 'database' | 'local' | 'cache'
  status: string
  version?: number
  error?: string
  hadConflict?: boolean
}

export class WidgetCanvasSyncManager {
  private sync: ReturnType<typeof useWidgetSync>
  private currentLayout: DashboardLayoutWithWidgets | null = null
  private lastSyncedLayout: DashboardLayoutWithWidgets | null = null
  private pendingChanges = new Set<string>()

  constructor(
    private userId: string,
    private options: WidgetCanvasSyncOptions = {}
  ) {
    this.sync = {
      saveLayout: async (layout: DashboardLayoutWithWidgets, trigger: SaveTrigger) => {
        return this.internalSaveLayout(layout, trigger)
      },
      syncNow: async () => {
        return this.internalSyncNow()
      },
      executeOptimisticUpdate: async () => {
        throw new Error('Not implemented')
      },
      cancelPendingSave: () => {
        this.pendingChanges.clear()
      },
      hasPendingSave: () => this.pendingChanges.size > 0,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      syncStatus: 'idle',
      isLoading: false,
      userId: this.userId
    }
  }

  private async internalSaveLayout(
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger
  ): Promise<SyncResult> {
    try {
      const result = await this.saveToDatabase(layout, trigger)

      if (result.success) {
        this.lastSyncedLayout = { ...layout }
        this.pendingChanges.clear()
        this.options.onLayoutSaved?.(result)
      } else {
        this.options.onSyncError?.(new Error(result.error || 'Save failed'))
      }

      return result
    } catch (error) {
      const errorResult = {
        success: false,
        source: 'local' as const,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      this.options.onSyncError?.(error as Error)
      return errorResult
    }
  }

  private async internalSyncNow(): Promise<SyncResult> {
    if (!this.currentLayout) {
      return {
        success: false,
        source: 'local',
        status: 'error',
        error: 'No layout to sync'
      }
    }

    return this.internalSaveLayout(this.currentLayout, 'manual')
  }

  private async saveToDatabase(
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger
  ): Promise<SyncResult> {
    try {
      const { saveDashboardLayoutAction } = await import('@/server/database')

      const prismaLayout = {
        ...layout,
        desktop: layout.desktop as any,
        mobile: layout.mobile as any
      }

      const result = await saveDashboardLayoutAction(prismaLayout)

      if (result.success) {
        return {
          success: true,
          source: 'database',
          status: 'success'
        }
      }

      return {
        success: false,
        source: 'local',
        status: 'error',
        error: result.error
      }
    } catch (error) {
      return {
        success: false,
        source: 'local',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  setCurrentLayout(layout: DashboardLayoutWithWidgets): void {
    this.currentLayout = layout
  }

  onLayoutChange(
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger = 'drag'
  ): void {
    this.pendingChanges.add(trigger)
    this.currentLayout = layout

    this.debouncedSave(layout, trigger)
  }

  onWidgetAdded(layout: DashboardLayoutWithWidgets): void {
    this.onLayoutChange(layout, 'add')
  }

  onWidgetRemoved(layout: DashboardLayoutWithWidgets): void {
    this.onLayoutChange(layout, 'remove')
  }

  onWidgetResized(layout: DashboardLayoutWithWidgets): void {
    this.onLayoutChange(layout, 'resize')
  }

  private debounceTimer: NodeJS.Timeout | null = null

  private debouncedSave(layout: DashboardLayoutWithWidgets, trigger: SaveTrigger): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(() => {
      this.internalSaveLayout(layout, trigger)
    }, 2000)
  }

  async saveNow(): Promise<SyncResult> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = null
    }

    return this.internalSyncNow()
  }

  hasUnsavedChanges(): boolean {
    if (!this.currentLayout || !this.lastSyncedLayout) {
      return false
    }

    return JSON.stringify(this.currentLayout) !== JSON.stringify(this.lastSyncedLayout)
  }

  destroy(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }
    this.pendingChanges.clear()
  }
}

let syncManagerInstance: WidgetCanvasSyncManager | null = null

export function getWidgetCanvasSyncManager(
  userId: string,
  options?: WidgetCanvasSyncOptions
): WidgetCanvasSyncManager {
  if (!syncManagerInstance || syncManagerInstance['userId'] !== userId) {
    syncManagerInstance?.destroy()
    syncManagerInstance = new WidgetCanvasSyncManager(userId, options)
  }

  return syncManagerInstance
}

export function destroyWidgetCanvasSyncManager(): void {
  syncManagerInstance?.destroy()
  syncManagerInstance = null
}
