"use client"

import { useEffect } from "react"
import { useDashboardLayout } from "@/store/useDashboardLayout"
import { DASHBOARD_LAYOUT_VERSION } from "@/lib/dashboardLayoutVersion"
import { migrateDashboardLayout } from "@/lib/migrateDashboardLayout"
import { useUserStore } from "@/store/user-store"
import { defaultLayouts } from "@/lib/default-layouts"

export function DashboardLayoutLoader() {
  const setLayout = useDashboardLayout((s) => s.setLayout)
  const setIsLoading = useDashboardLayout((s) => s.setIsLoading)
  const setUserStoreLayout = useUserStore((s) => s.setDashboardLayout)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setIsLoading(true)
        const res = await fetch("/api/dashboard/layout")
        if (!res.ok) return
        const data = await res.json()
        if (!data) {
          setIsLoading(false)
          return
        }

        const { layout, version } = data

        if (!layout) {
          setIsLoading(false)
          return
        }

        const migrated =
          version !== undefined && version < DASHBOARD_LAYOUT_VERSION
            ? migrateDashboardLayout(layout, version)
            : layout

        if (!mounted) return
        setLayout(migrated)
        setUserStoreLayout(migrated)
        setIsLoading(false)

        if (version !== DASHBOARD_LAYOUT_VERSION) {
          await fetch("/api/dashboard/layout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              layout: migrated,
              version: DASHBOARD_LAYOUT_VERSION
            })
          })
        }
      } catch (e) {
        console.error("Layout loader error", e)
        setIsLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [setLayout, setIsLoading, setUserStoreLayout])

  return null
}
