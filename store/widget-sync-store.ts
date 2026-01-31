import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { DashboardLayoutWithWidgets } from './user-store'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline' | 'conflict'
export type SaveTrigger = 'drag' | 'add' | 'remove' | 'resize' | 'manual'

export interface SyncState {
  lastSyncTime: number | null
  isSyncing: boolean
  syncStatus: SyncStatus
  pendingChanges: number
  errorCount: number
  lastError: string | null
  retryCount: number
  isOnline: boolean
  unsavedChanges: boolean
}

export interface SyncEvent {
  id: string
  timestamp: number
  trigger: SaveTrigger
  status: SyncStatus
  success: boolean
  error?: string
  version?: number
}

export interface WidgetSyncStore extends SyncState {
  syncEvents: SyncEvent[]
  
  setSyncStatus: (status: SyncStatus) => void
  setSyncing: (isSyncing: boolean) => void
  setOnlineStatus: (isOnline: boolean) => void
  incrementPendingChanges: () => void
  decrementPendingChanges: () => void
  recordSuccess: (trigger: SaveTrigger, version?: number) => void
  recordError: (trigger: SaveTrigger, error: string) => void
  incrementRetryCount: () => void
  resetRetryCount: () => void
  clearError: () => void
  setUnsavedChanges: (hasChanges: boolean) => void
  addSyncEvent: (event: Omit<SyncEvent, 'id' | 'timestamp'>) => void
  clearSyncEvents: () => void
  reset: () => void
}

const MAX_SYNC_EVENTS = 50

export const useWidgetSyncStore = create<WidgetSyncStore>()(
  persist(
    (set, get) => ({
      lastSyncTime: null,
      isSyncing: false,
      syncStatus: 'idle',
      pendingChanges: 0,
      errorCount: 0,
      lastError: null,
      retryCount: 0,
      isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
      unsavedChanges: false,
      syncEvents: [],

      setSyncStatus: (status) => set({ syncStatus: status }),

      setSyncing: (isSyncing) => set({ isSyncing }),

      setOnlineStatus: (isOnline) => {
        set({ isOnline, syncStatus: isOnline ? 'idle' : 'offline' })
        if (isOnline && get().pendingChanges > 0) {
          set({ syncStatus: 'syncing' })
        }
      },

      incrementPendingChanges: () => 
        set((state) => ({ 
          pendingChanges: state.pendingChanges + 1,
          unsavedChanges: true 
        })),

      decrementPendingChanges: () =>
        set((state) => ({
          pendingChanges: Math.max(0, state.pendingChanges - 1),
          unsavedChanges: state.pendingChanges > 1
        })),

      recordSuccess: (trigger, version) => {
        const timestamp = Date.now()
        set((state) => {
          const newEvent: SyncEvent = {
            id: `sync_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp,
            trigger,
            status: 'success',
            success: true,
            version
          }

          const events = [newEvent, ...state.syncEvents].slice(0, MAX_SYNC_EVENTS)

          return {
            lastSyncTime: timestamp,
            syncStatus: 'idle',
            isSyncing: false,
            pendingChanges: 0,
            unsavedChanges: false,
            errorCount: 0,
            lastError: null,
            retryCount: 0,
            syncEvents: events
          }
        })
      },

      recordError: (trigger, error) => {
        const timestamp = Date.now()
        set((state) => ({
          syncStatus: 'error',
          lastError: error,
          errorCount: state.errorCount + 1,
          isSyncing: false,
          syncEvents: [
            {
              id: `sync_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp,
              trigger,
              status: 'error',
              success: false,
              error
            },
            ...state.syncEvents
          ].slice(0, MAX_SYNC_EVENTS)
        }))
      },

      incrementRetryCount: () =>
        set((state) => ({ retryCount: state.retryCount + 1 })),

      resetRetryCount: () => set({ retryCount: 0 }),

      clearError: () =>
        set({ lastError: null, syncStatus: 'idle' }),

      setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),

      addSyncEvent: (event) => {
        const newEvent: SyncEvent = {
          ...event,
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now()
        }

        set((state) => ({
          syncEvents: [newEvent, ...state.syncEvents].slice(0, MAX_SYNC_EVENTS)
        }))
      },

      clearSyncEvents: () => set({ syncEvents: [] }),

      reset: () => set({
        lastSyncTime: null,
        isSyncing: false,
        syncStatus: 'idle',
        pendingChanges: 0,
        errorCount: 0,
        lastError: null,
        retryCount: 0,
        unsavedChanges: false
      })
    }),
    {
      name: 'widget-sync-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lastSyncTime: state.lastSyncTime,
        errorCount: state.errorCount,
        syncEvents: state.syncEvents.slice(0, 10)
      })
    }
  )
)

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useWidgetSyncStore.getState().setOnlineStatus(true)
  })

  window.addEventListener('offline', () => {
    useWidgetSyncStore.getState().setOnlineStatus(false)
  })
}
