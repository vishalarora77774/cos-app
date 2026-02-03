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
      saveSelectedProviders(selectedProviders);
    }
  }, [selectedProviders, isLoading]);

  const loadSelectedProviders = async () => {
    try {
      const storedProviders = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedProviders) {
        const parsedProviders = JSON.parse(storedProviders) as SelectedProvider[];
        const normalized = Array.isArray(parsedProviders)
          ? parsedProviders
              .filter(provider => provider && provider.id !== undefined && provider.id !== null)
              .map(provider => sanitizeProviderForStorage(provider))
          : [];
        setSelectedProviders(normalized);
      }
    } catch (error) {
      console.error('Error loading selected providers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSelectedProviders = async (providers: SelectedProvider[]) => {
    try {
      const sanitized = providers.map(sanitizeProviderForStorage);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.error('Error saving selected providers:', error);
    }
  };

  const sanitizeProviderForStorage = (provider: SelectedProvider): SelectedProvider => ({
    id: String(provider.id),
    name: provider.name,
    qualifications: provider.qualifications,
    specialty: provider.specialty,
    // Skip image to avoid non-serializable payloads
    image: undefined,
    photoUrl: provider.photoUrl,
    phone: provider.phone,
    email: provider.email,
    category: provider.category,
    subCategory: provider.subCategory,
    subCategories: provider.subCategories,
    lastVisited: provider.lastVisited,
    isManual: provider.isManual,
    relationship: provider.relationship,
  });

  const addProvider = (provider: SelectedProvider) => {
    setSelectedProviders(prev => {
      const providerId = String(provider.id);
      if (prev.some(item => item.id === providerId)) return prev;
      if (prev.length >= MAX_SELECTED_PROVIDERS) return prev;
      const next = [...prev, sanitizeProviderForStorage({ ...provider, id: providerId })];
      saveSelectedProviders(next);
      return next;
    });
  };

  const removeProvider = (providerId: string) => {
    const normalizedId = String(providerId);
    setSelectedProviders(prev => {
      const next = prev.filter(item => item.id !== normalizedId);
      saveSelectedProviders(next);
      return next;
    });
  };

  const clearProviders = () => {
    setSelectedProviders([]);
    saveSelectedProviders([]);
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
