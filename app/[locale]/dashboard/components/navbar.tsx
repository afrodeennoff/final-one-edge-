'use client'

import { useState } from 'react'
import {
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
  Settings2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import ImportButton from './import/import-button'
import { useI18n } from "@/locales/client"
import { useKeyboardShortcuts } from '../../../../hooks/use-keyboard-shortcuts'
import { ActiveFilterTags } from './filters/active-filter-tags'
import { AnimatePresence, motion } from 'framer-motion'
import { FilterCommandMenu } from './filters/filter-command-menu'
import { useDashboard } from '../dashboard-context'
import { AddWidgetSheet } from './add-widget-sheet'
import { ShareButton } from './share-button'
import { useData } from '@/context/data-provider'
import { cn } from '@/lib/utils'
import { DailySummaryModal } from './daily-summary-modal'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { PnLSummary } from './pnl-summary'

export default function Navbar() {
  const t = useI18n()
  const {
    isCustomizing,
    toggleCustomizing,
    addWidget,
    layouts
  } = useDashboard()
  const { refreshAllData, isPlusUser, isLoading } = useData()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshAllData({ force: true })
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  // Initialize keyboard shortcuts
  useKeyboardShortcuts()

  const currentLayout = layouts || { desktop: [], mobile: [] }

  return (
    <div className="sticky top-0 z-40 w-full px-4 py-3 pointer-events-none">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="pointer-events-auto flex flex-col glass rounded-[2rem] border border-white/10 shadow-2xl transition-all duration-500 hover:shadow-accent-teal/5"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 h-14">

          {/* Left Side: Sidebar Toggle & Brand */}
          <div className="flex items-center gap-4">
            <SidebarTrigger className="-ml-1 text-fg-muted hover:text-fg-primary hover:bg-white/5 transition-all rounded-xl" />
          </div>

          {/* Center: PnL Metrics (Desktop Only) */}
          <PnLSummary />

          {/* Right Side: Actions */}
          <div className="flex items-center gap-2">

            {/* Config Group */}
            <div className="hidden md:flex items-center gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/5">
              <Button
                id="customize-mode"
                variant="ghost"
                size="sm"
                onClick={toggleCustomizing}
                className={cn(
                  "h-8 px-3 gap-2 rounded-xl transition-all duration-300",
                  isCustomizing
                    ? "bg-accent-teal text-white hover:bg-accent-teal-hover"
                    : "text-fg-muted hover:text-fg-primary hover:bg-white/5"
                )}
              >
                <Pencil className={cn("w-3.5 h-3.5", isCustomizing && "animate-pulse")} />
                <span className="text-[10px] font-black uppercase tracking-wider">{isCustomizing ? "Lock" : "Edit"}</span>
              </Button>

              <AddWidgetSheet onAddWidget={addWidget} isCustomizing={isCustomizing} />

              <div className="w-px h-4 bg-white/10 mx-1" />

              <ShareButton currentLayout={currentLayout} />
            </div>

            {/* Performance & Search Group */}
            <div className="flex items-center gap-1.5">
              <FilterCommandMenu variant="navbar" />

              <div className="hidden sm:flex items-center gap-2">
                <ImportButton />

                {!isPlusUser() && (
                  <Link href="/dashboard/billing">
                    <Button variant="outline" size="sm" className="h-8 px-4 gap-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest hover:border-amber-500/60 hover:from-amber-500/30 transition-all duration-500 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]">
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      <span>Upgrade</span>
                    </Button>
                  </Link>
                )}
              </div>

              <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

              {/* Real-time Actions */}
              <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-2xl border border-white/5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="h-8 w-8 rounded-xl text-fg-muted hover:text-fg-primary hover:bg-white/5 transition-all active:scale-95"
                  title="Manual Refresh"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5 transition-transform duration-700", (isRefreshing || isLoading) && "animate-spin")} />
                </Button>
                <DailySummaryModal />
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <AnimatePresence>
          <div className="px-6 flex flex-wrap gap-2">
            <ActiveFilterTags showAccountNumbers={true} />
          </div>
        </AnimatePresence>
      </motion.nav>
    </div>
  )
}
