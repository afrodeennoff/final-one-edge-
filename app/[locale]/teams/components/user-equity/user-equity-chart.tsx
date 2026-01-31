'use client'

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts'
import { cn } from '@/lib/utils'

interface EquityCurveData {
  date: string
  pnl: number
  cumulativePnL: number
  tradeNumber: number
}

interface DailyEquityData {
  date: string
  dailyPnL: number
  cumulativePnL: number
  tradeCount: number
}

interface UserEquityChartProps {
  equityCurve: EquityCurveData[]
  userId: string
  totalPnL: number
  showDailyView?: boolean
}

// Helper to group trades by day and calculate daily equity
function groupTradesByDay(equityCurve: EquityCurveData[]): DailyEquityData[] {
  if (!equityCurve.length) return []

  // Group trades by date
  const dailyGroups = equityCurve.reduce((acc, trade) => {
    const date = trade.date
    if (!acc[date]) {
      acc[date] = {
        date,
        dailyPnL: 0,
        cumulativePnL: 0,
        tradeCount: 0
      }
    }
    acc[date].dailyPnL += trade.pnl
    acc[date].tradeCount += 1
    return acc
  }, {} as Record<string, DailyEquityData>)

  // Calculate cumulative PnL and sort by date
  const sortedDates = Object.keys(dailyGroups).sort()
  let cumulativePnL = 0

  return sortedDates.map(date => {
    cumulativePnL += dailyGroups[date].dailyPnL
    return {
      ...dailyGroups[date],
      cumulativePnL
    }
  })
}

// Helper to generate "nice" ticks for the X axis (dates)
function getSmartDateTicks(dailyData: DailyEquityData[]) {
  if (!dailyData.length) return []

  const totalDays = dailyData.length
  let step = 1

  // Decide step based on number of days
  if (totalDays > 365) step = 30 // Monthly for >1 year
  else if (totalDays > 90) step = 7 // Weekly for >3 months
  else if (totalDays > 30) step = 3 // Every 3 days for >1 month
  else if (totalDays > 7) step = 1 // Daily for >1 week

  const ticks: string[] = []
  for (let i = 0; i < dailyData.length; i += step) {
    ticks.push(dailyData[i].date)
  }

  // Always include the last date if not already included
  if (dailyData.length > 0 && !ticks.includes(dailyData[dailyData.length - 1].date)) {
    ticks.push(dailyData[dailyData.length - 1].date)
  }

  return ticks
}

// Helper to generate "nice" ticks for the X axis (trade numbers)
function getSmartTicks(equityCurve: EquityCurveData[]) {
  if (!equityCurve.length) return []
  const minTrade = Math.min(...equityCurve.map(d => d.tradeNumber))
  const maxTrade = Math.max(...equityCurve.map(d => d.tradeNumber))
  const range = maxTrade - minTrade

  // Decide step based on range
  let step = 1
  if (range > 5000) step = 1000
  else if (range > 2000) step = 500
  else if (range > 1000) step = 200
  else if (range > 500) step = 100
  else if (range > 200) step = 50
  else if (range > 50) step = 10
  else if (range > 20) step = 5

  // Always include first and last
  const ticks = [minTrade]
  for (let t = minTrade + step; t < maxTrade; t += step) {
    ticks.push(t)
  }
  if (maxTrade !== minTrade) ticks.push(maxTrade)
  return ticks
}

export function UserEquityChart({ equityCurve, userId, totalPnL, showDailyView = true }: UserEquityChartProps) {
  const dailyData = groupTradesByDay(equityCurve)
  const chartData = showDailyView ? dailyData : equityCurve
  const xTicks = showDailyView ? getSmartDateTicks(dailyData) : getSmartTicks(equityCurve)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload
      const date = new Date(showDailyView ? label : data.date)
      const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      })

      return (
        <div className="bg-zinc-950/90 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-2xl min-w-[140px]">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-2 font-mono">
            {showDailyView ? formattedDate : `OP #${data.tradeNumber}`}
          </p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] text-zinc-400 font-bold uppercase">Growth</span>
              <span className={cn("text-[11px] font-black italic", data.cumulativePnL >= 0 ? "text-teal-400" : "text-rose-500")}>
                {data.cumulativePnL >= 0 ? '+' : ''}${data.cumulativePnL.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            {!showDailyView && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Delta</span>
                <span className={cn("text-[10px] font-black font-mono", data.pnl >= 0 ? "text-teal-400/70" : "text-rose-500/70")}>
                  {data.pnl >= 0 ? '+' : ''}${data.pnl.toFixed(0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const chartId = `color-${userId.replace(/[^a-zA-Z0-9-_]/g, '')}`
  const mainColor = totalPnL >= 0 ? "#14b8a6" : "#f43f5e"

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ left: 0, right: 0, top: 4, bottom: 0 }}
        >
          <defs>
            <linearGradient id={chartId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={mainColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="#ffffff"
            strokeOpacity={0.03}
          />
          <XAxis
            dataKey={showDailyView ? "date" : "tradeNumber"}
            hide={true}
          />
          <YAxis
            hide={true}
            domain={['dataMin - 100', 'dataMax + 100']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: mainColor, strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey="cumulativePnL"
            stroke={mainColor}
            fillOpacity={1}
            fill={`url(#${chartId})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
            activeDot={{ r: 3, style: { fill: mainColor, filter: `drop-shadow(0 0 5px ${mainColor})` } }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
