"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useUserStore } from '@/store/user-store'
import { useData } from '@/context/data-provider'
import { useI18n } from "@/locales/client"
import { Widget, WidgetType, WidgetSize, LayoutItem } from './types/dashboard'
import { WIDGET_REGISTRY } from './config/widget-registry'
import { toast } from "sonner"
import { defaultLayouts } from "@/lib/default-layouts"
import { Prisma, DashboardLayout } from "@/prisma/generated/prisma"
import { DashboardLayoutWithWidgets } from '@/store/user-store'
import { widgetStorageService, StorageResult } from '@/lib/widget-storage-service'
import { optimisticWidgetManager, WidgetLayoutChange } from '@/lib/widget-optimistic-updates'
import { widgetConflictResolver, ConflictResolution } from '@/lib/widget-conflict-resolution'
import { widgetMigrationService } from '@/lib/widget-migration-service'

// --- Helper Functions (Moved from WidgetCanvas) ---

const toPrismaLayout = (layout: DashboardLayoutWithWidgets): DashboardLayout => {
    return {
        ...layout,
        desktop: layout.desktop as unknown as Prisma.JsonArray,
        mobile: layout.mobile as unknown as Prisma.JsonArray,
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

// --- Context Definition ---

interface DashboardContextType {
    isCustomizing: boolean
    setIsCustomizing: (val: boolean) => void
    toggleCustomizing: () => void
    layouts: DashboardLayoutWithWidgets | null
    currentLayout: Widget[]
    activeLayout: 'desktop' | 'mobile'
    saveStatus: 'idle' | 'saving' | 'saved' | 'error'
    lastSaveTime: Date | null

    // Actions
    addWidget: (type: WidgetType, size?: WidgetSize) => Promise<void>
    removeWidget: (id: string) => Promise<void>
    changeWidgetType: (id: string, newType: WidgetType) => Promise<void>
    changeWidgetSize: (id: string, newSize: WidgetSize) => Promise<void>
    removeAllWidgets: () => Promise<void>
    restoreDefaultLayout: () => Promise<void>
    handleLayoutChange: (layout: LayoutItem[]) => void
    syncLayout: () => Promise<void>

    // Helpers
    isMobile: boolean
    isSaving: boolean
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

    const activeLayout = useMemo(() => isMobile ? 'mobile' : 'desktop', [isMobile])

    const toggleCustomizing = useCallback(() => setIsCustomizing(prev => !prev), [])

    const currentLayout = useMemo(() => {
        return layouts?.[activeLayout] || []
    }, [layouts, activeLayout])

    const handleLayoutChange = useCallback((layout: LayoutItem[]) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !setLayouts || !layouts) return

        console.log('[DashboardContext] handleLayoutChange', layout)

        try {
            const updatedLayouts = {
                ...layouts,
                [activeLayout]: layout.map(item => {
                    const existingWidget = layouts[activeLayout].find(w => w.i === item.i)
                    if (!existingWidget) return null
                    return {
                        ...existingWidget,
                        x: isMobile ? 0 : item.x,
                        y: item.y,
                        w: isMobile ? 12 : item.w,
                        h: item.h,
                    }
                }).filter((item): item is NonNullable<typeof item> => item !== null)
            }

            setLayouts({
                ...layouts,
                desktop: updatedLayouts.desktop,
                mobile: updatedLayouts.mobile,
                updatedAt: new Date()
            })

            saveDashboardLayout(toPrismaLayout(updatedLayouts)).catch((error) => {
                console.error('[DashboardContext] Failed to save layout:', error)
                toast.error(t('widgets.saveError'), { 
                    description: error instanceof Error ? error.message : t('widgets.saveErrorDescription') 
                })
            })

            if (isUserAction) setIsUserAction(false)
        } catch (error) {
            console.error('Error updating layout:', error)
            setLayouts(layouts)
        }
    }, [user?.id, supabaseUser?.id, setLayouts, layouts, activeLayout, isMobile, isUserAction, saveDashboardLayout, t])

    const addWidget = useCallback(async (type: WidgetType, size: WidgetSize = 'medium') => {
        const userId = user?.id || supabaseUser?.id
        console.log('[DashboardContext] addWidget', { type, size, userId, hasLayouts: !!layouts })

        if (!layouts) {
            console.error('[DashboardContext] addWidget failed: missing layouts')
            return
        }

        if (!userId) {
            console.error('[DashboardContext] addWidget failed: missing user ID')
            // We can still update local state, but it won't save to DB
        }

        const currentItems = layouts[activeLayout]
        // Prevent adding duplicate widget types
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
            y: lowestY, // Simple append to bottom
            w: grid.w,
            h: grid.h
        }

        const updatedWidgets = [...currentItems, newWidget]
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        console.log('[DashboardContext] Updating state for addWidget')
        setLayouts(newLayouts)
        toast.success(t('widgets.widgetAdded'), { description: t('widgets.widgetAddedDescription') })

        if (userId) {
            await saveDashboardLayout(toPrismaLayout(newLayouts))
        }
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, t])

    const removeWidget = useCallback(async (i: string) => {
        const userId = user?.id || supabaseUser?.id
        console.log('[DashboardContext] removeWidget', { widgetId: i, userId, hasLayouts: !!layouts })

        if (!layouts) {
            console.error('[DashboardContext] removeWidget failed: missing layouts')
            return
        }

        const updatedWidgets = layouts[activeLayout].filter(widget => widget.i !== i)
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }

        console.log('[DashboardContext] Updating state for removeWidget')
        setLayouts(newLayouts)

        if (userId) {
            try {
                await saveDashboardLayout(toPrismaLayout(newLayouts))
            } catch (error) {
                console.error('[DashboardContext] Failed to save layout after removing widget:', error)
                toast.error(t('widgets.saveError'), { 
                    description: error instanceof Error ? error.message : t('widgets.saveErrorDescription') 
                })
            }
        }
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, t])

    const changeWidgetType = useCallback(async (i: string, newType: WidgetType) => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const updatedWidgets = layouts[activeLayout].map(widget =>
            widget.i === i ? { ...widget, type: newType } : widget
        )
        const newLayouts = { ...layouts, [activeLayout]: updatedWidgets, updatedAt: new Date() }
        setLayouts(newLayouts)
        try {
            await saveDashboardLayout(toPrismaLayout(newLayouts))
        } catch (error) {
            console.error('[DashboardContext] Failed to save layout after changing widget type:', error)
            toast.error(t('widgets.saveError'), { 
                description: error instanceof Error ? error.message : t('widgets.saveErrorDescription') 
            })
        }
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout, t])

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
        await saveDashboardLayout(toPrismaLayout(newLayouts))
    }, [user?.id, supabaseUser?.id, layouts, activeLayout, setLayouts, saveDashboardLayout])

    const removeAllWidgets = useCallback(async () => {
        const userId = user?.id || supabaseUser?.id
        if (!userId || !layouts) return
        const newLayouts = { ...layouts, desktop: [], mobile: [], updatedAt: new Date() }
        setLayouts(newLayouts)
        try {
            await saveDashboardLayout(toPrismaLayout(newLayouts))
        } catch (error) {
            console.error('[DashboardContext] Failed to save layout after removing all widgets:', error)
            toast.error(t('widgets.saveError'), { 
                description: error instanceof Error ? error.message : t('widgets.saveErrorDescription') 
            })
        }
    }, [user?.id, supabaseUser?.id, layouts, setLayouts, saveDashboardLayout, t])

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
        await saveDashboardLayout(toPrismaLayout(newLayouts))
        toast.success(t('widgets.restoredDefaultsTitle'), { description: t('widgets.restoredDefaultsDescription') })
    }, [user?.id, supabaseUser?.id, layouts, setLayouts, saveDashboardLayout, t])

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
            isMobile
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
