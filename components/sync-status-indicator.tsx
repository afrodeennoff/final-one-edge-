"use client"

import React, { useEffect } from 'react'
import { useWidgetSyncStore } from '@/store/widget-sync-store'
import { Button } from './ui/button'
import { 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { widgetSyncManager } from '@/lib/widget-sync-manager'

interface SyncStatusIndicatorProps {
  userId?: string
  className?: string
  showLabel?: boolean
}

export function SyncStatusIndicator({ 
  userId, 
  className,
  showLabel = false 
}: SyncStatusIndicatorProps) {
  const {
    syncStatus,
    isSyncing,
    isOnline,
    pendingChanges,
    lastError,
    lastSyncTime,
    retryCount,
    clearError
  } = useWidgetSyncStore()

  useEffect(() => {
    if (syncStatus === 'success') {
      toast.success('Changes saved', {
        id: 'sync-success',
        duration: 2000
      })
    }
  }, [syncStatus])

  useEffect(() => {
    if (lastError && syncStatus === 'error') {
      toast.error('Sync failed', {
        id: 'sync-error',
        description: lastError,
        action: retryCount < 3 ? {
          label: 'Retry',
          onClick: () => {
            if (userId) {
              clearError()
              widgetSyncManager.syncNow(userId)
            }
          }
        } : undefined
      })
    }
  }, [lastError, syncStatus, retryCount, userId, clearError])

  const handleSyncClick = async () => {
    if (!userId) return

    if (syncStatus === 'error') {
      clearError()
    }

    try {
      await widgetSyncManager.syncNow(userId)
    } catch (error) {
      console.error('[SyncStatusIndicator] Manual sync failed:', error)
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff className="h-4 w-4" />
    }

    if (isSyncing) {
      return <RefreshCw className="h-4 w-4 animate-spin" />
    }

    switch (syncStatus) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'conflict':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'offline':
        return <CloudOff className="h-4 w-4" />
      default:
        return <Cloud className="h-4 w-4" />
    }
  }

  const getStatusText = () => {
    if (!isOnline) {
      return 'Offline'
    }

    if (isSyncing) {
      return pendingChanges > 1 ? `Saving ${pendingChanges} changes...` : 'Saving...'
    }

    switch (syncStatus) {
      case 'success':
        return 'Saved'
      case 'error':
        return 'Sync failed'
      case 'conflict':
        return 'Conflict detected'
      case 'offline':
        return 'Offline'
      default:
        return pendingChanges > 0 ? `${pendingChanges} unsaved changes` : 'Synced'
    }
  }

  const getStatusColor = () => {
    if (!isOnline) {
      return 'text-muted-foreground'
    }

    if (isSyncing) {
      return 'text-blue-500'
    }

    switch (syncStatus) {
      case 'success':
        return 'text-green-500'
      case 'error':
        return 'text-red-500'
      case 'conflict':
        return 'text-yellow-500'
      default:
        return 'text-muted-foreground'
    }
  }

  const canSync = userId && (syncStatus === 'error' || syncStatus === 'offline' || !isSyncing)

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("flex items-center gap-1.5", getStatusColor())}>
        {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
        <div className={cn("flex items-center gap-1", getStatusColor())}>
          {getStatusIcon()}
          {showLabel && (
            <span className="text-sm font-medium">
              {getStatusText()}
            </span>
          )}
        </div>
      </div>

      {canSync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSyncClick}
          disabled={!isOnline || isSyncing}
          className="h-7 px-2"
        >
          <RefreshCw className={cn(
            "h-3 w-3",
            isSyncing && "animate-spin"
          )} />
        </Button>
      )}

      {pendingChanges > 0 && !isSyncing && (
        <span className="text-xs text-muted-foreground">
          ({pendingChanges} pending)
        </span>
      )}

      {lastSyncTime && !isSyncing && syncStatus === 'success' && (
        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(lastSyncTime)}
        </span>
      )}
    </div>
  )
}

function formatRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)

  if (seconds < 60) {
    return 'just now'
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    return `${hours}h ago`
  }

  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

interface SyncStatusToastProps {
  trigger?: 'drag' | 'add' | 'remove' | 'resize' | 'manual'
}

export function showSyncToast(result: { success: boolean; status: string; error?: string }, trigger?: SyncStatusToastProps['trigger']) {
  if (result.success) {
    const triggerText = trigger === 'drag' ? 'Position saved' : 
                       trigger === 'add' ? 'Widget added' : 
                       trigger === 'remove' ? 'Widget removed' : 
                       trigger === 'resize' ? 'Size changed' : 
                       'Changes saved'
    
    toast.success(triggerText, {
      id: 'sync-success',
      duration: 2000
    })
  } else if (result.status === 'offline') {
    toast.info('Saved locally', {
      description: 'Will sync when connection is restored',
      id: 'sync-offline'
    })
  } else {
    toast.error('Sync failed', {
      description: result.error,
      id: 'sync-error',
      action: {
        label: 'Retry',
        onClick: () => {
          window.location.reload()
        }
      }
    })
  }
}
