"use client"

import { useData } from "@/context/data-provider"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, Zap } from "lucide-react"
import { startOfDay, isWithinInterval, endOfDay, parseISO } from "date-fns"

export function PnLSummary() {
  const { calendarData, statistics: overallStats } = useData()

  const stats = useMemo(() => {
    const today = new Date()
    const startDay = startOfDay(today)
    const end = endOfDay(today)

    let daily = { pnl: 0, wins: 0, total: 0 }

    Object.entries(calendarData).forEach(([dateStr, data]) => {
      const date = parseISO(dateStr)
      if (isWithinInterval(date, { start: startDay, end })) {
        daily.pnl += (data.pnl || 0)
        daily.total += (data.tradeNumber || 0)
        if (data.trades) {
          data.trades.forEach(t => {
            if ((t.pnl || 0) > 0) daily.wins++
          })
        }
      }
    })

    const winRate = daily.total > 0 ? Math.round((daily.wins / daily.total) * 100) : 0
    return { daily, winRate }
  }, [calendarData])

  const isPositive = stats.daily.pnl >= 0

  return (
    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-md">
      {/* Daily PnL */}
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-fg-muted">Today's PnL</span>
        <div className={cn(
          "flex items-center gap-1.5 font-bold tabular-nums text-xs transition-colors",
          isPositive ? "text-accent-teal" : "text-rose-500"
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          <span>{isPositive ? "+" : ""}{stats.daily.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
        </div>
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Win Rate */}
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-fg-muted">Win Rate</span>
        <div className="flex items-center gap-1.5 font-bold tabular-nums text-xs text-fg-primary">
          <Target className="w-3 h-3 text-accent-teal" />
          <span>{stats.winRate}%</span>
        </div>
      </div>

      <div className="w-px h-4 bg-white/10" />

      {/* Trades */}
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase tracking-widest text-fg-muted">Trades</span>
        <div className="flex items-center gap-1.5 font-bold tabular-nums text-xs text-fg-primary">
          <Zap className="w-3 h-3 text-amber-500" />
          <span>{stats.daily.total}</span>
        </div>
      </div>
    </div>
  )
}
