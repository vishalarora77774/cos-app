import { useDatabaseSafe, useDatabaseReady } from '@/database/DatabaseProvider';
import { useCallback, useEffect, useState } from 'react';
import { Lab } from '@/database/models';

export interface LabData {
  id: string;
  name: string;
  identifier?: string;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
}

/**
 * Hook to fetch labs from database for report filters
 * Data comes from API and is synced to WatermelonDB daily
 * Returns empty array if database is not ready or no data available
 */
export function useLabs() {
  const isDatabaseReady = useDatabaseReady();
  const database = useDatabaseSafe(); // Safe version that returns null if not ready
  const [labs, setLabs] = useState<LabData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLabs = useCallback(async () => {
    setIsLoading(true);
    try {
      // Only load from database - data comes from API sync
      if (!isDatabaseReady || !database) {
        console.log('⏳ Database not ready yet, labs will load when available');
        setLabs([]);
        return;
      }

      // Query labs from database
      const dbLabs = await database.get<Lab>('labs').query().fetch();

      // Transform database labs to LabData format
      const processedLabs: LabData[] = dbLabs.map((lab) => ({
        id: lab.id,
        name: lab.name,
        identifier: lab.identifier || undefined,
        address: lab.addressLine || lab.city || lab.state || lab.zip
          ? {
              line: lab.addressLine ? [lab.addressLine] : undefined,
              city: lab.city || undefined,
              state: lab.state || undefined,
              zip: lab.zip || undefined,
              country: lab.country || undefined,
            }
          : undefined,
        phone: lab.phone || undefined,
        email: lab.email || undefined,
      }));

      setLabs(processedLabs);
      console.log(`✅ Loaded ${processedLabs.length} labs from database`);
    } catch (error) {
      console.error('Error loading labs:', error);
      setLabs([]);
    } finally {
      setIsLoading(false);
    }
  }, [isDatabaseReady, database]);

  // Initial load and reload when database becomes ready
  useEffect(() => {
    loadLabs();
  }, [loadLabs, isDatabaseReady]);

  return {
    labs,
    isLoading,
    refreshLabs: loadLabs,
  };
}
