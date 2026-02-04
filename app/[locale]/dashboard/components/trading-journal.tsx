"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface JournalEntry {
  id: string;
  date: Date;
  title: string;
  content: string;
  tags: string[];
  mood: 'bullish' | 'bearish' | 'neutral';
  marketConditions: string;
}

export default function TradingJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  const handleCreateEntry = () => {
    setIsCreating(true);
  };

  const handleSaveEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setEntries([newEntry, ...entries]);
    setIsCreating(false);
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag ? entry.tags.includes(filterTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="w-full h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Journal</h1>
          <p className="text-muted-foreground mt-1">
            Document your trading thoughts, strategies, and market observations
          </p>
        </div>
        <Button onClick={handleCreateEntry} className="gap-2">
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by tag..."
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="pl-10 w-48"
          />
        </div>
      </div>

      {/* Journal Entries */}
      <div className="grid gap-4">
        {filteredEntries.length === 0 ? (
          <Card className="border-dashed border-2 border-muted-foreground/20">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-muted-foreground mb-4">
                <Plus className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No journal entries yet</h3>
              <p className="text-muted-foreground mb-4">
                Start documenting your trading journey by creating your first entry
              </p>
              <Button onClick={handleCreateEntry}>
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* Create Entry Modal */}
      {isCreating && (
        <CreateEntryModal
          onSave={handleSaveEntry}
          onCancel={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}

function JournalEntryCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              {format(entry.date, 'PPP')}
            </CardTitle>
            <p className="text-lg font-medium mt-1">{entry.title}</p>
          </div>
          <div className="flex gap-2">
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              entry.mood === 'bullish' && "bg-green-100 text-green-800",
              entry.mood === 'bearish' && "bg-red-100 text-red-800",
              entry.mood === 'neutral' && "bg-gray-100 text-gray-800"
            )}>
              {entry.mood}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {entry.content}
        </p>
        <div className="flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-muted rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        {entry.marketConditions && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Market Conditions:</span> {entry.marketConditions}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateEntryModal({ 
  onSave, 
  onCancel 
}: { 
  onSave: (entry: Omit<JournalEntry, 'id'>) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [mood, setMood] = useState<'bullish' | 'bearish' | 'neutral'>('neutral');
  const [marketConditions, setMarketConditions] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    onSave({
      date: new Date(),
      title: title.trim(),
      content: content.trim(),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      mood,
      marketConditions: marketConditions.trim()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create Journal Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Entry title..."
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Document your trading thoughts, observations, and strategies..."
              rows={6}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as any)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Tags</label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="strategy, analysis, market..."
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Market Conditions</label>
            <Input
              value={marketConditions}
              onChange={(e) => setMarketConditions(e.target.value)}
              placeholder="Describe current market conditions..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim()}>
              Save Entry
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}