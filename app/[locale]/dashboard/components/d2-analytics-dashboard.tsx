'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Activity,
  Filter,
  RefreshCw,
  Settings
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  entryPrice: number
  exitPrice: number
  pnl: number
  date: string
  status: 'win' | 'loss' | 'breakeven'
}

interface PerformanceMetrics {
  totalTrades: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  totalPnL: number
}

export default function D2AnalyticsDashboard() {
  const t = useI18n()
  const [trades, setTrades] = useState<Trade[]>([])
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    totalTrades: 0,
    winRate: 0,
    profitFactor: 0,
    avgWin: 0,
    avgLoss: 0,
    maxDrawdown: 0,
    totalPnL: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')

  // Mock data for demonstration
  useEffect(() => {
    const mockTrades: Trade[] = [
      {
        id: '1',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        entryPrice: 150.25,
        exitPrice: 155.50,
        pnl: 525.00,
        date: '2024-01-15',
        status: 'win'
      },
      {
        id: '2',
        symbol: 'GOOGL',
        side: 'sell',
        quantity: 50,
        entryPrice: 2800.00,
        exitPrice: 2750.00,
        pnl: -2500.00,
        date: '2024-01-14',
        status: 'loss'
      },
      {
        id: '3',
        symbol: 'TSLA',
        side: 'buy',
        quantity: 200,
        entryPrice: 245.50,
        exitPrice: 245.50,
        pnl: 0,
        date: '2024-01-13',
        status: 'breakeven'
      }
    ]

    const mockMetrics: PerformanceMetrics = {
      totalTrades: 127,
      winRate: 68.5,
      profitFactor: 1.85,
      avgWin: 1250.75,
      avgLoss: -675.25,
      maxDrawdown: -12.5,
      totalPnL: 45250.00
    }

    setTimeout(() => {
      setTrades(mockTrades)
      setMetrics(mockMetrics)
      setIsLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'win': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'loss': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'breakeven': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="w-full h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Analytics</h1>
          <p className="text-muted-foreground mt-1">Monitor your trading performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTrades}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatPercentage(metrics.winRate)}
            </div>
            <p className="text-xs text-muted-foreground">Success ratio</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {metrics.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Risk/reward ratio</p>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              metrics.totalPnL >= 0 ? "text-green-400" : "text-red-400"
            )}>
              {formatCurrency(metrics.totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">Net profit/loss</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Trades */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Trades
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded w-20"></div>
                    <div className="h-3 bg-white/10 rounded w-32"></div>
                  </div>
                  <div className="h-4 bg-white/20 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {trades.map((trade) => (
                <motion.div
                  key={trade.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="font-medium">{trade.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        {trade.side.toUpperCase()} {trade.quantity} @ {formatCurrency(trade.entryPrice)}
                      </span>
                    </div>
                    <Badge className={getStatusColor(trade.status)}>
                      {trade.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-medium",
                      trade.pnl >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {formatCurrency(trade.pnl)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(trade.date).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timeframe Selector */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border bg-white/5 p-1">
          {['7d', '30d', '90d', '1y', 'all'].map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "ghost"}
              size="sm"
              className={cn(
                "px-3 py-1.5 text-xs",
                timeframe === period 
                  ? "bg-accent-teal text-white" 
                  : "hover:bg-white/10"
              )}
              onClick={() => setTimeframe(period)}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}