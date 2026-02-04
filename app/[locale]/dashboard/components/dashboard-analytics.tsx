'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, DollarSign, BarChart3 } from 'lucide-react'
import { useI18n } from "@/locales/client"
import { Button } from "@/components/ui/button"
import { format } from 'date-fns'

// Mock data - replace with actual data from your store/context
const mockPnLData = [
  { date: '2024-01-01', pnl: 120, trades: 5 },
  { date: '2024-01-02', pnl: -80, trades: 3 },
  { date: '2024-01-03', pnl: 250, trades: 7 },
  { date: '2024-01-04', pnl: 180, trades: 4 },
  { date: '2024-01-05', pnl: -120, trades: 6 },
  { date: '2024-01-06', pnl: 300, trades: 8 },
  { date: '2024-01-07', pnl: 150, trades: 5 },
]

const mockWinLossData = [
  { name: 'Winners', value: 65, color: '#10B981' },
  { name: 'Losers', value: 35, color: '#EF4444' },
]

const mockInstrumentPerformance = [
  { instrument: 'ES', pnl: 1250, trades: 25 },
  { instrument: 'NQ', pnl: 890, trades: 18 },
  { instrument: 'CL', pnl: -420, trades: 12 },
  { instrument: 'GC', pnl: 680, trades: 15 },
]

export default function DashboardAnalytics() {
  const t = useI18n()
  const [timeframe, setTimeframe] = useState('7d')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  // Calculate summary statistics
  const totalPnL = mockPnLData.reduce((sum, day) => sum + day.pnl, 0)
  const totalTrades = mockPnLData.reduce((sum, day) => sum + day.trades, 0)
  const winRate = mockWinLossData[0].value
  const avgTrade = totalTrades > 0 ? totalPnL / totalTrades : 0

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(totalPnL)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalTrades} trades executed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {winRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Profitable trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Trade</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgTrade >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(avgTrade)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per trade average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPnLData.length} days
            </div>
            <p className="text-xs text-muted-foreground">
              Selected timeframe
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* P&L Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>P&L Over Time</CardTitle>
            <CardDescription>Daily profit and loss performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockPnLData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(Number(value)), 'P&L']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pnl" 
                    stroke={totalPnL >= 0 ? "#10B981" : "#EF4444"} 
                    strokeWidth={2}
                    dot={{ fill: totalPnL >= 0 ? "#10B981" : "#EF4444", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Win/Loss Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Trade outcome distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockWinLossData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {mockWinLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instrument Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Instrument Performance</CardTitle>
          <CardDescription>P&L by trading instrument</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockInstrumentPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="instrument" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip 
                  formatter={(value) => [formatCurrency(Number(value)), 'P&L']}
                  labelFormatter={(label) => `Instrument: ${label}`}
                />
                <Bar dataKey="pnl" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}