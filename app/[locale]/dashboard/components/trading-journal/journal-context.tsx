'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/server/auth'
import { toast } from 'sonner'

export interface JournalEntry {
  id: string
  title: string
  content: string
  date: string
  tags: string[]
  instrument?: string
  outcome?: 'profit' | 'loss' | 'breakeven'
  createdAt: string
  updatedAt: string
}

interface JournalContextType {
  entries: JournalEntry[]
  isLoading: boolean
  createEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateEntry: (id: string, entry: Partial<JournalEntry>) => Promise<void>
  deleteEntry: (id: string) => Promise<void>
  refreshEntries: () => Promise<void>
}

const JournalContext = createContext<JournalContextType | undefined>(undefined)

export function useJournal() {
  const context = useContext(JournalContext)
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider')
  }
  return context
}

export function JournalProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchEntries = async () => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('date', { ascending: false })
      
      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching journal entries:', error)
      toast.error('Failed to load journal entries')
    } finally {
      setIsLoading(false)
    }
  }

  const createEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{
          ...entry,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
      
      if (error) throw error
      if (data) {
        setEntries(prev => [data[0], ...prev])
        toast.success('Journal entry created successfully')
      }
    } catch (error) {
      console.error('Error creating journal entry:', error)
      toast.error('Failed to create journal entry')
      throw error
    }
  }

  const updateEntry = async (id: string, entry: Partial<JournalEntry>) => {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('journal_entries')
        .update({
          ...entry,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
      
      if (error) throw error
      if (data) {
        setEntries(prev => prev.map(item => item.id === id ? { ...item, ...data[0] } : item))
        toast.success('Journal entry updated successfully')
      }
    } catch (error) {
      console.error('Error updating journal entry:', error)
      toast.error('Failed to update journal entry')
      throw error
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      setEntries(prev => prev.filter(item => item.id !== id))
      toast.success('Journal entry deleted successfully')
    } catch (error) {
      console.error('Error deleting journal entry:', error)
      toast.error('Failed to delete journal entry')
      throw error
    }
  }

  const refreshEntries = async () => {
    setIsLoading(true)
    await fetchEntries()
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return (
    <JournalContext.Provider value={{
      entries,
      isLoading,
      createEntry,
      updateEntry,
      deleteEntry,
      refreshEntries
    }}>
      {children}
    </JournalContext.Provider>
  )
}