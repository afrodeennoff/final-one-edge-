"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { useData } from '@/context/data-provider'
import { useI18n } from "@/locales/client"
import { Widget, WidgetType, WidgetSize, LayoutItem } from './types/dashboard'
import { WIDGET_REGISTRY } from './config/widget-registry'
import { toast } from "sonner"
import { defaultLayouts } from "@/lib/default-layouts"
import { DashboardLayoutWithWidgets } from '@/store/user-store'
import type { Prisma } from '@/prisma/generated/prisma'
import type { DashboardLayout } from '@/prisma/generated/prisma'

const toPrismaLayout = (layout: DashboardLayoutWithWidgets): DashboardLayout => {
    return {
        id: layout.id,
        userId: layout.userId,
        desktop: layout.desktop as unknown as Prisma.JsonArray,
        mobile: layout.mobile as unknown as Prisma.JsonArray,
        version: layout.version ?? 1,
        checksum: null,
        deviceId: null,
        createdAt: layout.createdAt,
        updatedAt: layout.updatedAt,
    }
}

export const sizeToGrid = (size: WidgetSize, isSmallScreen = false): { w: number, h: number } => {
    if (isSmallScreen) {
        switch (size) {
            case 'tiny': return { w: 12, h: 1 }
            case 'small': return { w: 12, h: 2 }
            case 'small-long': return { w: 12, h: 2 }
            case 'medium': return { w: 12, h: 4 }
            case 'large': return { w: 12, h: 6 }
            case 'extra-large': return { w: 12, h: 6 }
            default: return { w: 12, h: 4 }
        }
    }
    switch (size) {
        case 'tiny': return { w: 3, h: 1 }
        case 'small': return { w: 3, h: 4 }
        case 'small-long': return { w: 6, h: 2 }
        case 'medium': return { w: 6, h: 4 }
        case 'large': return { w: 6, h: 8 }
        case 'extra-large': return { w: 12, h: 8 }
        default: return { w: 6, h: 4 }
    }
}

export const getWidgetGrid = (type: WidgetType, size: WidgetSize, isSmallScreen = false): { w: number, h: number } => {
    const config = WIDGET_REGISTRY[type]
    if (!config) return isSmallScreen ? { w: 12, h: 4 } : { w: 6, h: 4 }
    if (isSmallScreen) return sizeToGrid(size, true)
    return sizeToGrid(size)
}

interface DashboardContextType {
    isCustomizing: boolean
    setIsCustomizing: (val: boolean) => void
    toggleCustomizing: () => void
    layouts: DashboardLayoutWithWidgets | null
    currentLayout: Widget[]
    activeLayout: 'desktop' | 'mobile'

    addWidget: (type: WidgetType, size?: WidgetSize) => void
    removeWidget: (id: string) => void
    changeWidgetType: (id: string, newType: WidgetType) => void
    changeWidgetSize: (id: string, newSize: WidgetSize) => void
    removeAllWidgets: () => void
    restoreDefaultLayout: () => void
    handleLayoutChange: (layout: LayoutItem[]) => void

    isMobile: boolean

    // Compatibility fields for components expecting auto-save status
    autoSaveStatus: {
        hasPending: boolean
        isInitialized: boolean
    }
    flushPendingSaves: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const t = useI18n()
    const isMobile = useUserStore(state => state.isMobile)
    const layouts = useUserStore(state => state.dashboardLayout)
    const setLayouts = useUserStore(state => state.setDashboardLayout)
    const user = useUserStore(state => state.user)
    const supabaseUser = useUserStore(state => state.supabaseUser)
    const { saveDashboardLayout } = useData()

    const [isCustomizing, setIsCustomizing] = useState(false)
    const [isUserAction, setIsUserAction] = useState(false)

    const tt = t as any
    const activeLayout = useMemo(() => isMobile ? 'mobile' : 'desktop', [isMobile])

    const toggleCustomizing = useCallback(() => setIsCustomizing(prev => !prev), [])

    const currentLayout = useMemo(() => {
        return layouts?.[activeLayout] || []
    }, [layouts, activeLayout])

    // SIMPLIFIED: Direct save to database (no auto-save service)
    // This matches the original deltalytix approach
    const handleLayoutChange = useCallback((layout: LayoutItem[]) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !setLayouts || !layouts) return

        console.log('[DashboardContext] handleLayoutChange', layout)

        try {
            const currentWidgets = layouts[activeLayout] || []

            const updatedWidgets = layout.map(item => {
                const existingWidget = currentWidgets.find(w => w.i === item.i)
                if (!existingWidget) {
                    console.warn('[DashboardContext] Widget not found:', item.i)
                    return null
                }
                return {
                    ...existingWidget,
                    x: isMobile ? 0 : item.x,
                    y: item.y,
                    w: isMobile ? 12 : item.w,
                    h: item.h,
                }
            }).filter((item): item is NonNullable<typeof item> => item !== null)

            const updatedLayouts = {
                ...layouts,
                [activeLayout]: updatedWidgets,
                updatedAt: new Date()
            }

            // Update state immediately
            setLayouts(updatedLayouts)

            // Save directly to database (simple approach from deltalytix)
            saveDashboardLayout(toPrismaLayout(updatedLayouts))

            if (isUserAction) setIsUserAction(false)
        } catch (error) {
            console.error('[DashboardContext] Error updating layout:', error)
            toast.error(tt('dashboard.saveError') as any || 'Failed to Update Layout', {
                description: 'Please try again'
            })
        }
    }, [user?.id, supabaseUser?.id, setLayouts, layouts, activeLayout, isMobile, isUserAction, saveDashboardLayout, tt])

    const addWidget = useCallback(async (type: WidgetType, size: WidgetSize = 'medium') => {
        const userId = user?.id || supabaseUser?.id
        console.log('[DashboardContext] addWidget', { type, size, userId, hasLayouts: !!layouts })

        if (!layouts) {
            console.error('[DashboardContext] addWidget failed: missing layouts')
            return
        }

        if (!userId) {
            console.error('[DashboardContext] addWidget failed: missing user ID')
            return
        }

        const currentItems = layouts[activeLayout]
        if (currentItems.some(widget => widget.type === type)) {
            toast.error(tt('widgets.duplicate.title') as any, { description: tt('widgets.duplicate.description') as any })
            return
        }

        try {
            const widgetId = `${type}-${Date.now()}`
            const grid = getWidgetGrid(type, size, isMobile)

            const newWidget: Widget = {
                i: widgetId,
                x: 0,
                y: currentItems.length > 0 ? Math.max(...currentItems.map(w => (w.y || 0) + (w.h || 4))) : 0,
                w: grid.w,
                h: grid.h,
                type,
                size
            }

            const updatedLayouts = {
                ...layouts,
                [activeLayout]: [...currentItems, newWidget],
                updatedAt: new Date()
            }

            setLayouts(updatedLayouts)
            saveDashboardLayout(toPrismaLayout(updatedLayouts))

            toast.success(tt('widgets.widgetAdded') as any, { description: tt('widgets.widgetAddedDescription') as any })
        } catch (error) {
            console.error('[DashboardContext] Error adding widget:', error)
            toast.error(tt('dashboard.saveError') as any || 'Failed to Add Widget', {
                description: 'Please try again'
            })
        }
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, isMobile, tt])

    const removeWidget = useCallback(async (id: string) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return

        const updatedLayouts = {
            ...layouts,
            [activeLayout]: layouts[activeLayout].filter(w => w.i !== id),
            updatedAt: new Date()
        }

        setLayouts(updatedLayouts)
        saveDashboardLayout(toPrismaLayout(updatedLayouts))

        toast.success(tt('widgets.removedTitle') as any || 'Widget Removed', { description: tt('widgets.removedDescription') as any || 'The widget has been removed.' })
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, tt])

    const changeWidgetType = useCallback(async (i: string, newType: WidgetType) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const widget = layouts[activeLayout].find(w => w.i === i)
        if (!widget) return

        let effectiveSize = newType === 'tradingScore' ? 'medium' : widget.size
        if (newType.includes('Chart') && widget.size === 'tiny') effectiveSize = 'medium'

        const grid = getWidgetGrid(newType, effectiveSize, isMobile)
        const updatedWidgets = layouts[activeLayout].map(widget =>
            widget.i === i ? { ...widget, type: newType, size: effectiveSize, ...grid } : widget
        )
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayouts(newLayouts)
        saveDashboardLayout(toPrismaLayout(newLayouts))

        toast.success(tt('widgets.typeChangedTitle') as any || 'Type Changed', { description: tt('widgets.typeChangedDescription') as any || 'Widget type has been updated.' })
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, isMobile, tt])

    const changeWidgetSize = useCallback(async (i: string, newSize: WidgetSize) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const widget = layouts[activeLayout].find(w => w.i === i)
        if (!widget) return

        let effectiveSize = newSize
        if (widget.type.includes('Chart') && newSize === 'tiny') effectiveSize = 'medium'

        const grid = sizeToGrid(effectiveSize)
        const updatedWidgets = layouts[activeLayout].map(widget =>
            widget.i === i ? { ...widget, size: effectiveSize, ...grid } : widget
        )
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayouts(newLayouts)
        saveDashboardLayout(toPrismaLayout(newLayouts))

        toast.success(tt('widgets.resizedTitle') as any || 'Widget Resized', { description: tt('widgets.resizedDescription') as any || 'Widget size has been updated.' })
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, tt])

    const removeAllWidgets = useCallback(async () => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const newLayouts = { ...layouts, desktop: [], mobile: [], updatedAt: new Date() }
        setLayouts(newLayouts)
        saveDashboardLayout(toPrismaLayout(newLayouts))

        toast.success(tt('widgets.clearedTitle') as any || 'All Widgets Removed', { description: tt('widgets.clearedDescription') as any || 'Your dashboard is now empty.' })
    }, [user?.id, supabaseUser?.id, layouts, setLayouts, saveDashboardLayout, tt])

    const restoreDefaultLayout = useCallback(async () => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const newLayouts = {
            ...layouts,
            desktop: defaultLayouts.desktop as unknown as Widget[],
            mobile: defaultLayouts.mobile as unknown as Widget[],
            updatedAt: new Date()
        }
        setLayouts(newLayouts)
        saveDashboardLayout(toPrismaLayout(newLayouts))

        toast.success(tt('widgets.restoredDefaultsTitle') as any, { description: tt('widgets.restoredDefaultsDescription') as any })
    }, [user?.id, supabaseUser?.id, layouts, setLayouts, saveDashboardLayout, tt])

    const flushPendingSaves = useCallback(async () => {
        // Simple direct save has no pending queue
        return Promise.resolve()
    }, [])

    return (
        <DashboardContext.Provider value={{
            isCustomizing,
            setIsCustomizing,
            toggleCustomizing,
            layouts,
            currentLayout,
            activeLayout,
            addWidget,
            removeWidget,
            changeWidgetType,
            changeWidgetSize,
            removeAllWidgets,
            restoreDefaultLayout,
            handleLayoutChange,
            isMobile,
            autoSaveStatus: {
                hasPending: false,
                isInitialized: true,
            },
            flushPendingSaves,
        }}>
            {children}
        </DashboardContext.Provider>
    )
}

export function useDashboard() {
    const context = useContext(DashboardContext)
    if (context === undefined) {
        throw new Error('useDashboard must be used within a DashboardProvider')
    }
    return context
}
