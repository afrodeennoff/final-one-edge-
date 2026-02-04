"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUserStore } from '@/store/user-store';
import { createClient } from '@/server/auth';
import { toast } from 'sonner';
import { useI18n } from "@/locales/client";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  tags: string[];
  instrument?: string;
  outcome?: 'profit' | 'loss' | 'breakeven';
  createdAt: string;
  updatedAt: string;
  pnl?: number;
  time?: string;
}

interface JournalContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useUserStore(state => state.supabaseUser);
  const t = useI18n();

  const fetchEntries = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Mock data for demonstration - in real implementation, this would fetch from database
      const mockEntries: JournalEntry[] = [
        {
          id: "1",
          title: "Morning ES Breakout",
          content: "Good setup, took profits early",
          date: "2024-01-15",
          tags: ["win", "breakout"],
          instrument: "ES",
          outcome: "profit",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pnl: 22.5,
          time: "09:30"
        }
      ];
      setEntries(mockEntries);
    } catch (error) {
      toast.error("Failed to load journal entries");
      console.error("Error fetching journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addEntry = async (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      toast.error("Please log in to add journal entries");
      return;
    }

    try {
      const newEntry: JournalEntry = {
        ...entryData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setEntries(prev => [newEntry, ...prev]);
      toast.success("Journal entry added successfully");
    } catch (error) {
      toast.error("Failed to add journal entry");
      console.error("Error adding journal entry:", error);
    }
  };

  const updateEntry = async (id: string, entryData: Partial<JournalEntry>) => {
    try {
      setEntries(prev => 
        prev.map(entry => 
          entry.id === id 
            ? { ...entry, ...entryData, updatedAt: new Date().toISOString() }
            : entry
        )
      );
      toast.success("Journal entry updated successfully");
    } catch (error) {
      toast.error("Failed to update journal entry");
      console.error("Error updating journal entry:", error);
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      toast.success("Journal entry deleted successfully");
    } catch (error) {
      toast.error("Failed to delete journal entry");
      console.error("Error deleting journal entry:", error);
    }
  };

  const refreshEntries = async () => {
    await fetchEntries();
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);

  return (
    <JournalContext.Provider
      value={{
        entries,
        isLoading,
        addEntry,
        updateEntry,
        deleteEntry,
        refreshEntries
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}