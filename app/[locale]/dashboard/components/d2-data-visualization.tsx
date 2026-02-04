'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts'
import { 
  TrendingUp, BarChart3, PieChartIcon, Calendar, 
  Download, RefreshCw, Filter 
} from "lucide-react"
import { useI18n } from "@/locales/client"
import { motion } from "framer-motion"

// Mock data for demonstration
const mockPerformanceData = [
  { date: '2024-01', pnl: 1200, trades: 25 },
  { date: '2024-02', pnl: -800, trades: 18 },
  { date: '2024-03', pnl: 2100, trades: 32 },
  { date: '2024-04', pnl: 1500, trades: 28 },
  { date: '2024-05', pnl: -300, trades: 15 },
  { date: '2024-06', pnl: 2800, trades: 35 },
]

const mockInstrumentData = [
  { name: 'ES', value: 45, pnl: 3200 },
  { name: 'NQ', value: 30, pnl: 1800 },
  { name: 'CL', value: 15, pnl: -500 },
  { name: 'GC', value: 10, pnl: 1200 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export function D2DataVisualization() {
  const t = useI18n()
  const [timeframe, setTimeframe] = useState('6M')
  const [chartType, setChartType] = useState('line')
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant={timeframe === '1M' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeframe('1M')}
          >
            1M
          </Button>
          <Button 
            variant={timeframe === '3M' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeframe('3M')}
          >
            3M
          </Button>
          <Button 
            variant={timeframe === '6M' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeframe('6M')}
          >
            6M
          </Button>
          <Button 
            variant={timeframe === '1Y' ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeframe('1Y')}
          >
            1Y
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Performance Chart */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent-teal" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0,0,0,0.8)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="pnl" 
                  stroke="#00c49f" 
                  strokeWidth={2}
                  dot={{ fill: '#00c49f', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#00c49f' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trades by Instrument */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-400" />
              Trades by Instrument
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockInstrumentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.7)"
                    tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* PnL Distribution */}
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-amber-400" />
              PnL Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockInstrumentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="pnl"
                  >
                    {mockInstrumentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">+$4,700</div>
            <div className="text-sm text-muted-foreground">Total PnL</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">173</div>
            <div className="text-sm text-muted-foreground">Total Trades</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-400">68.2%</div>
            <div className="text-sm text-muted-foreground">Win Rate</div>
          </CardContent>
        </Card>
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-400">2.1</div>
            <div className="text-sm text-muted-foreground">Profit Factor</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}