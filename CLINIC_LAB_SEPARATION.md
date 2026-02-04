# Clinic and Lab Separation Implementation

## Overview

The Fasten Health processor has been updated to separate **clinics** and **labs** into two distinct datasets. This separation improves data organization and performance by:

- **Clinics**: Used in the Connected EHRs view
- **Labs**: Used in report filters

Both datasets are stored in the local WatermelonDB database for efficient access without impacting app performance.

## Changes Made

### 1. Processor Updates (`services/fasten-health-processor.ts`)

- Added `ProcessedLab` interface
- Updated `ProcessedClinic` to include `type: 'clinic' | 'lab'`
- Created `isLab()` function to categorize organizations based on name patterns
- Updated `processOrganizations()` to separate clinics and labs
- Updated `ProcessedHealthData` to include separate `clinics` and `labs` arrays

### 2. Database Schema (`database/schema.ts`)

- Added `clinics` table (version 2)
- Added `labs` table (version 2)
- Schema version incremented from 1 to 2

### 3. Database Models

- **`database/models/Clinic.ts`**: Model for clinics
- **`database/models/Lab.ts`**: Model for labs
- Both models include: name, identifier, address fields, phone, email

### 4. Sync Service (`services/clinic-lab-sync.ts`)

Utility functions for syncing clinics and labs to/from database:

- `syncClinicsToDatabase()`: Batch sync clinics
- `syncLabsToDatabase()`: Batch sync labs
- `syncClinicsAndLabsToDatabase()`: Sync both at once
- `getClinicsFromDatabase()`: Retrieve clinics
- `getLabsFromDatabase()`: Retrieve labs

### 5. Hooks

- **`hooks/use-connected-ehrs.ts`**: Updated to use database instead of processing on-the-fly
- **`hooks/use-labs.ts`**: New hook for retrieving labs (for report filters)

## Lab Detection Logic

Organizations are classified as labs if their name contains any of these keywords:
- `lab`
- `laboratory`
- `diagnostic`
- `pathology`
- `quest`
- `labcorp`
- `testing`
- `specimen`
- `analytical`

All other organizations are classified as clinics. Patient managing organizations are always treated as clinics.

## Usage

### For Connected EHRs View

```typescript
import { useConnectedEhrs } from '@/hooks/use-connected-ehrs';

function ConnectedEhrsScreen() {
  const { connectedHospitals, isLoadingClinics } = useConnectedEhrs();
  
  // connectedHospitals contains only clinics (not labs)
  return (
    // Render clinics
  );
}
```

### For Report Filters

```typescript
import { useLabs } from '@/hooks/use-labs';

function ReportsScreen() {
  const { labs, isLoading } = useLabs();
  
  // labs contains only laboratory facilities
  return (
    // Use labs in filter dropdown
  );
}
```

### Manual Sync

```typescript
import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';
import { syncClinicsAndLabsToDatabase } from '@/services/clinic-lab-sync';
import { useDatabase } from '@/database/DatabaseProvider';

async function syncData() {
  const database = useDatabase();
  const processedData = await processFastenHealthDataFromFile();
  
  // Sync both clinics and labs to database
  await syncClinicsAndLabsToDatabase(
    processedData.clinics,
    processedData.labs,
    database
  );
}
```

## Data Structure

### ProcessedClinic
```typescript
{
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
  type: 'clinic';
}
```

### ProcessedLab
```typescript
{
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
```

## Performance Benefits

1. **Database Storage**: Clinics and labs are stored in local database, avoiding repeated processing
2. **Efficient Queries**: WatermelonDB observables provide real-time updates with minimal overhead
3. **Lazy Loading**: Data is loaded from database first, only processes from file if database is empty
4. **Batch Operations**: Sync operations use batch writes for better performance

## Testing

Run the test script to verify separation:

```bash
node scripts/test-clinic-lab-separation.js
```

This will:
- Load the current data file
- Separate clinics and labs
- Display the results
- Save JSON files to `data/processed/clinics.json` and `data/processed/labs.json`

## Current Data Results

From `fasten-health-data-2.json`:

- **Clinics**: 2
  - NCAL PWS INTERFACE
  - Northern California Region

- **Labs**: 7
  - TPMG REGIONAL LABORATORY, MWS (2 entries)
  - KFH VALLEJO LABORATORY
  - TPMG REGIONAL LAB, MWS
  - TPMG REGIONAL LAB, BERKELEY
  - TPMG REGIONAL LABORATORY, BERKELEY
  - QUEST DIAGNOSTICS

## Migration Notes

- Database schema version updated to 2
- Existing apps will need to handle schema migration
- The processor maintains backward compatibility with existing code
- Hooks automatically sync data to database on first use
