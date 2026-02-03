"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { useDashboardLayout } from '@/store/useDashboardLayout'
import { useI18n } from "@/locales/client"
import { Widget, WidgetType, WidgetSize, LayoutItem } from './types/dashboard'
import { WIDGET_REGISTRY } from './config/widget-registry'
import { toast } from "sonner"
import { defaultLayouts } from "@/lib/default-layouts"
import { DashboardLayoutWithWidgets } from '@/store/user-store'
import { DASHBOARD_LAYOUT_VERSION } from "@/lib/dashboardLayoutVersion"

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
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const t = useI18n()
    const isMobile = useUserStore(state => state.isMobile)
    const layout = useDashboardLayout(state => state.layout)
    const setLayout = useDashboardLayout(state => state.setLayout)
    const isLoading = useDashboardLayout(state => state.isLoading)
    const setUserStoreLayout = useUserStore(state => state.setDashboardLayout)
    const user = useUserStore(state => state.user)
    const supabaseUser = useUserStore(state => state.supabaseUser)

    const [isCustomizing, setIsCustomizing] = useState(false)

    const activeLayout = useMemo(() => isMobile ? 'mobile' : 'desktop', [isMobile])

    const currentLayout = useMemo(() => {
        if (!layout) return []
        const layoutArray = layout[activeLayout]
        return Array.isArray(layoutArray) ? layoutArray : []
    }, [layout, activeLayout])

    const toggleCustomizing = useCallback(() => {
        setIsCustomizing(prev => !prev)
    }, [])

    const handleLayoutChange = useCallback((layoutItems: LayoutItem[]) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layout) return

        console.log('[DashboardContext] handleLayoutChange', layoutItems)

        try {
            const currentWidgets = layout[activeLayout] || []
            const updatedWidgets = layoutItems.map(item => {
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
                    updatedAt: new Date()
                }
            }).filter((item): item is NonNullable<typeof item> => item !== null)

            const updatedLayouts = {
                ...layout,
                [activeLayout]: updatedWidgets,
                updatedAt: new Date()
            }

            setLayout(updatedLayouts)
            setUserStoreLayout(updatedLayouts)
        } catch (error) {
            console.error('[DashboardContext] Error updating layout:', error)
        }
    }, [user?.id, supabaseUser?.id, layout, activeLayout, isMobile, setLayout, setUserStoreLayout])

    const addWidget = useCallback(async (type: WidgetType, size: WidgetSize = 'medium') => {
        const userId = user?.id || supabaseUser?.id
        console.log('[DashboardContext] addWidget', { type, size, userId, hasLayout: !!layout })

        if (!layout) {
            console.error('[DashboardContext] addWidget failed: missing layout')
            return
        }

        if (!userId) {
            console.error('[DashboardContext] addWidget failed: missing user ID')
            return
        }

        const currentItems = layout[activeLayout] || []
        if (currentItems.some(widget => widget.type === type)) {
            toast.error(t('widgets.duplicate.title'), { description: t('widgets.duplicate.description') })
            return
        }

        const effectiveSize = size
        const grid = sizeToGrid(effectiveSize, activeLayout === 'mobile')

        let lowestY = 0
        currentItems.forEach(widget => {
            const widgetBottom = widget.y + widget.h
            if (widgetBottom > lowestY) lowestY = widgetBottom
        })

        const newWidget: Widget = {
            i: `widget${Date.now()}`,
            type,
            size: effectiveSize,
            x: 0,
            y: lowestY,
            w: grid.w,
            h: grid.h,
            updatedAt: new Date()
        }

        const updatedWidgets = [...currentItems, newWidget]
        const newLayout = { ...layout, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        console.log('[DashboardContext] Updating state for addWidget')
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
        toast.success(t('widgets.widgetAdded'), { description: t('widgets.widgetAddedDescription') })
    }, [user?.id, supabaseUser?.id, layout, activeLayout, setLayout, setUserStoreLayout, t])

    const removeWidget = useCallback(async (i: string) => {
        const userId = user?.id || supabaseUser?.id
        console.log('[DashboardContext] removeWidget', { widgetId: i, userId, hasLayout: !!layout })

        if (!layout) {
            console.error('[DashboardContext] removeWidget failed: missing layout')
            return
        }

        const updatedWidgets = layout[activeLayout].filter(widget => widget.i !== i)
        const newLayout = { ...layout, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        console.log('[DashboardContext] Updating state for removeWidget')
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
    }, [user?.id, supabaseUser?.id, layout, activeLayout, setLayout, setUserStoreLayout])

    const changeWidgetType = useCallback(async (i: string, newType: WidgetType) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layout) return
        const updatedWidgets = layout[activeLayout].map(widget =>
            widget.i === i ? { ...widget, type: newType, updatedAt: new Date() } : widget
        )
        const newLayout = { ...layout, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
    }, [user?.id, supabaseUser?.id, layout, activeLayout, setLayout, setUserStoreLayout])

    const changeWidgetSize = useCallback(async (i: string, newSize: WidgetSize) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layout) return
        const widget = layout[activeLayout].find(w => w.i === i)
        if (!widget) return

        let effectiveSize = newSize
        if (widget.type.includes('Chart') && newSize === 'tiny') effectiveSize = 'medium'

        const grid = sizeToGrid(effectiveSize)
        const updatedWidgets = layout[activeLayout].map(widget =>
            widget.i === i ? { ...widget, size: effectiveSize, ...grid, updatedAt: new Date() } : widget
        )
        const newLayout = { ...layout, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
    }, [user?.id, supabaseUser?.id, layout, activeLayout, setLayout, setUserStoreLayout])

    const removeAllWidgets = useCallback(async () => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layout) return
        const newLayout = { ...layout, desktop: [], mobile: [], updatedAt: new Date() }
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
    }, [user?.id, supabaseUser?.id, layout, setLayout, setUserStoreLayout])

    const restoreDefaultLayout = useCallback(async () => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layout) return
        const newLayout = {
            ...layout,
            desktop: defaultLayouts.desktop as unknown as Widget[],
            mobile: defaultLayouts.mobile as unknown as Widget[],
            updatedAt: new Date()
        }
        setLayout(newLayout)
        setUserStoreLayout(newLayout)
        toast.success(t('widgets.restoredDefaultsTitle'), { description: t('widgets.restoredDefaultsDescription') })
    }, [user?.id, supabaseUser?.id, layout, setLayout, setUserStoreLayout, t])

    useEffect(() => {
        if (!layout || isLoading) return

        const timeoutId = setTimeout(async () => {
            try {
                await fetch("/api/dashboard/layout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        layout,
                        version: DASHBOARD_LAYOUT_VERSION
                    })
                })
                console.log('[Dashboard] Auto-save completed')
            } catch (error) {
                console.error('[Dashboard] Auto-save failed', error)
            }
        }, 800)

        return () => clearTimeout(timeoutId)
    }, [layout, isLoading])

    return (
        <DashboardContext.Provider value={{
            isCustomizing,
            setIsCustomizing,
            toggleCustomizing,
            layouts: layout,
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
