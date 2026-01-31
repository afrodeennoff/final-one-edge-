'use client'

import { Suspense, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { getTeamAnalyticsDataAction } from '../../../actions/analytics'
import { useUserStore } from '@/store/user-store'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { cn } from '@/lib/utils'
import { BarChart3, TrendingUp, Target, Zap, Clock } from 'lucide-react'
import { motion } from 'framer-motion'

interface TeamAnalyticsPageProps {
    params: Promise<{
        slug: string
    }>
}

interface AnalyticsData {
    analytics: any
    membersPerformance: {
        userId: string
        email: string
        totalPnL: number
        winRate: number
        totalTrades: number
    }[]
    chartData: {
        date: string
        dailyPnL: number
        cumulativePnL: number
    }[]
}

export default function TeamAnalyticsPage({ params }: TeamAnalyticsPageProps) {
    const [slug, setSlug] = useState<string>('')
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const { user } = useUserStore()

    useEffect(() => {
        params.then(({ slug }) => setSlug(slug))
    }, [params])

    useEffect(() => {
        const fetchData = async () => {
            if (!slug || !user?.id) return
            try {
                const result = await getTeamAnalyticsDataAction(slug, user.id)
                if (result.success && result.data) {
                    setData(result.data as AnalyticsData)
                }
            } catch (err) {
                console.error(err)
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
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest animate-pulse">Processing Analytics...</p>
        </div>
    )

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 font-mono">
                        {new Date(label).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-xs text-zinc-400 font-medium">Collective Equity</span>
                            <span className={cn("text-sm font-black italic", payload[0].value >= 0 ? "text-teal-400" : "text-rose-500")}>
                                {payload[0].value >= 0 ? '+' : ''}${payload[0].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                </div>
            )
        }
        return null
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-teal-500" />
                        Team Analytics
                    </h1>
                    <p className="text-zinc-500 mt-2 font-medium">Advanced deep-dive into collective performance metrics.</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Main Chart */}
                <Card variant="default" className="lg:col-span-8 border-white/5 flex flex-col min-h-[450px]">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold tracking-tight text-white uppercase italic">Growth Metrics</CardTitle>
                                <CardDescription className="text-xs text-zinc-500 font-medium">Aggregated equity curve across all neural endpoints.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Real-time Data</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-8 pb-4 pl-0 relative">
                        {data?.chartData && data.chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff" strokeOpacity={0.03} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickFormatter={(val) => `$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                        tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#14b8a6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativePnL"
                                        stroke="#14b8a6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPnl)"
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center gap-4 text-zinc-700">
                                <Zap className="h-10 w-10 opacity-20" />
                                <p className="font-mono text-xs uppercase tracking-widest">Awaiting Neural Synchronization</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Leaderboard */}
                <Card variant="default" className="lg:col-span-4 border-white/5 flex flex-col">
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="text-xl font-bold tracking-tight text-white uppercase italic">Fleet Lead</CardTitle>
                        <CardDescription className="text-xs text-zinc-500 font-medium">Top performing operators by realized PnL.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto no-scrollbar pt-6">
                        <div className="space-y-4">
                            {data?.membersPerformance?.slice(0, 8).map((member, i) => (
                                <motion.div
                                    key={member.userId}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all group/item cursor-default"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 text-[10px] font-black text-teal-500 font-mono group-hover/item:border-teal-500/30 transition-colors">
                                            0{i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight truncate max-w-[120px]">{member.email.split('@')[0]}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] text-zinc-500 font-mono font-bold">{member.winRate.toFixed(1)}% WR</span>
                                                <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
                                                <span className="text-[9px] text-zinc-600 font-mono">{member.totalTrades} OPS</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn("text-xs font-black italic", member.totalPnL >= 0 ? "text-teal-400" : "text-rose-500")}>
                                        {member.totalPnL >= 0 ? '+' : ''}${Math.abs(member.totalPnL).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                    </div>
                                </motion.div>
                            ))}
                            {(!data?.membersPerformance || data.membersPerformance.length === 0) && (
                                <div className="text-center py-20 flex flex-col items-center gap-4 opacity-10">
                                    <TrendingUp className="h-10 w-10" />
                                    <p className="font-mono text-[10px] uppercase tracking-widest font-black">Scanning for data...</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {[
                    {
                        label: 'Mean Win Rate',
                        value: `${data?.analytics?.winRate?.toFixed(1) ?? 0}%`,
                        icon: Target
                    },
                    {
                        label: 'Total Operations',
                        value: data?.analytics?.totalTrades ?? 0,
                        icon: Zap
                    },
                    {
                        label: 'Profit Factor',
                        value: data?.analytics?.profitFactor?.toFixed(2) ?? '0.00',
                        icon: TrendingUp
                    },
                    {
                        label: 'Zenith Operator',
                        value: data?.analytics?.bestDay ? (
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-teal-400 font-black italic">+${data.analytics.bestDay.pnl.toFixed(0)}</span>
                                <span className="text-[9px] text-zinc-600 font-mono uppercase font-bold">{new Date(data.analytics.bestDay.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                            </div>
                        ) : 'N/A',
                        icon: Clock
                    }
                ].map((stat, i) => (
                    <Card key={stat.label} variant="default" hover className="border-white/5">
                        <CardHeader className="py-4 flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</CardTitle>
                            <stat.icon className="h-4 w-4 text-teal-500/50" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-white italic tracking-tighter flex items-center justify-between">
                                {typeof stat.value === 'string' || typeof stat.value === 'number' ? stat.value : stat.value}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

