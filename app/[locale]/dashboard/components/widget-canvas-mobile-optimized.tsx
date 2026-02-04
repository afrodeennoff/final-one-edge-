"use client"

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Minus, Maximize2, GripVertical } from 'lucide-react'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import { useI18n } from "@/locales/client"
import { WIDGET_REGISTRY, getWidgetComponent } from '../config/widget-registry'
import { useAutoScroll } from '../../../../hooks/use-auto-scroll'
import { cn } from '@/lib/utils'
import { Widget, WidgetType, WidgetSize } from '../types/dashboard'
import { useDashboard, sizeToGrid, getWidgetGrid } from '../dashboard-context'
import { motion } from 'framer-motion'

// Add a function to pre-calculate widget dimensions
function getWidgetDimensions(widget: Widget, isMobile: boolean) {
  const grid = getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize, isMobile)
  return {
    w: grid.w,
    h: grid.h,
    width: `${(grid.w * 100) / (isMobile ? 1 : 12)}%`, // Full width on mobile
    height: `${grid.h * (isMobile ? 60 : 70)}px` // Slightly more compact on mobile
  }
}

type WidgetDimensions = { w: number; h: number; width: string; height: string }

// Create layouts for different breakpoints with mobile-first approach
const generateResponsiveLayout = (widgets: Widget[]) => {
  const widgetArray = Array.isArray(widgets) ? widgets : []

  const layouts = {
    // Desktop: 12 columns, multi-row
    lg: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize)
    })),
    md: widgetArray.map(widget => ({
      ...widget,
      ...getWidgetGrid(widget.type as WidgetType, widget.size as WidgetSize),
    })),
    // Mobile: SINGLE COLUMN (1 col), full width widgets
    sm: widgetArray.map((widget, index) => ({
      i: widget.i,
      x: 0, // Always start at left
      y: index * 4, // Stack vertically with 4 row height per widget
      w: 1, // Full width (1 of 1 column)
      h: widget.h || 4, // Maintain widget height
    })),
    xs: widgetArray.map((widget, index) => ({
      i: widget.i,
      x: 0,
      y: index * 4,
      w: 1,
      h: widget.h || 4,
    })),
    xxs: widgetArray.map((widget, index) => ({
      i: widget.i,
      x: 0,
      y: index * 4,
      w: 1,
      h: widget.h || 4,
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

  // Enhanced touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isCustomizing) {
      // Prevent default touch behavior when customizing
      e.preventDefault()
    }
  }

  // Long press handler for mobile context menu
  const handleLongPress = useCallback(() => {
    if (isMobile && !isCustomizing) {
      // Could trigger context menu or quick actions
      console.log('Long press detected')
    }
  }, [isMobile, isCustomizing])

  const isValidSize = (widgetType: WidgetType, size: WidgetSize) => {
    const config = WIDGET_REGISTRY[widgetType]
    if (!config) return true // Allow any size for deprecated widgets
    
    // Mobile: only medium and large for better UX
    if (isMobile) {
      const mobileAllowedSizes: WidgetSize[] = ['medium', 'large']
      return mobileAllowedSizes.includes(size)
    }
    
    return config.allowedSizes.includes(size)
  }

  // Mobile-optimized button size (minimum 44x44px)
  const buttonSize = isMobile ? "h-11 w-11" : "h-8 w-8"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative h-full w-full rounded-2xl bg-card/40 backdrop-blur-md border border-white/5 shadow-2xl group isolate overflow-clip premium-glow-hover transition-all duration-300"
      onTouchStart={handleTouchStart}
      ref={widgetRef}
    >
      <div className={cn("h-full w-full transition-all duration-500",
        isCustomizing && "group-hover:blur-[4px] scale-[0.98]",
        isCustomizing && isMobile && "blur-[4px] scale-[0.98]"
      )}>
        {children}
      </div>

      {isCustomizing && (
        <>
          <div className="absolute inset-0 border-2 border-dashed border-transparent hover:border-accent transition-colors duration-200 pointer-events-none" />
          <div className="absolute inset-0 bg-background/50 dark:bg-background/70 transition-opacity duration-200 pointer-events-none" />

          {/* Drag Handle - Larger on mobile for easier touch */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center drag-handle cursor-grab active:cursor-grabbing z-10",
            isMobile && "touch-action-manipulation" // Better touch handling
          )}>
            <div className={cn(
              "flex flex-col items-center gap-2 text-muted-foreground select-none pointer-events-none",
              isMobile ? "p-8" : "p-4" // Larger touch area on mobile
            )}>
              <GripVertical className={cn(isMobile ? "h-8 w-6" : "h-6 w-4")} />
              <p className={cn(
                "font-medium",
                isMobile ? "text-base" : "text-sm"
              )}>{t('widgets.dragToMove')}</p>
            </div>
          </div>

          {/* Controls - Optimized for mobile touch */}
          <div className={cn(
            "absolute top-2 right-2 flex gap-2 z-50",
            isMobile && "top-3 right-3" // More spacing on mobile
          )}>
            <Popover open={isSizePopoverOpen} onOpenChange={setIsSizePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "shadow-sm touch-manipulation", // Better touch handling
                    buttonSize
                  )}
                >
                  <Maximize2 className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="flex flex-col gap-1">
                  {(isMobile 
                    ? (['medium', 'large'] as WidgetSize[]) // Only show mobile-friendly sizes
                    : WIDGET_REGISTRY[currentType as keyof typeof WIDGET_REGISTRY]?.allowedSizes
                  ).map(s => (
                    <Button
                      key={s}
                      variant={size === s ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isMobile && "min-h-[44px] text-base" // Touch-friendly on mobile
                      )}
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
                <Button
                  variant="destructive"
                  size="icon"
                  className={cn(
                    "shadow-sm touch-manipulation",
                    buttonSize
                  )}
                >
                  <Minus className={cn(isMobile ? "h-5 w-5" : "h-4 w-4")} />
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
                  <AlertDialogCancel className={isMobile ? "min-h-[44px]" : ""}>
                    {t('widgets.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onRemove}
                    className={isMobile ? "min-h-[44px]" : ""}
                  >
                    {t('widgets.remove')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </motion.div>
  )
}

interface WidgetCanvasProps {
  isCustomizing: boolean
  handleLayoutChange: (layout: any[]) => void
}

export function WidgetCanvas({ isCustomizing, handleLayoutChange }: WidgetCanvasProps) {
  const { t } = useI18n()
  const { currentLayout, removeWidget, changeWidgetSize, isMobile, addWidget } = useDashboard()
  const containerRef = useRef<HTMLDivElement>(null)
  const ResponsiveGridLayout = useMemo(() => WidthProvider(Responsive), [])

  const widgetDimensions = useMemo(() => {
    return currentLayout.reduce((acc: Record<string, WidgetDimensions>, widget) => {
      acc[widget.i] = getWidgetDimensions(widget, isMobile)
      return acc
    }, {})
  }, [currentLayout, isMobile])

  const responsiveLayout = useMemo(() => generateResponsiveLayout(currentLayout), [currentLayout])

  const renderWidget = (widget: Widget) => {
    const WidgetComponent = getWidgetComponent(widget.type as WidgetType)

    if (!WidgetComponent) {
      return <DeprecatedWidget key={widget.i} onRemove={() => removeWidget(widget.i)} />
    }

    return <WidgetComponent key={widget.i} />
  }

  // Auto-scroll to top/bottom based on customization mode
  useAutoScroll(isCustomizing, containerRef)

  if (currentLayout.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <p className="text-muted-foreground text-lg mb-4">{t('widgets.noWidgets.title')}</p>
        <Button onClick={() => addWidget('equity-chart')} size={isMobile ? "lg" : "default"}>
          {t('widgets.add')}
        </Button>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {!isCustomizing && currentLayout.length > 0 && (
        <div className={cn(
          "relative pb-8",
          isMobile ? "px-2" : "px-4" // Less padding on mobile
        )}>
          <div className="grid gap-4">
            {currentLayout.map((widget) => {
              const dimensions = widgetDimensions[widget.i]
              return (
                <div
                  key={widget.i}
                  className="h-full w-full"
                  style={{
                    height: dimensions?.height
                  }}
                >
                  <WidgetWrapper
                    onRemove={() => removeWidget(widget.i)}
                    onChangeSize={(size) => changeWidgetSize(widget.i, size)}
                    isCustomizing={false}
                    size={widget.size}
                    currentType={widget.type}
                  >
                    {renderWidget(widget)}
                  </WidgetWrapper>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {isCustomizing && (
        <div className={cn(
          "relative",
          isMobile ? "px-2 pb-4" : "px-4 pb-8"
        )}>
          <div id="tooltip-portal" className="fixed inset-0 pointer-events-none z-50" />
          <ResponsiveGridLayout
            layouts={responsiveLayout}
            breakpoints={{ 
              lg: 1200, 
              md: 996, 
              sm: 768, 
              xs: 480, 
              xxs: 0 
            }}
            cols={{ 
              lg: 12,  // Desktop: 12 columns
              md: 12,  
              sm: 1,   // Mobile: 1 column (FULL WIDTH!)
              xs: 1,   
              xxs: 1   
            }}
            rowHeight={isMobile ? 60 : 70}
            isDraggable={isCustomizing}
            isResizable={false}
            draggableHandle=".drag-handle"
            onLayoutChange={handleLayoutChange}
            margin={[isMobile ? 8 : 16, isMobile ? 8 : 16]} // Tighter spacing on mobile
            containerPadding={[isMobile ? 8 : 0, isMobile ? 8 : 0]} // Padding on mobile
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
                    onRemove={() => removeWidget(widget.i)}
                    onChangeSize={(size) => changeWidgetSize(widget.i, size)}
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
