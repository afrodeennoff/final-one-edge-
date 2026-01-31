"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { Minus, Maximize2, GripVertical, Save, RefreshCw } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useI18n } from "@/locales/client"
import { WIDGET_REGISTRY, getWidgetComponent } from '../config/widget-registry'
import { useAutoScroll } from '../../../../hooks/use-auto-scroll'
import { useDashboard, sizeToGrid, getWidgetGrid } from '../dashboard-context'
import { useUserStore } from '@/store/user-store'
import { useWidgetSync } from '@/hooks/use-widget-sync'
import { SyncStatusIndicator } from '@/components/sync-status-indicator'
import { cn } from '@/lib/utils'
import { Widget, WidgetType, WidgetSize } from '../types/dashboard'

function getWidgetDimensions(widget: Widget, isMobile: boolean) {
  const grid = getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, isMobile)
  return {
    w: grid.w,
    h: grid.h,
    width: `${(grid.w * 100) / 12}%`,
    height: `${grid.h * (isMobile ? 65 : 70)}px`
  }
}

type WidgetDimensions = { w: number; h: number; width: string; height: string }

const generateResponsiveLayout = (widgets: Widget[]) => {
  const widgetArray = Array.isArray(widgets) ? widgets : []

  const layouts = {
    lg: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize)
    })),
    md: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize),
    })),
    sm: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0
    })),
    xs: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0
    })),
    xxs: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, true),
      x: 0
    }))
  }
  return layouts
}

function DeprecatedWidget({ onRemove }: { onRemove: () => void }) {
  const t = useI18n()
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{t('widgets.deprecated.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground text-center">
          {t('widgets.deprecated.description')}
        </p>
        <Button variant="destructive" onClick={onRemove}>
          {t('widgets.deprecated.remove')}
        </Button>
      </CardContent>
    </Card>
  )
}

function WidgetWrapper({ children, onRemove, onChangeSize, isCustomizing, size, currentType }: {
  children: React.ReactNode
  onRemove: () => void
  onChangeSize: (size: WidgetSize) => void
  isCustomizing: boolean
  size: WidgetSize
  currentType: WidgetType
}) {
  const t = useI18n()
  const { isMobile } = useDashboard()
  const widgetRef = useRef<HTMLDivElement>(null)
  const [isSizePopoverOpen, setIsSizePopoverOpen] = useState(false)

  const handleSizeChange = (newSize: WidgetSize) => {
    onChangeSize(newSize)
    setIsSizePopoverOpen(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCustomizing) {
      e.preventDefault()
    }
  }

  const isValidSize = (widgetType: WidgetType, size: WidgetSize) => {
    const config = WIDGET_REGISTRY[widgetType]
    if (!config) return true
    if (isMobile) {
      if (size === 'small' || size === 'small-long') return false
      return config.allowedSizes.includes(size)
    }
    return config.allowedSizes.includes(size)
  }

  return (
    <div
      ref={widgetRef}
      className="relative h-full w-full rounded-lg bg-background shadow-[0_2px_4px_rgba(0,0,0,0.05)] group isolate animate-[fadeIn_1.5s_ease-in-out] overflow-clip"
      onTouchStart={handleTouchStart}
    >
      <div className={cn("h-full w-full",
        isCustomizing && "group-hover:blur-[2px]",
        isCustomizing && isMobile && "blur-[2px]"
      )}>
        {children}
      </div>
      {isCustomizing && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-accent transition-colors duration-200 pointer-events-none" />
          <div className="absolute inset-0 bg-background/50 dark:bg-background/70 transition-opacity duration-200 pointer-events-none" />

          <div className="absolute inset-0 flex items-center justify-center drag-handle cursor-grab active:cursor-grabbing z-10">
            <div className="flex flex-col items-center gap-2 text-muted-foreground select-none pointer-events-none">
              <GripVertical className="h-6 w-4" />
              <p className="text-sm font-medium">{t('widgets.dragToMove')}</p>
            </div>
          </div>

          <div className="absolute top-2 right-2 flex gap-2 z-50">
            <Popover open={isSizePopoverOpen} onOpenChange={setIsSizePopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8 shadow-sm">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="flex flex-col gap-1">
                  {WIDGET_REGISTRY[currentType as keyof typeof WIDGET_REGISTRY]?.allowedSizes.map(s => (
                    <Button
                      key={s}
                      variant={size === s ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => handleSizeChange(s)}
                      disabled={!isValidSize(currentType, s) || size === s}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8 shadow-sm">
                  <Minus className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('widgets.removeWidgetConfirm')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('widgets.removeWidgetDescription')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('widgets.cancel')}</AlertDialogCancel>
                  <AlertDialogAction onClick={onRemove}>{t('widgets.removeWidget')}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  )
}

export default function WidgetCanvasWithSync() {
  const {
    isCustomizing,
    setIsCustomizing,
    layouts,
    currentLayout,
    activeLayout,
    handleLayoutChange: originalHandleLayoutChange,
    removeWidget,
    changeWidgetSize,
    isMobile
  } = useDashboard()

  const { user, dashboardLayout, setDashboardLayout } = useUserStore()
  const { saveLayout, syncNow, isOnline, hasPendingSave } = useWidgetSync()
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaveTime, setLastSaveTime] = useState<number | null>(null)

  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), [])

  const widgetDimensions = useMemo(() => {
    return currentLayout.reduce((acc: Record<string, WidgetDimensions>, widget) => {
      acc[widget.i] = getWidgetDimensions(widget, isMobile)
      return acc
    }, {} as Record<string, WidgetDimensions>)
  }, [currentLayout, isMobile])

  const responsiveLayout = useMemo(() => {
    return generateResponsiveLayout(currentLayout)
  }, [currentLayout])

  useAutoScroll(isMobile && isCustomizing)

  const handleLayoutChange = useCallback(async (layout: LayoutItem[]) => {
    if (!user?.id || !dashboardLayout) return

    const updatedLayout = {
      ...dashboardLayout,
      desktop: isMobile ? dashboardLayout.desktop : layout,
      mobile: isMobile ? layout : dashboardLayout.mobile,
      updatedAt: new Date()
    }

    setDashboardLayout(updatedLayout)
    originalHandleLayoutChange(layout, currentLayout)

    try {
      setIsSaving(true)
      await saveLayout(updatedLayout, 'drag', { debounceMs: 2000 })
      setLastSaveTime(Date.now())
    } finally {
      setIsSaving(false)
    }
  }, [user?.id, dashboardLayout, isMobile, setDashboardLayout, originalHandleLayoutChange, currentLayout, saveLayout])

  const handleRemoveWidget = useCallback(async (widgetId: string) => {
    if (!user?.id || !dashboardLayout) return

    const updatedLayout = {
      ...dashboardLayout,
      desktop: dashboardLayout.desktop.filter(w => w.i !== widgetId),
      mobile: dashboardLayout.mobile.filter(w => w.i !== widgetId),
      updatedAt: new Date()
    }

    setDashboardLayout(updatedLayout)
    removeWidget(widgetId)

    try {
      setIsSaving(true)
      await saveLayout(updatedLayout, 'remove', { immediate: true })
      setLastSaveTime(Date.now())
    } finally {
      setIsSaving(false)
    }
  }, [user?.id, dashboardLayout, setDashboardLayout, removeWidget, saveLayout])

  const handleChangeWidgetSize = useCallback(async (widgetId: string, newSize: WidgetSize) => {
    if (!user?.id || !dashboardLayout) return

    const updatedLayout = {
      ...dashboardLayout,
      desktop: dashboardLayout.desktop.map(w =>
        w.i === widgetId ? { ...w, size: newSize } : w
      ),
      mobile: dashboardLayout.mobile.map(w =>
        w.i === widgetId ? { ...w, size: newSize } : w
      ),
      updatedAt: new Date()
    }

    setDashboardLayout(updatedLayout)
    changeWidgetSize(widgetId, newSize)

    try {
      setIsSaving(true)
      await saveLayout(updatedLayout, 'resize', { immediate: true })
      setLastSaveTime(Date.now())
    } finally {
      setIsSaving(false)
    }
  }, [user?.id, dashboardLayout, setDashboardLayout, changeWidgetSize, saveLayout])

  const handleManualSave = useCallback(async () => {
    if (!dashboardLayout) return

    try {
      setIsSaving(true)
      await saveLayout(dashboardLayout, 'manual', { immediate: true })
      setLastSaveTime(Date.now())
    } finally {
      setIsSaving(false)
    }
  }, [dashboardLayout, saveLayout])

  const handleManualSync = useCallback(async () => {
    try {
      setIsSaving(true)
      await syncNow()
      setLastSaveTime(Date.now())
    } finally {
      setIsSaving(false)
    }
  }, [syncNow])

  const renderWidget = useCallback((widget: Widget) => {
    if (!Object.keys(WIDGET_REGISTRY).includes(widget.type)) {
      return <DeprecatedWidget onRemove={() => handleRemoveWidget(widget.i)} />
    }

    const config = WIDGET_REGISTRY[widget.type as keyof typeof WIDGET_REGISTRY]
    const effectiveSize = (() => {
      if (config.requiresFullWidth) return config.defaultSize
      if (config.allowedSizes.length === 1) return config.allowedSizes[0]
      if (isMobile && widget.size !== 'tiny') return 'small' as WidgetSize
      return widget.size as WidgetSize
    })()

    return getWidgetComponent(widget.type as WidgetType, effectiveSize)
  }, [isMobile, handleRemoveWidget])

  return (
    <div className={cn("relative mt-6 pb-16 w-full min-h-screen")}>
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-medium">Dashboard</h2>
              {isSaving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <SyncStatusIndicator userId={user?.id} showLabel />
              
              {hasPendingSave() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleManualSave}
                  disabled={isSaving || !isOnline}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Now
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {layouts && (
        <div className="relative">
          <div id="tooltip-portal" className="fixed inset-0 pointer-events-none z-9999" />
          <ResponsiveGridLayout
            layouts={responsiveLayout}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
            rowHeight={isMobile ? 65 : 70}
            isDraggable={isCustomizing}
            isResizable={false}
            draggableHandle=".drag-handle"
            onLayoutChange={handleLayoutChange}
            margin={[16, 16]}
            containerPadding={[0, 0]}
            useCSSTransforms={true}
          >
            {currentLayout.map((widget) => {
              const dimensions = widgetDimensions[widget.i]

              return (
                <div
                  key={widget.i}
                  className="h-full"
                  data-customizing={isCustomizing}
                  style={{
                    width: dimensions?.width,
                    height: dimensions?.height
                  }}
                >
                  <WidgetWrapper
                    onRemove={() => handleRemoveWidget(widget.i)}
                    onChangeSize={(size) => handleChangeWidgetSize(widget.i, size)}
                    isCustomizing={isCustomizing}
                    size={widget.size}
                    currentType={widget.type}
                  >
                    {renderWidget(widget)}
                  </WidgetWrapper>
                </div>
              )
            })}
          </ResponsiveGridLayout>
        </div>
      )}
    </div>
  )
}
