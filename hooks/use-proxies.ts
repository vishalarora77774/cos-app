import { useDatabaseSafe, useDatabaseReady } from '@/database/DatabaseProvider';
import { useCallback, useEffect, useState } from 'react';
import { Proxy } from '@/database/models';

export interface ProxyData {
  id: string;
  email: string;
  status: 'pending' | 'active' | 'revoked';
  consentGiven: boolean;
  consentDate: string | null;
  patientId: string | null;
}

/**
 * Hook to manage proxy data
 * Loads all proxies from database
 */
export function useProxies() {
  const isDatabaseReady = useDatabaseReady();
  const database = useDatabaseSafe();
  const [proxies, setProxies] = useState<ProxyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProxies = useCallback(async () => {
    if (!isDatabaseReady || !database) {
      console.log('📊 Database not ready, skipping proxy load...');
      setIsLoading(false);
      return;
    }

    try {
      const dbProxies = await database
        .get<Proxy>('proxies')
        .query()
        .fetch();

      const proxyData: ProxyData[] = dbProxies.map(proxy => ({
        id: proxy.id,
        email: proxy.email,
        status: proxy.status as 'pending' | 'active' | 'revoked',
        consentGiven: proxy.consentGiven,
        consentDate: proxy.consentDate,
        patientId: proxy.patientId,
      }));
      
      setProxies(proxyData);
      console.log(`✅ Loaded ${proxyData.length} proxies from database`);
    } catch (error) {
      console.error('❌ Error loading proxies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDatabaseReady, database]);

  const addProxy = useCallback(async (email: string, patientId?: string) => {
    if (!isDatabaseReady || !database) {
      throw new Error('Database not ready');
    }

    try {
      await database.write(async () => {
        await database.get<Proxy>('proxies').create(record => {
          record.email = email;
          record.status = 'pending';
          record.consentGiven = true;
          record.consentDate = new Date().toISOString();
          record.patientId = patientId || null;
          record.createdAt = new Date();
          record.updatedAt = new Date();
        });
      });
      
      await loadProxies();
      console.log(`✅ Added proxy: ${email}`);
    } catch (error) {
      console.error('❌ Error adding proxy:', error);
      throw error;
    }
  }, [isDatabaseReady, database, loadProxies]);

  const removeProxy = useCallback(async (proxyId: string) => {
    if (!isDatabaseReady || !database) {
      throw new Error('Database not ready');
    }

    try {
      const proxy = await database.get<Proxy>('proxies').find(proxyId);
      await database.write(async () => {
        await proxy.markAsDeleted();
      });
      
      await loadProxies();
      console.log(`✅ Removed proxy: ${proxyId}`);
    } catch (error) {
      console.error('❌ Error removing proxy:', error);
      throw error;
    }
  }, [isDatabaseReady, database, loadProxies]);

  const updateProxyStatus = useCallback(async (proxyId: string, status: 'pending' | 'active' | 'revoked') => {
    if (!isDatabaseReady || !database) {
      throw new Error('Database not ready');
    }

    try {
      const proxy = await database.get<Proxy>('proxies').find(proxyId);
      await database.write(async () => {
        proxy.update(record => {
          record.status = status;
          record.updatedAt = new Date();
        });
      });
      
      await loadProxies();
      console.log(`✅ Updated proxy status: ${proxyId} -> ${status}`);
    } catch (error) {
      console.error('❌ Error updating proxy status:', error);
      throw error;
    }
  }, [isDatabaseReady, database, loadProxies]);

  useEffect(() => {
    loadProxies();
  }, [loadProxies]);

  return {
    proxies,
    isLoading,
    addProxy,
    removeProxy,
    updateProxyStatus,
    refreshProxies: loadProxies,
  };
}
