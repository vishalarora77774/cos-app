# API Migration Guide

## Overview

The app has been updated to work with **API-based data** instead of file-based processing. Data will come from an API once per day and be stored in WatermelonDB.

## What Changed

### Removed File Processing
- ✅ Removed file processing fallback from `useConnectedEhrs()` hook
- ✅ Removed file processing fallback from `useLabs()` hook
- ✅ Hooks now **only** query the database
- ✅ No dependencies on `fasten-health-processor.ts` for data loading

### Updated Hooks

#### `useConnectedEhrs()`
- **Before**: Loaded from database OR file processing fallback
- **Now**: Only loads from database (WatermelonDB)
- Returns empty array if database not ready or no data

#### `useLabs()`
- **Before**: Loaded from database OR file processing fallback  
- **Now**: Only loads from database (WatermelonDB)
- Returns empty array if database not ready or no data

## Architecture

```
API (once per day)
    ↓
Sync Service (syncClinicsToDatabase, syncLabsToDatabase)
    ↓
WatermelonDB (local storage)
    ↓
Hooks (useConnectedEhrs, useLabs)
    ↓
UI Components
```

## API Sync Implementation

### Daily Sync Service

Create a service to sync data from API to database:

```typescript
// services/api-sync.ts
import { syncClinicsToDatabase, syncLabsToDatabase } from './clinic-lab-sync';
import { getDatabase } from '@/database';

interface APIClinic {
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

interface APILab {
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
 * Syncs clinics and labs from API to database
 * Call this once per day (e.g., via background task or on app launch)
 */
export async function syncClinicsAndLabsFromAPI(): Promise<void> {
  try {
    // Fetch data from your API
    const response = await fetch('YOUR_API_ENDPOINT/clinics-and-labs');
    const data = await response.json();
    
    // Transform API data to match ProcessedClinic/ProcessedLab format
    const clinics: ProcessedClinic[] = data.clinics.map((clinic: APIClinic) => ({
      id: clinic.id,
      name: clinic.name,
      identifier: clinic.identifier,
      address: clinic.address,
      phone: clinic.phone,
      email: clinic.email,
      type: 'clinic' as const,
    }));
    
    const labs: ProcessedLab[] = data.labs.map((lab: APILab) => ({
      id: lab.id,
      name: lab.name,
      identifier: lab.identifier,
      address: lab.address,
      phone: lab.phone,
      email: lab.email,
    }));
    
    // Sync to database
    const database = getDatabase();
    await syncClinicsAndLabsToDatabase(clinics, labs, database);
    
    console.log('✅ Successfully synced clinics and labs from API');
  } catch (error) {
    console.error('❌ Error syncing from API:', error);
    throw error;
  }
}
```

### Schedule Daily Sync

You can schedule the sync using:

1. **Background Task** (React Native):
   ```typescript
   import * as BackgroundFetch from 'expo-background-fetch';
   import * as TaskManager from 'expo-task-manager';
   
   const BACKGROUND_SYNC_TASK = 'background-sync';
   
   TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
     await syncClinicsAndLabsFromAPI();
     return BackgroundFetch.BackgroundFetchResult.NewData;
   });
   
   // Register background task
   await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
     minimumInterval: 24 * 60 * 60, // 24 hours
   });
   ```

2. **On App Launch**:
   ```typescript
   // In app/_layout.tsx or app/index.tsx
   useEffect(() => {
     const lastSync = await AsyncStorage.getItem('lastSyncDate');
     const today = new Date().toDateString();
     
     if (lastSync !== today) {
       syncClinicsAndLabsFromAPI();
       AsyncStorage.setItem('lastSyncDate', today);
     }
   }, []);
   ```

## Files to Remove (Future)

When you're ready to fully migrate:

1. **Remove file processing**:
   - `services/fasten-health-processor.ts` (or keep for API data transformation)
   - JSON files in `data/` folder

2. **Update imports**:
   - Remove imports of `processFastenHealthDataFromFile`
   - Remove imports of `ProcessedClinic`/`ProcessedLab` from processor (if not needed)

3. **Keep for API use**:
   - `services/clinic-lab-sync.ts` - Still needed for syncing API data to DB
   - Database models (`Clinic`, `Lab`) - Still needed
   - Database schema - Still needed

## Current State

✅ **Hooks are ready** - They only use the database
✅ **No file dependencies** - Hooks don't import file processing
✅ **Graceful handling** - Returns empty arrays if database not ready
✅ **Sync service ready** - `clinic-lab-sync.ts` can sync API data

## Next Steps

1. **Implement API endpoint** - Create your API that returns clinics and labs
2. **Create sync service** - Use the example above to sync from API
3. **Schedule sync** - Set up daily sync (background task or on launch)
4. **Test** - Verify data loads from database after API sync
5. **Remove files** - Once confirmed working, remove processor and JSON files

## Benefits

- ✅ **No file dependencies** - App works entirely with database
- ✅ **Offline support** - Data persists in WatermelonDB
- ✅ **Better performance** - Database queries are faster than file processing
- ✅ **Real-time updates** - Can use observables when database is ready
- ✅ **Scalable** - Easy to add more data types from API
