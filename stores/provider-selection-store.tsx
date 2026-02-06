import React, { createContext, ReactNode, useContext, useEffect, useState, useCallback } from 'react';
import type { Provider } from '@/services/fasten-health';
import { getFastenPractitioners } from '@/services/fasten-health';
import { useDatabaseSafe, useDatabaseReady } from '@/database/DatabaseProvider';
import { SelectedProvider as SelectedProviderModel } from '@/database/models';
import { Q } from '@nozbe/watermelondb';

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
  validateAndCleanProviders: () => Promise<void>;
}

const ProviderSelectionContext = createContext<ProviderSelectionContextType | undefined>(undefined);

export function ProviderSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedProviders, setSelectedProviders] = useState<SelectedProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isDatabaseReady = useDatabaseReady();
  const database = useDatabaseSafe();

  // Load selected providers from database
  const loadSelectedProviders = useCallback(async () => {
    if (!isDatabaseReady || !database) {
      console.log('📊 Database not ready, skipping provider load');
      setIsLoading(false);
      return;
    }

    try {
      const dbProviders = await database
        .get<SelectedProviderModel>('selected_providers')
        .query()
        .fetch();

      const providers: SelectedProvider[] = dbProviders.map(dbProvider => ({
        id: dbProvider.providerId,
        name: dbProvider.name,
        qualifications: dbProvider.qualifications || undefined,
        specialty: dbProvider.specialty || undefined,
        photoUrl: dbProvider.photoUrl || undefined,
        phone: dbProvider.phone || undefined,
        email: dbProvider.email || undefined,
        category: dbProvider.category || undefined,
        subCategory: dbProvider.subCategory || undefined,
        subCategories: dbProvider.subCategories 
          ? JSON.parse(dbProvider.subCategories) 
          : undefined,
        lastVisited: dbProvider.lastVisited || undefined,
        isManual: dbProvider.isManual,
        relationship: dbProvider.relationship || undefined,
      }));

      setSelectedProviders(providers);
      console.log(`✅ Loaded ${providers.length} selected providers from database`);
    } catch (error) {
      console.error('❌ Error loading selected providers:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDatabaseReady, database]);

  // Save provider to database
  const saveProviderToDatabase = useCallback(async (provider: SelectedProvider) => {
    if (!isDatabaseReady || !database) {
      console.warn('⚠️ Database not ready, cannot save provider');
      return;
    }

    try {
      const providerId = String(provider.id);
      
      // Check if provider already exists
      const existing = await database
        .get<SelectedProviderModel>('selected_providers')
        .query(Q.where('provider_id', providerId))
        .fetch();

      if (existing.length > 0) {
        // Update existing
        await database.write(async () => {
          await existing[0].update((record: SelectedProviderModel) => {
            record.name = provider.name;
            record.qualifications = provider.qualifications || null;
            record.specialty = provider.specialty || null;
            record.photoUrl = provider.photoUrl || null;
            record.phone = provider.phone || null;
            record.email = provider.email || null;
            record.category = provider.category || null;
            record.subCategory = provider.subCategory || null;
            record.subCategories = provider.subCategories 
              ? JSON.stringify(provider.subCategories) 
              : null;
            record.lastVisited = provider.lastVisited || null;
            record.isManual = provider.isManual || false;
            record.relationship = provider.relationship || null;
            record.updatedAt = new Date();
          });
        });
      } else {
        // Create new
        await database.write(async () => {
          await database.get<SelectedProviderModel>('selected_providers').create(record => {
            record.providerId = providerId;
            record.name = provider.name;
            record.qualifications = provider.qualifications || null;
            record.specialty = provider.specialty || null;
            record.photoUrl = provider.photoUrl || null;
            record.phone = provider.phone || null;
            record.email = provider.email || null;
            record.category = provider.category || null;
            record.subCategory = provider.subCategory || null;
            record.subCategories = provider.subCategories 
              ? JSON.stringify(provider.subCategories) 
              : null;
            record.lastVisited = provider.lastVisited || null;
            record.isManual = provider.isManual || false;
            record.relationship = provider.relationship || null;
            record.createdAt = new Date();
            record.updatedAt = new Date();
          });
        });
      }
    } catch (error) {
      console.error('❌ Error saving provider to database:', error);
      throw error;
    }
  }, [isDatabaseReady, database]);

  // Remove provider from database
  const removeProviderFromDatabase = useCallback(async (providerId: string) => {
    if (!isDatabaseReady || !database) {
      console.warn('⚠️ Database not ready, cannot remove provider');
      return;
    }

    try {
      const normalizedId = String(providerId);
      const existing = await database
        .get<SelectedProviderModel>('selected_providers')
        .query(Q.where('provider_id', normalizedId))
        .fetch();

      if (existing.length > 0) {
        await database.write(async () => {
          await existing[0].markAsDeleted();
        });
      }
    } catch (error) {
      console.error('❌ Error removing provider from database:', error);
      throw error;
    }
  }, [isDatabaseReady, database]);

  // Validate and remove providers that don't exist in current data
  const validateAndCleanProviders = useCallback(async () => {
    if (!isDatabaseReady || !database) {
      console.log('📊 Database not ready, skipping validation');
      return;
    }

    try {
      console.log('🔄 Validating selected providers against current data...');
      
      // Get all current providers from Fasten Health data
      const currentProviders = await getFastenPractitioners();
      const currentProviderIds = new Set(currentProviders.map(p => String(p.id)));
      
      // Get all selected providers from database
      const dbProviders = await database
        .get<SelectedProviderModel>('selected_providers')
        .query()
        .fetch();

      const invalidProviders: SelectedProviderModel[] = [];
      
      for (const dbProvider of dbProviders) {
        const providerId = String(dbProvider.providerId);
        
        // Keep manual providers (user-added) even if not in current data
        if (dbProvider.isManual) {
          continue;
        }
        
        // Remove if provider doesn't exist in current data
        if (!currentProviderIds.has(providerId)) {
          invalidProviders.push(dbProvider);
          console.log(`⚠️ Removing invalid provider: ${dbProvider.name} (ID: ${providerId})`);
        }
      }

      // Remove invalid providers from database
      if (invalidProviders.length > 0) {
        await database.write(async () => {
          for (const provider of invalidProviders) {
            await provider.markAsDeleted();
          }
        });
        console.log(`✅ Removed ${invalidProviders.length} invalid providers`);
        
        // Reload providers after cleanup
        await loadSelectedProviders();
      } else {
        console.log('✅ All selected providers are valid');
      }
    } catch (error) {
      console.error('❌ Error validating providers:', error);
    }
  }, [isDatabaseReady, database, loadSelectedProviders]);

  useEffect(() => {
    loadSelectedProviders();
  }, [loadSelectedProviders]);

  // Validate providers when database becomes ready
  useEffect(() => {
    if (isDatabaseReady && database && !isLoading) {
      validateAndCleanProviders();
    }
  }, [isDatabaseReady, database, isLoading, validateAndCleanProviders]);

  const addProvider = async (provider: SelectedProvider) => {
    const providerId = String(provider.id);
    
    // Check if already selected
    if (selectedProviders.some(item => item.id === providerId)) {
      return;
    }
    
    // Check max limit
    if (selectedProviders.length >= MAX_SELECTED_PROVIDERS) {
      console.warn(`⚠️ Maximum ${MAX_SELECTED_PROVIDERS} providers allowed`);
      return;
    }

    const newProvider: SelectedProvider = {
      ...provider,
      id: providerId,
      image: undefined, // Don't store image reference
    };

    try {
      await saveProviderToDatabase(newProvider);
      setSelectedProviders(prev => [...prev, newProvider]);
      console.log(`✅ Added provider: ${newProvider.name}`);
    } catch (error) {
      console.error('❌ Error adding provider:', error);
    }
  };

  const removeProvider = async (providerId: string) => {
    const normalizedId = String(providerId);
    
    try {
      await removeProviderFromDatabase(normalizedId);
      setSelectedProviders(prev => prev.filter(item => item.id !== normalizedId));
      console.log(`✅ Removed provider: ${providerId}`);
    } catch (error) {
      console.error('❌ Error removing provider:', error);
    }
  };

  const clearProviders = async () => {
    if (!isDatabaseReady || !database) {
      setSelectedProviders([]);
      return;
    }

    try {
      const allProviders = await database
        .get<SelectedProviderModel>('selected_providers')
        .query()
        .fetch();

      await database.write(async () => {
        for (const provider of allProviders) {
          await provider.markAsDeleted();
        }
      });

      setSelectedProviders([]);
      console.log('✅ Cleared all providers');
    } catch (error) {
      console.error('❌ Error clearing providers:', error);
    }
  };

  const value: ProviderSelectionContextType = {
    selectedProviders,
    addProvider,
    removeProvider,
    clearProviders,
    isLoading,
    validateAndCleanProviders,
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
