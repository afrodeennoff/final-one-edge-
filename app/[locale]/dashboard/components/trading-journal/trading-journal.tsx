import React from 'react';
import { JournalProvider } from './journal-provider';
import JournalEntryForm from './journal-entry-form';
import { JournalList } from './journal-list';

export default function TradingJournal() {
  return (
    <JournalProvider>
      <div className="space-y-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
            <p className="text-muted-foreground mt-2">
              Document and analyze your trading performance
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <JournalEntryForm 
              onSubmit={(entry) => console.log('New entry:', entry)}
              onCancel={() => console.log('Cancel entry')}
            />
          </div>
          <div className="lg:col-span-2">
            <JournalList />
          </div>
        </div>
      </div>
    </JournalProvider>
  );
}