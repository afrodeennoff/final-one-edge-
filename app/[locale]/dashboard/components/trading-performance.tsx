import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Calendar,
  Target
} from "lucide-react";
import { useI18n } from "@/locales/client";

export default function TradingPerformance() {
  const t = useI18n();

  // Mock data for demonstration
  const performanceData = {
    totalPnL: 1247.85,
    winRate: 68.5,
    totalTrades: 142,
    winningTrades: 97,
    avgWin: 32.45,
    avgLoss: -18.75,
    profitFactor: 1.87,
    maxDrawdown: -156.30,
    sharpeRatio: 1.42
  };

  const metrics = [
    {
      title: "Total P&L",
      value: `$${performanceData.totalPnL.toLocaleString()}`,
      change: "+12.5%",
      icon: DollarSign,
      positive: true
    },
    {
      title: "Win Rate",
      value: `${performanceData.winRate}%`,
      change: "+3.2%",
      icon: TrendingUp,
      positive: true
    },
    {
      title: "Total Trades",
      value: performanceData.totalTrades.toString(),
      change: "+15",
      icon: BarChart3,
      positive: true
    },
    {
      title: "Profit Factor",
      value: performanceData.profitFactor.toFixed(2),
      change: "+0.15",
      icon: Target,
      positive: true
    }
  ];

  const recentTrades = [
    {
      id: "1",
      symbol: "ES",
      date: new Date(2024, 0, 15),
      pnl: 22.50,
      type: "long"
    },
    {
      id: "2",
      symbol: "NQ",
      date: new Date(2024, 0, 14),
      pnl: 95.00,
      type: "short"
    },
    {
      id: "3",
      symbol: "CL",
      date: new Date(2024, 0, 14),
      pnl: -12.75,
      type: "long"
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trading Performance</h1>
        <p className="text-muted-foreground mt-2">
          Analyze your trading performance and key metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {metric.title}
                  </CardDescription>
                  <Badge 
                    variant={metric.positive ? "secondary" : "destructive"}
                    className={metric.positive ? "bg-green-100 text-green-800" : ""}
                  >
                    {metric.change}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>
              Key trading performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Avg Win</div>
                <div className="text-lg font-semibold text-green-600">
                  +${performanceData.avgWin.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Avg Loss</div>
                <div className="text-lg font-semibold text-red-600">
                  ${performanceData.avgLoss.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Max Drawdown</div>
                <div className="text-lg font-semibold text-red-600">
                  ${performanceData.maxDrawdown.toFixed(2)}
                </div>
              </div>
              <div className="p-3 rounded-lg border">
                <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
                <div className="text-lg font-semibold text-blue-600">
                  {performanceData.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Recent Trades
            </CardTitle>
            <CardDescription>
              Latest trade results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      trade.pnl >= 0 ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {trade.pnl >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{trade.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {trade.date.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-right font-semibold ${
                    trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
          <CardDescription>
            Cumulative P&L over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Performance chart visualization would appear here
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}