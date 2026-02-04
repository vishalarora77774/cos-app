import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { getDatabase } from './index';
import { Database } from '@nozbe/watermelondb';

interface DatabaseContextType {
  database: Database | null;
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

interface DatabaseProviderProps {
  children: ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [database, setDatabase] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize database lazily after component mount
    // This ensures native modules are ready
    try {
      const db = getDatabase();
      setDatabase(db);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize database:', error);
      setIsReady(false);
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{ database, isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  if (!context.database) {
    throw new Error('Database is not initialized yet. Check isReady before using.');
  }
  return context.database;
}

/**
 * Safe version of useDatabase that returns null if database is not ready
 * Use this when you want to gracefully handle database not being available
 */
export function useDatabaseSafe(): Database | null {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    return null;
  }
  return context.database;
}

export function useDatabaseReady() {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabaseReady must be used within a DatabaseProvider');
  }
  return context.isReady;
}
