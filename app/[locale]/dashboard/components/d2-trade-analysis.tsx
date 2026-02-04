'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Target,
  Activity,
  Filter,
  Download,
  RefreshCw
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface TradeAnalysisData {
  totalTrades: number
  winRate: number
  profitFactor: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  sharpeRatio: number
  totalPnL: number
  bestDay: number
  worstDay: number
  instruments: Array<{
    symbol: string
    trades: number
    winRate: number
    pnl: number
  }>
  timeAnalysis: Array<{
    hour: number
    trades: number
    winRate: number
    pnl: number
  }>
}

export function D2TradeAnalysis() {
  const t = useI18n()
  const [analysisData, setAnalysisData] = useState<TradeAnalysisData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('30d')
  const [selectedInstrument, setSelectedInstrument] = useState('all')

  useEffect(() => {
    loadAnalysisData()
  }, [timeframe, selectedInstrument])

  const loadAnalysisData = async () => {
    setIsLoading(true)
    try {
      // Simulate API call to get trade analysis data
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const mockData: TradeAnalysisData = {
        totalTrades: 127,
        winRate: 68.5,
        profitFactor: 1.87,
        avgWin: 156.32,
        avgLoss: -84.15,
        maxDrawdown: -2.3,
        sharpeRatio: 1.42,
        totalPnL: 2847.65,
        bestDay: 420.50,
        worstDay: -156.30,
        instruments: [
          { symbol: 'ES', trades: 45, winRate: 71.1, pnl: 1245.30 },
          { symbol: 'NQ', trades: 32, winRate: 65.6, pnl: 892.15 },
          { symbol: 'CL', trades: 28, winRate: 67.9, pnl: 456.80 },
          { symbol: 'GC', trades: 22, winRate: 72.7, pnl: 253.40 }
        ],
        timeAnalysis: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          trades: Math.floor(Math.random() * 15) + 1,
          winRate: Math.random() * 30 + 55,
          pnl: (Math.random() - 0.5) * 200
        }))
      }
      
      setAnalysisData(mockData)
    } catch (error) {
      console.error('Failed to load analysis data:', error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Trade Analysis</h2>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analysisData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trade Analysis</h2>
          <p className="text-muted-foreground mt-1">
            Comprehensive performance metrics and insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-1.5 text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalysisData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {formatPercentage(analysisData.winRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analysisData.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total P&L
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              analysisData.totalPnL >= 0 ? "text-green-500" : "text-red-500"
            )}>
              {formatCurrency(analysisData.totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Net profit/loss
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Profit Factor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {analysisData.profitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Risk-reward ratio
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {analysisData.sharpeRatio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Risk-adjusted returns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Instrument Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData.instruments.map((instrument) => (
                <div key={instrument.symbol} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">{instrument.symbol}</span>
                    </div>
                    <div>
                      <div className="font-medium">{instrument.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {instrument.trades} trades
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "font-bold",
                      instrument.pnl >= 0 ? "text-green-500" : "text-red-500"
                    )}>
                      {formatCurrency(instrument.pnl)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(instrument.winRate)} win rate
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Time of Day Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-1">
              {analysisData.timeAnalysis.slice(0, 12).map((hourData) => (
                <div key={hourData.hour} className="flex flex-col items-center flex-1">
                  <div 
                    className={cn(
                      "w-full rounded-t transition-all duration-300",
                      hourData.pnl >= 0 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-red-500 hover:bg-red-600"
                    )}
                    style={{ 
                      height: `${Math.abs(hourData.pnl) / 2}px`,
                      minHeight: '4px'
                    }}
                  />
                  <div className="text-xs text-muted-foreground mt-2">
                    {hourData.hour}:00
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Average Win</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(analysisData.avgWin)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Loss</div>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(analysisData.avgLoss)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Best Day</div>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(analysisData.bestDay)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Worst Day</div>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(analysisData.worstDay)}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                <div className="text-2xl font-bold text-red-500">
                  {formatPercentage(analysisData.maxDrawdown)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="text-2xl font-bold text-foreground">
                  {analysisData.totalTrades}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}