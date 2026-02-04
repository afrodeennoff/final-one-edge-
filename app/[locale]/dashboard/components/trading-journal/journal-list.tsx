import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Edit,
  Trash2
} from "lucide-react";
import { useI18n } from "@/locales/client";
import { useJournal } from './journal-context';

interface JournalEntryDisplay {
  id: string;
  date: Date;
  time: string;
  market: string;
  instrument: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  commission: number;
  pnl: number;
  notes: string;
  emotions: string[];
  lessons: string[];
  createdAt: Date;
}

export function JournalList() {
  const { entries, isLoading } = useJournal();
  const t = useI18n();

  // Mock data for demonstration since we're focusing on the d2 structure
  const mockEntries: JournalEntryDisplay[] = [
    {
      id: "1",
      date: new Date(2024, 0, 15),
      time: "09:30",
      market: "ES",
      instrument: "E-mini S&P 500",
      direction: "long",
      entryPrice: 4500,
      exitPrice: 4525,
      quantity: 1,
      commission: 2.5,
      pnl: 22.5,
      notes: "Good morning breakout setup. Entered on 5-min break above resistance. Took partial profits at first target, let remainder run to second target.",
      emotions: ["Confidence", "Excitement"],
      lessons: ["Risk Management", "Market Analysis"],
      createdAt: new Date(2024, 0, 15, 10, 30)
    },
    {
      id: "2",
      date: new Date(2024, 0, 14),
      time: "14:15",
      market: "NQ",
      instrument: "E-mini Nasdaq",
      direction: "short",
      entryPrice: 15200,
      exitPrice: 15150,
      quantity: 2,
      commission: 5,
      pnl: 95,
      notes: "Perfect short setup into resistance. Market showed signs of exhaustion after strong up move. Perfect execution and held position to target.",
      emotions: ["Confidence", "Focus"],
      lessons: ["Strategy", "Psychology"],
      createdAt: new Date(2024, 0, 14, 15, 45)
    }
  ];

  const actualEntries = mockEntries;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const getPnLColor = (pnl: number) => {
    return pnl >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPnLIcon = (pnl: number) => {
    return pnl >= 0 ? TrendingUp : TrendingDown;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        <Badge variant="secondary">
          {actualEntries.length} entries
        </Badge>
      </div>

      {actualEntries.length === 0 ? (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
            <p className="text-muted-foreground mb-4">
              Start documenting your trades to build your trading journal
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {actualEntries.map((entry) => {
            const PnLIcon = getPnLIcon(entry.pnl);
            return (
              <Card 
                key={entry.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatTime(entry.time)}
                          </span>
                        </div>
                        <Badge variant={entry.direction === 'long' ? 'default' : 'secondary'}>
                          {entry.direction.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-2">
                        <span className="font-medium">{entry.market}</span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span className="text-sm text-muted-foreground">
                          {entry.instrument}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Entry:</span>
                          <span className="font-medium">{entry.entryPrice}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Exit:</span>
                          <span className="font-medium">{entry.exitPrice}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">Qty:</span>
                          <span className="font-medium">{entry.quantity}</span>
                        </div>
                      </div>

                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {entry.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {entry.emotions.map((emotion) => (
                          <Badge 
                            key={emotion} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {emotion}
                          </Badge>
                        ))}
                        {entry.lessons.map((lesson) => (
                          <Badge 
                            key={lesson} 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {lesson}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className={`flex items-center gap-1 font-bold ${getPnLColor(entry.pnl)}`}>
                        <PnLIcon className="h-4 w-4" />
                        <span>
                          {entry.pnl >= 0 ? '+' : ''}{entry.pnl.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}