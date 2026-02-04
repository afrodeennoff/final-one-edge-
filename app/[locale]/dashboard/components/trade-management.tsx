import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2,
  Search,
  Filter
} from "lucide-react";
import { useI18n } from "@/locales/client";

interface Trade {
  id: string;
  date: Date;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice: number;
  commission: number;
  pnl: number;
  notes: string;
  tags: string[];
}

export default function TradeManagement() {
  const t = useI18n();
  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "1",
      date: new Date(2024, 0, 15),
      symbol: "ES",
      side: "buy",
      quantity: 1,
      entryPrice: 4500,
      exitPrice: 4525,
      commission: 2.5,
      pnl: 22.5,
      notes: "Good setup, took profits early",
      tags: ["win", "breakout"]
    },
    {
      id: "2",
      date: new Date(2024, 0, 14),
      symbol: "NQ",
      side: "sell",
      quantity: 2,
      entryPrice: 15200,
      exitPrice: 15150,
      commission: 5,
      pnl: 95,
      notes: "Perfect short setup, held to target",
      tags: ["win", "trend-following"]
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    symbol: '',
    side: 'buy' as 'buy' | 'sell',
    quantity: '',
    entryPrice: '',
    exitPrice: '',
    commission: '0',
    notes: '',
    tags: ''
  });

  const filteredTrades = trades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const calculatePnL = () => {
    if (!formData.entryPrice || !formData.exitPrice || !formData.quantity) return 0;
    const entry = parseFloat(formData.entryPrice);
    const exit = parseFloat(formData.exitPrice);
    const qty = parseFloat(formData.quantity);
    const commission = parseFloat(formData.commission) || 0;
    
    const priceDiff = formData.side === 'buy' ? exit - entry : entry - exit;
    return (priceDiff * qty) - commission;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTrade: Trade = {
      id: editingTrade?.id || Date.now().toString(),
      date: new Date(formData.date),
      symbol: formData.symbol.toUpperCase(),
      side: formData.side,
      quantity: parseFloat(formData.quantity),
      entryPrice: parseFloat(formData.entryPrice),
      exitPrice: parseFloat(formData.exitPrice),
      commission: parseFloat(formData.commission),
      pnl: calculatePnL(),
      notes: formData.notes,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    };

    if (editingTrade) {
      setTrades(prev => prev.map(trade => 
        trade.id === editingTrade.id ? newTrade : trade
      ));
      setEditingTrade(null);
    } else {
      setTrades(prev => [newTrade, ...prev]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      symbol: '',
      side: 'buy',
      quantity: '',
      entryPrice: '',
      exitPrice: '',
      commission: '0',
      notes: '',
      tags: ''
    });
    setIsAdding(false);
  };

  const handleEdit = (trade: Trade) => {
    setEditingTrade(trade);
    setFormData({
      date: trade.date.toISOString().split('T')[0],
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity.toString(),
      entryPrice: trade.entryPrice.toString(),
      exitPrice: trade.exitPrice.toString(),
      commission: trade.commission.toString(),
      notes: trade.notes,
      tags: trade.tags.join(', ')
    });
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    setTrades(prev => prev.filter(trade => trade.id !== id));
  };

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 
    : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Trade Management</h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your trading activities
          </p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="h-4 w-4" />
          {isAdding ? 'Cancel' : 'Add Trade'}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingTrade ? 'Edit Trade' : 'Add New Trade'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => setFormData({...formData, symbol: e.target.value})}
                    placeholder="e.g., ES, NQ"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Side</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.side === 'buy' ? "default" : "outline"}
                      onClick={() => setFormData({...formData, side: 'buy'})}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button
                      type="button"
                      variant={formData.side === 'sell' ? "default" : "outline"}
                      onClick={() => setFormData({...formData, side: 'sell'})}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                    placeholder="1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="commission">Commission</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    value={formData.commission}
                    onChange={(e) => setFormData({...formData, commission: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entryPrice">Entry Price</Label>
                  <Input
                    id="entryPrice"
                    type="number"
                    step="0.01"
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({...formData, entryPrice: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exitPrice">Exit Price</Label>
                  <Input
                    id="exitPrice"
                    type="number"
                    step="0.01"
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({...formData, exitPrice: e.target.value})}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {formData.entryPrice && formData.exitPrice && formData.quantity && (
                <div className="p-3 rounded-lg bg-muted">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated P&L:</span>
                    <span className={`text-lg font-bold ${
                      calculatePnL() >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {calculatePnL() >= 0 ? '+' : ''}${calculatePnL().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({...formData, tags: e.target.value})}
                  placeholder="e.g., breakout, trend-following, scalping"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Trade setup, execution notes, lessons learned..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1">
                  {editingTrade ? 'Update Trade' : 'Add Trade'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total P&L</CardDescription>
            <CardTitle className={totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Win Rate</CardDescription>
            <CardTitle className="text-blue-600">
              {winRate.toFixed(1)}%
            </CardTitle>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Trades</CardDescription>
            <CardTitle>{trades.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Trade History</CardTitle>
              <CardDescription>All your recorded trades</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTrades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {trade.side === 'buy' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{trade.symbol}</span>
                      <Badge variant={trade.pnl >= 0 ? "secondary" : "destructive"}>
                        {trade.side.toUpperCase()} {trade.quantity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {trade.date.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {trade.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {trade.notes && (
                    <p className="text-sm text-muted-foreground truncate">
                      {trade.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`text-right font-medium ${
                    trade.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(trade)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(trade.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTrades.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No trades found matching your search
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}