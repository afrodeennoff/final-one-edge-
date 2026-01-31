'use client'

import { Suspense, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Users, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { getTeamOverviewDataAction } from '../../actions/overview'
import { useUserStore } from '@/store/user-store'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TeamOverviewPageProps {
  params: Promise<{
    slug: string
  }>
}

interface OverviewData {
  totalBalance: number
  activeTraders: number
  totalPnl: number
  winRate: number
  recentActivity: {
    id: string
    type: string
    description: string
    amount: number
    date: string | Date
    userEmail: string
  }[]
}

export default function TeamOverviewPage({ params }: TeamOverviewPageProps) {
  const [slug, setSlug] = useState<string>('')
  const [data, setData] = useState<OverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { user } = useUserStore()

  useEffect(() => {
    params.then(({ slug }) => setSlug(slug))
  }, [params])

  useEffect(() => {
    const fetchData = async () => {
      if (!slug || !user?.id) return
      setLoading(true)
      try {
        const result = await getTeamOverviewDataAction(slug, user.id)
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.error || 'Failed to load data')
        }
      } catch (err) {
        console.error(err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug, user?.id])

  if (!slug || loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/20"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-teal-500 animate-spin"></div>
      </div>
      <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Syncing Team Data...</p>
    </div>
  )

  if (error) return (
    <div className="p-8 text-red-500 bg-red-500/5 border border-red-500/10 rounded-2xl">
      <h2 className="font-bold mb-1">Terminal Error</h2>
      <p className="text-sm opacity-80">{error}</p>
    </div>
  )

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
            <Zap className="h-8 w-8 text-teal-500" />
            Team Overview
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">Real-time performance analytics and collective metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card variant="default" hover className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Total Capital</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-white">
              ${data?.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" hover className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Active Operators</CardTitle>
            <Users className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-white">{data?.activeTraders ?? 0}</div>
            <p className="text-[10px] text-zinc-500 uppercase font-bold mt-1 tracking-wider italic">Deployed in last 7 days</p>
          </CardContent>
        </Card>

        <Card variant="default" hover className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Collective PnL</CardTitle>
            <TrendingUp className={cn("h-4 w-4", (data?.totalPnl ?? 0) >= 0 ? "text-teal-400" : "text-rose-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-3xl font-black tracking-tighter", (data?.totalPnl ?? 0) >= 0 ? "text-teal-400" : "text-rose-500")}>
              {(data?.totalPnl ?? 0) >= 0 ? '+' : ''}${Math.abs(data?.totalPnl ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card variant="default" hover className="border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Efficiency Rate</CardTitle>
            <Activity className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black tracking-tighter text-white">{data?.winRate.toFixed(1) ?? '0.0'}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-12">
        <Card variant="default" className="lg:col-span-8 border-white/5 min-h-[400px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <div>
              <CardTitle className="text-xl font-bold tracking-tight text-white uppercase italic">Growth Analysis</CardTitle>
              <p className="text-xs text-zinc-500 font-medium">Historical performance and equity curve.</p>
            </div>
            <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20 text-[10px] font-bold uppercase tracking-widest">
              Live Stream
            </Badge>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Dynamic Visual Element instead of empty chart */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center gap-6">
              <div className="flex gap-2 items-end h-32">
                {[40, 60, 45, 75, 55, 90, 80, 100, 85, 110, 95, 120].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                    className="w-4 bg-gradient-to-t from-teal-500/20 to-teal-500/60 rounded-t-sm"
                  />
                ))}
              </div>
              <div className="text-center">
                <span className="text-sm font-bold text-white uppercase tracking-widest italic opacity-50">Advanced Visualization Coming Soon</span>
                <div className="flex gap-4 mt-4 justify-center">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-teal-500" />
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Equity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-teal-500/20" />
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Drawdown</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="default" className="lg:col-span-4 border-white/5 flex flex-col h-full">
          <CardHeader className="border-b border-white/5 pb-4">
            <CardTitle className="text-xl font-bold tracking-tight text-white uppercase italic">Neural Sync</CardTitle>
            <p className="text-xs text-zinc-500 font-medium">Recent operational updates.</p>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto no-scrollbar pt-6">
            <div className="space-y-6">
              {data?.recentActivity?.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-12 flex flex-col items-center gap-4">
                  <Activity className="h-8 w-8 opacity-10" />
                  <p className="font-mono uppercase tracking-widest text-xs">No activity detected</p>
                </div>
              ) : (
                data?.recentActivity.map((activity) => (
                  <div key={activity.id} className="relative pl-6 pb-2 border-l border-white/5 last:border-0 group/activity">
                    <div className="absolute left-[-4.5px] top-1.5 h-2 w-2 rounded-full bg-teal-500/20 border border-teal-500/50 group-hover/activity:bg-teal-500 transition-colors" />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[150px]">
                          {activity.description}
                        </p>
                        <div className={cn("text-[10px] font-black font-mono", activity.amount >= 0 ? "text-teal-400" : "text-rose-500")}>
                          {activity.amount >= 0 ? '+' : ''}${Math.abs(activity.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] text-zinc-500 font-mono uppercase">{activity.userEmail}</span>
                        <span className="text-[9px] text-zinc-600 font-mono italic">
                          {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {(data?.recentActivity?.length ?? 0) > 0 && (
              <Button variant="ghost" className="w-full mt-6 text-[10px] text-zinc-500 hover:text-teal-400 uppercase tracking-widest font-black transition-colors">
                View All Activity
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) {
  return (
    <div className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors", className)}>
      {children}
    </div>
  )
}

function Button({ children, variant, className, onClick }: { children: React.ReactNode, variant?: string, className?: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50", className)}>
      {children}
    </button>
  )
}

