import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import type { Provider } from '@/services/fasten-health';

export const MAX_SELECTED_PROVIDERS = 8;

export type SelectedProvider = Provider & {
  isManual?: boolean;
  relationship?: string;
};

interface ProviderSelectionContextType {
  selectedProviders: SelectedProvider[];
  addProvider: (provider: SelectedProvider) => void;
  removeProvider: (providerId: string) => void;
  clearProviders: () => void;
  isLoading: boolean;
}

const ProviderSelectionContext = createContext<ProviderSelectionContextType | undefined>(undefined);

const STORAGE_KEY = 'selected_providers';

export function ProviderSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSelectedProviders();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveSelectedProviders();
    }
  }, [selectedProviders, isLoading]);

  const loadSelectedProviders = async () => {
    try {
      const storedProviders = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedProviders) {
        const parsedProviders = JSON.parse(storedProviders) as SelectedProvider[];
        setSelectedProviders(Array.isArray(parsedProviders) ? parsedProviders : []);
      }
    } catch (error) {
      console.error('Error loading selected providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSelectedProviders = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProviders));
    } catch (error) {
      console.error('Error saving selected providers:', error);
    }
  };

  const addProvider = (provider: SelectedProvider) => {
    setSelectedProviders(prev => {
      if (prev.some(item => item.id === provider.id)) return prev;
      if (prev.length >= MAX_SELECTED_PROVIDERS) return prev;
      return [...prev, provider];
    });
  };

  const removeProvider = (providerId: string) => {
    setSelectedProviders(prev => prev.filter(item => item.id !== providerId));
  };

  const clearProviders = () => {
    setSelectedProviders([]);
  };

  const value: ProviderSelectionContextType = {
    selectedProviders,
    addProvider,
    removeProvider,
    clearProviders,
    isLoading,
  };

  return (
    <ProviderSelectionContext.Provider value={value}>
      {children}
    </ProviderSelectionContext.Provider>
  );
}

export function useProviderSelection() {
  const context = useContext(ProviderSelectionContext);
  if (!context) {
    throw new Error('useProviderSelection must be used within a ProviderSelectionProvider');
  }
  return context;
}
