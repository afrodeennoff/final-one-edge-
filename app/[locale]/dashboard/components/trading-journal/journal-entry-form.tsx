import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  X
} from "lucide-react";
import { useI18n } from "@/locales/client";

interface JournalEntryFormProps {
  onSubmit: (entry: any) => void;
  onCancel: () => void;
}

export default function JournalEntryForm({ onSubmit, onCancel }: JournalEntryFormProps) {
  const t = useI18n();
  const [entry, setEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    market: '',
    instrument: '',
    direction: 'long' as 'long' | 'short',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    commission: '',
    notes: '',
    emotions: [] as string[],
    lessons: [] as string[]
  });

  const emotions = ['Fear', 'Greed', 'Confidence', 'Doubt', 'Excitement', 'Frustration'];
  const lessons = ['Risk Management', 'Position Sizing', 'Market Analysis', 'Psychology', 'Strategy'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...entry,
      id: Date.now().toString(),
      pnl: calculatePnL(),
      createdAt: new Date()
    });
  };

  const calculatePnL = () => {
    if (!entry.entryPrice || !entry.exitPrice || !entry.quantity) return 0;
    const entryPrice = parseFloat(entry.entryPrice);
    const exitPrice = parseFloat(entry.exitPrice);
    const quantity = parseFloat(entry.quantity);
    const commission = parseFloat(entry.commission) || 0;
    
    const priceDiff = entry.direction === 'long' 
      ? exitPrice - entryPrice 
      : entryPrice - exitPrice;
    
    return (priceDiff * quantity) - commission;
  };

  const toggleEmotion = (emotion: string) => {
    setEntry(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }));
  };

  const toggleLesson = (lesson: string) => {
    setEntry(prev => ({
      ...prev,
      lessons: prev.lessons.includes(lesson)
        ? prev.lessons.filter(l => l !== lesson)
        : [...prev.lessons, lesson]
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Journal Entry
        </CardTitle>
        <CardDescription>
          Document your trade analysis and insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={entry.date}
                  onChange={(e) => setEntry({...entry, date: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={entry.time}
                  onChange={(e) => setEntry({...entry, time: e.target.value})}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Input
                id="market"
                value={entry.market}
                onChange={(e) => setEntry({...entry, market: e.target.value})}
                placeholder="e.g., ES, NQ, CL"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="instrument">Instrument</Label>
              <Input
                id="instrument"
                value={entry.instrument}
                onChange={(e) => setEntry({...entry, instrument: e.target.value})}
                placeholder="e.g., E-mini S&P 500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Direction</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={entry.direction === 'long' ? "default" : "outline"}
                  onClick={() => setEntry({...entry, direction: 'long'})}
                  className="flex-1"
                >
                  Long
                </Button>
                <Button
                  type="button"
                  variant={entry.direction === 'short' ? "default" : "outline"}
                  onClick={() => setEntry({...entry, direction: 'short'})}
                  className="flex-1"
                >
                  Short
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                value={entry.quantity}
                onChange={(e) => setEntry({...entry, quantity: e.target.value})}
                placeholder="1"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="commission">Commission</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  value={entry.commission}
                  onChange={(e) => setEntry({...entry, commission: e.target.value})}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price</Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                value={entry.entryPrice}
                onChange={(e) => setEntry({...entry, entryPrice: e.target.value})}
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
                value={entry.exitPrice}
                onChange={(e) => setEntry({...entry, exitPrice: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {entry.entryPrice && entry.exitPrice && entry.quantity && (
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center justify-between">
                <span className="font-medium">Estimated P&L:</span>
                <span className={`text-lg font-bold ${
                  calculatePnL() >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {calculatePnL() >= 0 ? '+' : ''}{calculatePnL().toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="mb-3 block">Emotions Felt</Label>
              <div className="flex flex-wrap gap-2">
                {emotions.map((emotion) => (
                  <Badge
                    key={emotion}
                    variant={entry.emotions.includes(emotion) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => toggleEmotion(emotion)}
                  >
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Key Lessons</Label>
              <div className="flex flex-wrap gap-2">
                {lessons.map((lesson) => (
                  <Badge
                    key={lesson}
                    variant={entry.lessons.includes(lesson) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => toggleLesson(lesson)}
                  >
                    {lesson}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes & Analysis</Label>
            <Textarea
              id="notes"
              value={entry.notes}
              onChange={(e) => setEntry({...entry, notes: e.target.value})}
              placeholder="Document your trade setup, execution, and key insights..."
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Save Entry
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}