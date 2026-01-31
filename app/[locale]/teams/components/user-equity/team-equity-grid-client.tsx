'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { getTeamEquityData, exportTeamTradesAction } from '../../actions/stats'
import { Suspense } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { UserEquityChart } from './user-equity-chart'
import { ExternalLink, Download, Filter, X, TrendingUp, Users, Target, Zap, Waves, Calendar } from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/locales/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface UserEquityData {
  userId: string
  email: string
  createdAt: string
  trades: any[]
  equityCurve: {
    date: string
    pnl: number
    cumulativePnL: number
    tradeNumber: number
  }[]
  statistics: {
    totalTrades: number
    totalPnL: number
    winRate: number
    averageWin: number
    averageLoss: number
    maxDrawdown: number
    profitFactor: number
    winningTrades: number
    losingTrades: number
  }
}

interface TeamEquityGridClientProps {
  teamId: string
}

interface Filters {
  minTrades: number
  minTradedDays: number
  equityFilter: 'all' | 'positive' | 'negative'
}

export function TeamEquityGridClient({ teamId }: TeamEquityGridClientProps) {
  const t = useI18n()
  const [users, setUsers] = useState<UserEquityData[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const [showDailyView, setShowDailyView] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    minTrades: 0,
    minTradedDays: 0,
    equityFilter: 'all'
  })

  const loadingRef = useRef<HTMLDivElement>(null)

  const getTradedDays = (equityCurve: UserEquityData['equityCurve']) => {
    const uniqueDates = new Set(equityCurve.map(trade => trade.date))
    return uniqueDates.size
  }

  const filteredUsers = users.filter(user => {
    const tradedDays = getTradedDays(user.equityCurve)
    if (user.statistics.totalTrades < filters.minTrades) return false
    if (tradedDays < filters.minTradedDays) return false
    if (filters.equityFilter === 'positive' && user.statistics.totalPnL <= 0) return false
    if (filters.equityFilter === 'negative' && user.statistics.totalPnL >= 0) return false
    return true
  })

  const loadMoreUsers = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    setIsLoadingMore(true)
    try {
      const data = await getTeamEquityData(teamId, currentPage, 10)
      setUsers(prev => [...prev, ...data.users])
      setHasMore(data.hasMore)
      setCurrentPage(currentPage + 1)
    } catch (error) {
      console.error('Error loading more users:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }, [teamId, currentPage, hasMore, isLoadingMore])

  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true)
      try {
        const data = await getTeamEquityData(teamId, 1, 10)
        setUsers(data.users)
        setHasMore(data.hasMore)
        setCurrentPage(2)
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }
    loadInitialData()
  }, [teamId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreUsers()
        }
      },
      { threshold: 0.1 }
    )
    if (loadingRef.current) observer.observe(loadingRef.current)
    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMoreUsers])

  const clearFilters = () => {
    setFilters({ minTrades: 0, minTradedDays: 0, equityFilter: 'all' })
  }

  const handleExportTrades = async () => {
    setIsExporting(true)
    try {
      const csv = await exportTeamTradesAction(teamId)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `team-trades-${teamId}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(t('teams.equity.exportSuccess'))
    } catch (error) {
      console.error('Error exporting trades:', error)
      toast.error(t('teams.equity.exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  const hasActiveFilters = filters.minTrades > 0 || filters.minTradedDays > 0 || filters.equityFilter !== 'all'

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
          <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin" />
        </div>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest animate-pulse font-black">Decrypting Squad Data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-zinc-950/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Switch
                id="view-mode"
                checked={showDailyView}
                onCheckedChange={setShowDailyView}
                className="data-[state=checked]:bg-teal-500"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="view-mode" className="text-xs font-black uppercase tracking-widest text-white cursor-pointer select-none">
                {showDailyView ? "Daily View" : "Sequential View"}
              </Label>
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">Grouped by active sessions</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportTrades}
            disabled={isExporting || users.length === 0}
            className="rounded-xl border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-black uppercase tracking-widest h-10 px-6 transition-all"
          >
            <Download className="h-4 w-4 mr-2 text-teal-500" />
            {isExporting ? "Exporting..." : "Dump Stats"}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-xl border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-xs font-black uppercase tracking-widest h-10 px-6 transition-all",
              showFilters && "bg-teal-500/10 border-teal-500/30 text-teal-400"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 h-1.5 w-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card variant="default" className="border-white/5 p-6 rounded-3xl mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-1 p-1 w-8 bg-teal-500 rounded-full" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Parameter Calibration</h3>
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[10px] uppercase font-black tracking-widest text-zinc-600 hover:text-rose-500 transition-colors">
                    <X className="h-3 w-3 mr-2" /> Reset Core
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Min. Operations</Label>
                  <Input
                    type="number"
                    value={filters.minTrades}
                    onChange={(e) => setFilters(prev => ({ ...prev, minTrades: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 h-10 text-sm font-bold text-white focus:border-teal-500/50 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Min. Active Days</Label>
                  <Input
                    type="number"
                    value={filters.minTradedDays}
                    onChange={(e) => setFilters(prev => ({ ...prev, minTradedDays: parseInt(e.target.value) || 0 }))}
                    className="bg-white/5 border-white/10 h-10 text-sm font-bold text-white focus:border-teal-500/50 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Sentiment Filter</Label>
                  <Select
                    value={filters.equityFilter}
                    onValueChange={(value: 'all' | 'positive' | 'negative') => setFilters(prev => ({ ...prev, equityFilter: value }))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 h-10 text-sm font-bold text-white focus:border-teal-500/50 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-950 border-white/10">
                      <SelectItem value="all">Global Matrix</SelectItem>
                      <SelectItem value="positive">Profit Surplus</SelectItem>
                      <SelectItem value="negative">Deficit Focus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers
          .filter(user => user.statistics.totalTrades > 0)
          .map((user, index) => {
            const tradedDays = getTradedDays(user.equityCurve)

            return (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="default" hover className="border-white/5 flex flex-col h-full group/card overflow-hidden">
                  <CardContent className="p-6 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 rounded-lg bg-teal-500/10 flex items-center justify-center text-[10px] font-black text-teal-500 font-mono border border-teal-500/20">
                            {user.email[0].toUpperCase()}
                          </div>
                          <h3 className="font-bold text-sm text-white truncate uppercase tracking-tighter" title={user.email}>
                            {user.email.split('@')[0]}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black italic border",
                          user.statistics.totalPnL >= 0
                            ? 'bg-teal-500/10 text-teal-400 border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        )}>
                          {user.statistics.totalPnL >= 0 ? '+' : ''}{user.statistics.totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <Link
                          href={`/teams/dashboard/trader/${user.userId}`}
                          target="_blank"
                          className="p-1.5 bg-white/5 border border-white/5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 hover:border-white/10 transition-all"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Performance Summary Rows */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3 group-hover/card:border-white/10 transition-all">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Efficiency</span>
                        <span className="text-sm font-black text-white italic">{user.statistics.winRate.toFixed(1)}%</span>
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-xl p-3 group-hover/card:border-white/10 transition-all">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Total Ops</span>
                        <span className="text-sm font-black text-white italic">{user.statistics.totalTrades}</span>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="relative h-32 w-full mt-4">
                      <UserEquityChart
                        equityCurve={user.equityCurve}
                        userId={user.userId}
                        totalPnL={user.statistics.totalPnL}
                        showDailyView={showDailyView}
                      />
                    </div>

                    {/* Secondary Metrics */}
                    <div className="pt-4 border-t border-white/5">
                      <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Best Hit</span>
                          <span className="text-[10px] font-black text-teal-500 font-mono">+${user.statistics.averageWin.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Peak Draw</span>
                          <span className="text-[10px] font-black text-rose-500 font-mono">${Math.abs(user.statistics.maxDrawdown).toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Win Count</span>
                          <span className="text-[10px] font-black text-zinc-300 font-mono">{user.statistics.winningTrades}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight">Profit Factor</span>
                          <span className="text-[10px] font-black text-zinc-300 font-mono">{user.statistics.profitFactor.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
      </div>

      {hasMore && (
        <div ref={loadingRef} className="flex justify-center py-12">
          {isLoadingMore ? (
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-bounce [animation-delay:-0.3s]" />
            </div>
          ) : (
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700 animate-pulse">Syncing deeper data...</div>
          )}
        </div>
      )}

      {!hasMore && filteredUsers.length > 0 && (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-700">All neural endpoints synchronized.</p>
        </div>
      )}

      {!isInitialLoading && filteredUsers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Zap className="h-12 w-12 text-zinc-800 mb-6 opacity-20" />
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Zero Signals Detected</h3>
          <p className="text-zinc-600 max-w-xs mt-2 text-sm font-medium">No operators matching your calibration parameters found.</p>
        </div>
      )}
    </div>
  )
} 