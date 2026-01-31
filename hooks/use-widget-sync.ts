"use client"

import { useCallback, useEffect, useRef } from 'react'
import { useUserStore } from '@/store/user-store'
import { useWidgetSyncStore } from '@/store/widget-sync-store'
import { widgetSyncManager } from '@/lib/widget-sync-manager'
import { optimisticWidgetManager, WidgetLayoutChange } from '@/lib/widget-optimistic-updates'
import { showSyncToast } from '@/components/sync-status-indicator'
import type { DashboardLayoutWithWidgets } from '@/store/user-store'
import type { SaveTrigger } from '@/store/widget-sync-store'

export interface UseWidgetSyncOptions {
  immediate?: boolean
  debounceMs?: number
  onSuccess?: (result: SyncResult) => void
  onError?: (error: Error) => void
}

export interface SyncResult {
  success: boolean
  source: 'database' | 'local' | 'cache'
  status: string
  version?: number
  error?: string
  hadConflict?: boolean
}

export function useWidgetSync(options: UseWidgetSyncOptions = {}) {
  const { user, dashboardLayout, setDashboardLayout } = useUserStore()
  const { isOnline, syncStatus, setOnlineStatus } = useWidgetSyncStore()
  const userId = user?.id
  const syncInProgress = useRef(false)

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true)
    const handleOffline = () => setOnlineStatus(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnlineStatus])

  const saveLayout = useCallback(async (
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger,
    saveOptions: UseWidgetSyncOptions = {}
  ): Promise<SyncResult> => {
    if (!userId) {
      console.warn('[useWidgetSync] No user ID, skipping save')
      return { success: false, source: 'local', status: 'error', error: 'No user ID' }
    }

    if (syncInProgress.current) {
      console.log('[useWidgetSync] Sync already in progress, queuing...')
      return { success: false, source: 'cache', status: 'syncing' }
    }

    syncInProgress.current = true

    try {
      const result = await widgetSyncManager.saveLayout(
        userId,
        layout,
        trigger,
        {
          immediate: options.immediate ?? saveOptions.immediate,
          debounceMs: options.debounceMs ?? saveOptions.debounceMs ?? 2000,
          changeType: 'auto'
        }
      )

      showSyncToast(result, trigger)

      if (result.success && options.onSuccess) {
        options.onSuccess(result)
      }

      if (!result.success && options.onError) {
        options.onError(new Error(result.error || 'Unknown error'))
      }

      return result
    } finally {
      syncInProgress.current = false
    }
  }, [userId, options, syncInProgress])

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!userId) {
      return { success: false, source: 'local', status: 'error', error: 'No user ID' }
    }

    try {
      const result = await widgetSyncManager.syncNow(userId)
      showSyncToast(result, 'manual')
      return result
    } catch (error) {
      const errorResult = {
        success: false,
        source: 'local' as const,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      showSyncToast(errorResult, 'manual')
      return errorResult
    }
  }, [userId])

  const executeOptimisticUpdate = useCallback(async <T,>(
    operation: () => Promise<T>,
    change: WidgetLayoutChange,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ): Promise<T> => {
    return optimisticWidgetManager.executeOptimisticUpdate(
      operation,
      change,
      {
        onSuccess,
        onError,
        successMessage: undefined,
        errorMessage: undefined
      }
    )
  }, [])

  const cancelPendingSave = useCallback(() => {
    if (userId) {
      widgetSyncManager.cancelPendingSave(userId)
    }
  }, [userId])

  const hasPendingSave = useCallback((): boolean => {
    return userId ? widgetSyncManager.hasPendingSave(userId) : false
  }, [userId])

  return {
    saveLayout,
    syncNow,
    executeOptimisticUpdate,
    cancelPendingSave,
    hasPendingSave,
    isOnline,
    syncStatus,
    isLoading: syncInProgress.current,
    userId
  }
}

export function useWidgetSyncAuto(layout: DashboardLayoutWithWidgets | null) {
  const { saveLayout, hasPendingSave, isOnline } = useWidgetSync()
  const lastSavedLayout = useRef<DashboardLayoutWithWidgets | null>(null)
  const saveTimeout = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!layout || !isOnline) return

    const layoutString = JSON.stringify(layout)
    const lastSavedString = lastSavedLayout.current ? JSON.stringify(lastSavedLayout.current) : ''

    if (layoutString === lastSavedString) return

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current)
    }

    saveTimeout.current = setTimeout(() => {
      saveLayout(layout, 'auto', { debounceMs: 2000 })
      lastSavedLayout.current = layout
    }, 2000)

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current)
      }
    }
  }, [layout, isOnline, saveLayout])

  return {
    hasPendingSave,
    isOnline
  }
}
