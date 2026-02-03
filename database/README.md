# WatermelonDB & React Query Integration

This directory contains the WatermelonDB database setup and React Query integration for the CoS application.

## Structure

```
database/
├── schema.ts              # Database schema definition
├── index.ts               # Database initialization
├── DatabaseProvider.tsx   # React context provider for database
├── models/                # WatermelonDB models
│   ├── Appointment.ts
│   ├── Medication.ts
│   ├── MedicalReport.ts
│   ├── Doctor.ts
│   ├── HealthMetric.ts
│   └── index.ts
└── README.md
```

## Installation

Make sure you have installed all required dependencies:

```bash
npm install @nozbe/watermelondb @nozbe/with-observables @tanstack/react-query react-native-sqlite-storage
```

For iOS, you may need to run:
```bash
cd ios && pod install
```

## Usage

### Basic Setup

The database and React Query providers are already set up in `app/_layout.tsx`. You can start using the hooks immediately.

### Using Hooks

#### Appointments

```typescript
import { useAppointments, useAppointment } from '@/hooks/use-appointments';

// Fetch all appointments
function AppointmentsList() {
  const {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments({ status: 'Scheduled' });

  // Create a new appointment
  const handleCreate = async () => {
    await createAppointment({
      date: '2024-01-15',
      time: '10:00',
      type: 'Consultation',
      status: 'Scheduled',
      doctorName: 'Dr. Smith',
      doctorSpecialty: 'Cardiology',
    });
  };

  // ... rest of component
}

// Fetch a single appointment
function AppointmentDetail({ appointmentId }: { appointmentId: string }) {
  const { appointment, isLoading } = useAppointment(appointmentId);
  // ... rest of component
}
```

#### Medications

```typescript
import { useMedications } from '@/hooks/use-medications';

function MedicationsList() {
  const {
    medications,
    isLoading,
    createMedication,
    updateMedication,
    deleteMedication,
  } = useMedications({ isActive: true });

  // ... use medications
}
```

#### Medical Reports

```typescript
import { useMedicalReports } from '@/hooks/use-medical-reports';

function ReportsList() {
  const {
    reports,
    isLoading,
    createMedicalReport,
    updateMedicalReport,
    deleteMedicalReport,
  } = useMedicalReports({ category: 'Lab Results' });

  // ... use reports
}
```

### Syncing Data from API

When you fetch data from an API and want to store it in WatermelonDB:

```typescript
import { useDatabaseSync } from '@/hooks/use-database-sync';

function SyncComponent() {
  const { syncAppointments, syncMedications, syncMedicalReports } = useDatabaseSync();

  const fetchAndSync = async () => {
    // Fetch from API
    const appointments = await fetch('/api/appointments').then(r => r.json());
    
    // Sync to WatermelonDB
    await syncAppointments(appointments);
  };

  // ... rest of component
}
```

## Architecture

### WatermelonDB
- **Purpose**: Local database for offline-first data storage
- **Benefits**: Fast queries, reactive updates, offline support
- **Use Cases**: Storing appointments, medications, reports, etc.

### React Query
- **Purpose**: Server state management, caching, and synchronization
- **Benefits**: Automatic caching, background refetching, optimistic updates
- **Use Cases**: API calls, data synchronization, cache management

### Integration Pattern
1. **Local Operations**: Use WatermelonDB directly for CRUD operations
2. **Server Sync**: Use React Query mutations to sync with API
3. **Real-time Updates**: Use `useObservable` from `@nozbe/with-observables` for reactive updates
4. **Cache Invalidation**: React Query automatically invalidates cache when mutations succeed

## Best Practices

1. **Always use hooks**: Don't access the database directly, use the provided hooks
2. **Handle loading states**: Check `isLoading` before rendering data
3. **Error handling**: Always handle `isError` and `error` states
4. **Optimistic updates**: React Query handles this automatically, but you can customize
5. **Offline support**: WatermelonDB works offline, sync when online

## Migration

When you need to update the schema:

1. Update `schema.ts` with new version and changes
2. Create a migration file in `database/migrations/`
3. Update the schema version in `database/index.ts`

Example migration:
```typescript
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'appointments',
          columns: [
            { name: 'reminder_sent', type: 'boolean', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
```

## Troubleshooting

### Database not initializing
- Check that SQLite adapter is properly installed
- Verify schema version matches
- Check console for setup errors

### Hooks not working
- Ensure providers are wrapped in root layout
- Check that you're using hooks within provider context
- Verify imports are correct

### Performance issues
- Use filters in hooks to limit query results
- Consider pagination for large datasets
- Use React Query's `staleTime` to reduce refetches
