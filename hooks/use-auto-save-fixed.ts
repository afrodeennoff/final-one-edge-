import { useEffect, useRef, useCallback, useMemo } from 'react'
import { DashboardLayout } from '@/prisma/generated/prisma'
import { createAutoSaveService, AutoSaveService } from '@/lib/auto-save-service'
import { logger } from '@/lib/logger'

type SaveFunction = (layout: DashboardLayout) => Promise<{ success: boolean; error?: string }>

interface UseAutoSaveOptions {
  saveFunction: SaveFunction
  enabled?: boolean
  debounceMs?: number
  maxRetries?: number
  onSaved?: (duration: number) => void
  onError?: (error: Error) => void
  onSaveStart?: () => void
}

// Simple deep equality check (faster than JSON.stringify for objects)
function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  if (obj1 == null || obj2 == null) return false
  if (typeof obj1 !== typeof obj2) return false

  if (typeof obj1 !== 'object') return false

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

export function useAutoSave({
  saveFunction,
  enabled = true,
  debounceMs = 2000,
  maxRetries = 5,
  onSaved,
  onError,
  onSaveStart,
}: UseAutoSaveOptions) {
  const serviceRef = useRef<AutoSaveService | null>(null)
  const lastLayoutRef = useRef<DashboardLayout | null>(null)
  const isInitializedRef = useRef(false)

  // Initialize service in useEffect to prevent race conditions
  useEffect(() => {
    if (!enabled) {
      return
    }

    if (!serviceRef.current) {
      logger.info('[useAutoSave] Initializing auto-save service')
      
      serviceRef.current = createAutoSaveService(saveFunction, {
        debounceMs,
        maxRetries,
        enableOfflineSupport: true,
      })

      // Setup event handlers
      serviceRef.current.on('onStart', () => {
        logger.debug('[useAutoSave] Save started')
        onSaveStart?.()
      })

      serviceRef.current.on('onSuccess', (_request, duration) => {
        logger.info('[useAutoSave] Save successful', { duration })
        onSaved?.(duration)
      })

      serviceRef.current.on('onError', (_request, error) => {
        logger.error('[useAutoSave] Save failed', { error: error.message })
        onError?.(error)
      })

      serviceRef.current.on('onOffline', () => {
        logger.warn('[useAutoSave] Offline detected')
      })

      serviceRef.current.on('onOnline', () => {
        logger.info('[useAutoSave] Online detected, processing queue')
      })

      isInitializedRef.current = true
    }

    // Cleanup on unmount or when disabled
    return () => {
      if (serviceRef.current) {
        logger.info('[useAutoSave] Cleaning up auto-save service')
        serviceRef.current.dispose()
        serviceRef.current = null
        isInitializedRef.current = false
        lastLayoutRef.current = null
      }
    }
  }, [enabled, saveFunction, debounceMs, maxRetries, onSaved, onError, onSaveStart])

  const triggerSave = useCallback(
    (layout: DashboardLayout, priority: 'low' | 'normal' | 'high' = 'normal') => {
      if (!enabled || !serviceRef.current) {
        logger.debug('[useAutoSave] Save skipped', { 
          enabled, 
          hasService: !!serviceRef.current 
        })
        return
      }

      // Use deep equality instead of JSON.stringify for better performance
      if (lastLayoutRef.current && deepEqual(layout, lastLayoutRef.current)) {
        logger.debug('[useAutoSave] Layout unchanged, skipping save')
        return
      }

      lastLayoutRef.current = layout
      
      // Trigger save with priority
      try {
        serviceRef.current.trigger(layout, priority)
        logger.debug('[useAutoSave] Save triggered', { priority })
      } catch (error) {
        logger.error('[useAutoSave] Failed to trigger save', { error })
      }
    },
    [enabled] // Dependencies managed via refs
  )

  const flushPending = useCallback(async () => {
    if (!enabled || !serviceRef.current) {
      logger.debug('[useAutoSave] Flush skipped (disabled or no service)')
      return
    }
    
    try {
      await serviceRef.current.flush()
      logger.debug('[useAutoSave] Flushed pending saves')
    } catch (error) {
      logger.error('[useAutoSave] Failed to flush', { error })
    }
  }, [enabled])

  const cancelPending = useCallback(() => {
    if (!enabled || !serviceRef.current) return
    
    try {
      serviceRef.current.cancelPendingSave()
      logger.debug('[useAutoSave] Cancelled pending save')
    } catch (error) {
      logger.error('[useAutoSave] Failed to cancel', { error })
    }
  }, [enabled])

  const hasPendingSave = useCallback(() => {
    if (!enabled || !serviceRef.current) return false
    return serviceRef.current.hasPendingSave()
  }, [enabled])

  const getSaveHistory = useCallback(() => {
    if (!enabled || !serviceRef.current) return new Map()
    return serviceRef.current.getSaveHistory()
  }, [enabled])

  // Memoize the return value to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    triggerSave,
    flushPending,
    cancelPending,
    hasPendingSave,
    getSaveHistory,
    isInitialized: isInitializedRef.current,
  }), [triggerSave, flushPending, cancelPending, hasPendingSave, getSaveHistory])

  return returnValue
}
