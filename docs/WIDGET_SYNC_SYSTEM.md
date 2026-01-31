# Widget Auto-Save & Synchronization System

A comprehensive state persistence and synchronization system that combines Zustand with localStorage for instant local state persistence and Prisma with PostgreSQL for cross-device synchronization.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Widget Canvas                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  User Actions (Drag, Add, Remove, Resize)                │  │
│  └──────────────────────┬────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Widget Sync Manager                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  • Debouncing (2s default)                                │  │
│  │  • Conflict Detection & Resolution                        │  │
│  │  • Retry Logic (exponential backoff)                      │  │
│  │  • Optimistic Updates                                     │  │
│  └──────────────────────┬────────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          ▼                               ▼
┌──────────────────────┐      ┌──────────────────────────┐
│  localStorage        │      │  PostgreSQL Database     │
│  (Instant Persistence)│      │  (Cross-device Sync)     │
│  • Immediate Update  │      │  • Prisma ORM            │
│  • Offline Support   │      │  • Async Sync            │
└──────────────────────┘      └──────────────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          ▼
                ┌─────────────────────┐
                │  Sync Status Store  │
                │  • Status Tracking  │
                │  • User Feedback    │
                │  • Error Handling   │
                └─────────────────────┘
```

## Features

### ✅ Core Capabilities

- **Instant Local Persistence**: Changes save immediately to localStorage (no network delay)
- **Cross-Device Sync**: PostgreSQL database syncs layout across all user devices
- **Error Recovery**: If database save fails, localStorage keeps the last working state
- **Conflict Resolution**: Automatic merging of simultaneous changes from multiple devices
- **Optimistic Updates**: UI updates immediately, then syncs to backend
- **Retry Logic**: Exponential backoff for failed sync operations (max 3 retries)
- **Debouncing**: Prevents excessive database calls during rapid changes
- **User Feedback**: Clear sync status indicators and toast notifications
- **Offline Support**: Works offline, syncs when connection restored
- **Version History**: Tracks all layout changes with version numbers

## Installation & Setup

### 1. Files Created

```
store/
  widget-sync-store.ts          # Zustand store for sync state
lib/
  widget-sync-manager.ts        # Core sync orchestration
  widget-canvas-sync-integration.ts  # Canvas-specific integration
hooks/
  use-widget-sync.ts            # React hook for components
components/
  sync-status-indicator.tsx     # UI component for sync status
```

### 2. Import Dependencies

All dependencies are already installed in your project:

- `zustand` - State management
- `sonner` - Toast notifications
- `lucide-react` - Icons
- `date-fns` - Date utilities

## Usage

### Basic Widget Canvas Integration

```tsx
// app/[locale]/dashboard/components/widget-canvas.tsx
import { useWidgetSync } from '@/hooks/use-widget-sync'
import { getWidgetCanvasSyncManager } from '@/lib/widget-canvas-sync-integration'

export default function WidgetCanvas() {
  const { user, dashboardLayout, setDashboardLayout } = useUserStore()
  const { saveLayout, syncNow, isOnline } = useWidgetSync()

  // Handle layout changes (widget dragging)
  const handleLayoutChange = useCallback((layout: LayoutItem[]) => {
    if (!user?.id || !dashboardLayout) return

    const updatedLayout = {
      ...dashboardLayout,
      desktop: isMobile ? dashboardLayout.desktop : layout,
      mobile: isMobile ? layout : dashboardLayout.mobile,
      updatedAt: new Date()
    }

    setDashboardLayout(updatedLayout)
    
    // Auto-save with debouncing
    saveLayout(updatedLayout, 'drag', { debounceMs: 2000 })
  }, [user?.id, dashboardLayout, isMobile, saveLayout])

  // Handle widget addition
  const handleAddWidget = useCallback(async (widget: Widget) => {
    if (!dashboardLayout) return

    const newLayout = {
      ...dashboardLayout,
      desktop: [...dashboardLayout.desktop, widget],
      updatedAt: new Date()
    }

    setDashboardLayout(newLayout)
    
    // Immediate save
    await saveLayout(newLayout, 'add', { immediate: true })
  }, [dashboardLayout, saveLayout])

  // Handle widget removal
  const handleRemoveWidget = useCallback(async (widgetId: string) => {
    if (!dashboardLayout) return

    const newLayout = {
      ...dashboardLayout,
      desktop: dashboardLayout.desktop.filter(w => w.i !== widgetId),
      updatedAt: new Date()
    }

    setDashboardLayout(newLayout)
    
    // Immediate save
    await saveLayout(newLayout, 'remove', { immediate: true })
  }, [dashboardLayout, saveLayout])

  // Handle widget resize
  const handleWidgetResize = useCallback(async (widgetId: string, newSize: WidgetSize) => {
    if (!dashboardLayout) return

    const newLayout = {
      ...dashboardLayout,
      desktop: dashboardLayout.desktop.map(w => 
        w.i === widgetId ? { ...w, size: newSize } : w
      ),
      updatedAt: new Date()
    }

    setDashboardLayout(newLayout)
    
    // Immediate save
    await saveLayout(newLayout, 'resize', { immediate: true })
  }, [dashboardLayout, saveLayout])

  return (
    <>
      {/* Sync Status Indicator */}
      <SyncStatusIndicator userId={user?.id} showLabel />

      {/* Your Widget Canvas */}
      <ResponsiveGridLayout
        onLayoutChange={handleLayoutChange}
        {/* ... */}
      />
    </>
  )
}
```

### Adding Sync Status to Navbar

```tsx
// components/navbar.tsx
import { SyncStatusIndicator } from '@/components/sync-status-indicator'

export function Navbar() {
  const { user } = useUserStore()

  return (
    <nav className="flex items-center justify-between">
      {/* Logo, etc. */}
      
      <SyncStatusIndicator 
        userId={user?.id} 
        showLabel={true}
        className="mr-4"
      />
    </nav>
  )
}
```

### Manual Sync Trigger

```tsx
import { useWidgetSync } from '@/hooks/use-widget-sync'

function Settings() {
  const { syncNow } = useWidgetSync()
  const [isSyncing, setIsSyncing] = useState(false)

  const handleManualSync = async () => {
    setIsSyncing(true)
    await syncNow()
    setIsSyncing(false)
  }

  return (
    <Button onClick={handleManualSync} disabled={isSyncing}>
      {isSyncing ? 'Syncing...' : 'Sync Now'}
    </Button>
  )
}
```

## API Reference

### `useWidgetSync()`

Main React hook for widget synchronization.

**Returns:**
```typescript
{
  saveLayout: (
    layout: DashboardLayoutWithWidgets,
    trigger: SaveTrigger,
    options?: UseWidgetSyncOptions
  ) => Promise<SyncResult>
  
  syncNow: () => Promise<SyncResult>
  
  executeOptimisticUpdate: <T>(
    operation: () => Promise<T>,
    change: WidgetLayoutChange,
    onSuccess?: (result: T) => void,
    onError?: (error: Error) => void
  ) => Promise<T>
  
  cancelPendingSave: () => void
  hasPendingSave: () => boolean
  
  isOnline: boolean
  syncStatus: SyncStatus
  isLoading: boolean
  userId: string | undefined
}
```

**Triggers:**
- `'drag'` - Widget position changed
- `'add'` - Widget added
- `'remove'` - Widget removed
- `'resize'` - Widget size changed
- `'manual'` - Manual sync

**SyncStatus:**
- `'idle'` - No sync activity
- `'syncing'` - Sync in progress
- `'success'` - Last sync successful
- `'error'` - Last sync failed
- `'offline'` - Device offline
- `'conflict'` - Conflict detected

### `SyncStatusIndicator`

Component to display sync status to users.

**Props:**
```typescript
{
  userId?: string
  className?: string
  showLabel?: boolean
}
```

### `widgetSyncManager`

Low-level sync manager for advanced use cases.

**Methods:**
```typescript
// Save layout with auto-sync
widgetSyncManager.saveLayout(
  userId: string,
  layout: DashboardLayoutWithWidgets,
  trigger: SaveTrigger,
  options?: SyncOptions
): Promise<SyncResult>

// Force immediate sync
widgetSyncManager.syncNow(userId: string): Promise<SyncResult>

// Load layout from storage
widgetSyncManager.loadLayout(userId: string): Promise<DashboardLayoutWithWidgets | null>

// Cancel pending save
widgetSyncManager.cancelPendingSave(userId: string): void

// Check for pending saves
widgetSyncManager.hasPendingSave(userId: string): boolean
```

## Configuration

### Debounce Settings

```typescript
const { saveLayout } = useWidgetSync({
  debounceMs: 3000,  // Default: 2000ms
  immediate: false   // Skip debouncing
})

// Or per-call
await saveLayout(layout, 'drag', { debounceMs: 1000 })
```

### Retry Configuration

Edit `lib/widget-sync-manager.ts`:

```typescript
const DEFAULT_DEBOUNCE_MS = 2000
const MAX_RETRY_ATTEMPTS = 3
const BASE_RETRY_DELAY = 1000
```

## Sync States & Flow

### Normal Flow

```
User Action → Optimistic UI Update → Debounce (2s) → 
  Save to localStorage (instant) → Save to PostgreSQL (async) → 
  Update Sync Status → Show Success Toast
```

### Offline Flow

```
User Action → Optimistic UI Update → Debounce (2s) → 
  Save to localStorage (instant) → Show Offline Indicator →
  [Connection Restored] → Auto-sync to PostgreSQL
```

### Error Flow

```
User Action → Optimistic UI Update → Debounce (2s) → 
  Save to localStorage (instant) → Save to PostgreSQL (async) →
  [Network Error] → Retry (1s delay) → Retry (2s delay) → 
  Retry (4s delay) → Show Error Toast with Retry Button
```

### Conflict Resolution

```
[Multiple Devices Editing] → Detect Conflict → 
  Analyze Changes → Auto-Merge → 
  Show Conflict Resolved Toast → Save Merged Layout
```

## Conflict Resolution Strategies

The system uses three strategies:

1. **Local**: Keep current device's changes
2. **Remote**: Accept remote device's changes
3. **Merge**: Combine both changes intelligently (default)

**Merge Logic:**
- Compares widget timestamps
- Keeps most recent version of each widget
- Adds new widgets from both devices
- Removes widgets deleted on either device
- Updates `updatedAt` to latest timestamp

## Performance Optimizations

### Debouncing

Prevents excessive database saves during rapid changes:

```typescript
// Rapid widget drags (10 changes in 5 seconds)
// Without debouncing: 10 database saves ❌
// With debouncing: 1 database save ✅
```

### Optimistic Updates

UI updates immediately, no waiting for network:

```typescript
// User drags widget
1. Update localStorage instantly (0ms)
2. Update UI instantly (0ms)
3. Save to PostgreSQL in background (async)
```

### Retry Logic

Exponential backoff prevents overwhelming the server:

```
Attempt 1: Immediate
Attempt 2: 1 second delay
Attempt 3: 2 second delay
Attempt 4: 4 second delay
```

## Error Handling

### Recoverable Errors (Auto-Retry)

- Network timeouts
- Connection refused
- 5xx server errors
- Temporary failures

### Non-Recoverable Errors (Show Error)

- Authentication errors
- Invalid data
- 4xx client errors

### User Feedback

```typescript
// Success
toast.success('Changes saved')

// Offline
toast.info('Saved locally. Will sync when connection is restored.')

// Error
toast.error('Sync failed', {
  description: 'Network error',
  action: { label: 'Retry', onClick: () => syncNow() }
})
```

## Testing

### Manual Testing Checklist

- [ ] Drag widget → verify auto-save after 2s
- [ ] Add widget → verify immediate save
- [ ] Remove widget → verify immediate save
- [ ] Resize widget → verify immediate save
- [ ] Go offline → verify offline indicator
- [ ] Make changes offline → verify local save
- [ ] Go online → verify auto-sync
- [ ] Simultaneous edits on 2 devices → verify conflict resolution
- [ ] Check retry logic with network errors
- [ ] Verify localStorage persistence after page refresh

### Testing with DevTools

```typescript
// In browser console
import { useWidgetSyncStore } from '@/store/widget-sync-store'

// Check sync state
const store = useWidgetSyncStore.getState()
console.log({
  isSyncing: store.isSyncing,
  syncStatus: store.syncStatus,
  pendingChanges: store.pendingChanges,
  lastError: store.lastError
})

// Manually trigger sync
import { widgetSyncManager } from '@/lib/widget-sync-manager'
widgetSyncManager.syncNow('user-id-here')
```

## Troubleshooting

### Changes Not Saving

1. Check if user is authenticated: `user?.id` exists
2. Check browser console for errors
3. Verify localStorage is not full
4. Check network connection

### Sync Errors

1. Check server logs for database errors
2. Verify Prisma connection
3. Check PostgreSQL is running
4. Verify user permissions

### Conflicts Not Resolving

1. Check device IDs in localStorage
2. Verify version numbers increment
3. Check conflict detection logic
4. Review merge strategy

## Best Practices

### DO ✅

- Use debouncing for drag operations
- Use immediate save for add/remove/resize
- Show sync status in UI
- Handle offline scenarios
- Provide retry options
- Log sync events for debugging

### DON'T ❌

- Block UI on sync operations
- Ignore sync errors
- Skip validation
- Overwrite without conflict detection
- Clear localStorage on errors
- Disable form during sync

## License

MIT
