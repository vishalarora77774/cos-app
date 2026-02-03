# WatermelonDB + React Query Usage Examples

## Quick Start Example

```typescript
import { useAppointments } from '@/hooks/use-appointments';

export default function AppointmentsScreen() {
  const {
    appointments,
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  } = useAppointments({ status: 'Scheduled' });

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      {appointments.map((appointment) => (
        <View key={appointment.id}>
          <Text>{appointment.doctorName}</Text>
          <Text>{appointment.date} at {appointment.time}</Text>
        </View>
      ))}
    </View>
  );
}
```

## Creating Data

```typescript
const { createAppointment } = useAppointments();

const handleCreate = async () => {
  try {
    const newAppointment = await createAppointment({
      date: '2024-01-15',
      time: '10:00',
      type: 'Consultation',
      status: 'Scheduled',
      doctorName: 'Dr. Smith',
      doctorSpecialty: 'Cardiology',
    });
    console.log('Created:', newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
  }
};
```

## Updating Data

```typescript
const { updateAppointment } = useAppointments();

const handleUpdate = async (appointmentId: string) => {
  try {
    await updateAppointment({
      id: appointmentId,
      status: 'Completed',
      notes: 'Patient showed improvement',
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
  }
};
```

## Deleting Data

```typescript
const { deleteAppointment } = useAppointments();

const handleDelete = async (appointmentId: string) => {
  try {
    await deleteAppointment(appointmentId);
  } catch (error) {
    console.error('Error deleting appointment:', error);
  }
};
```

## Syncing from API

```typescript
import { useDatabaseSync } from '@/hooks/use-database-sync';
import { useQuery } from '@tanstack/react-query';

export function SyncDataComponent() {
  const { syncAppointments, isSyncingAppointments } = useDatabaseSync();

  // Fetch from API
  const { data: apiAppointments } = useQuery({
    queryKey: ['api', 'appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments');
      return response.json();
    },
  });

  // Sync to WatermelonDB when API data is available
  useEffect(() => {
    if (apiAppointments) {
      syncAppointments(apiAppointments);
    }
  }, [apiAppointments, syncAppointments]);

  return (
    <View>
      {isSyncingAppointments && <Text>Syncing...</Text>}
    </View>
  );
}
```

## Filtering Data

```typescript
// Get only scheduled appointments
const { appointments } = useAppointments({ status: 'Scheduled' });

// Get appointments in date range
const { appointments } = useAppointments({
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
});

// Get active medications
const { medications } = useMedications({ isActive: true });

// Get reports by category
const { reports } = useMedicalReports({ category: 'Lab Results' });
```

## Real-time Updates

The hooks use WatermelonDB observables, so your components will automatically update when data changes:

```typescript
// This component will automatically re-render when appointments change
export function AppointmentsList() {
  const { appointments } = useAppointments();
  
  // No need to manually refresh - updates happen automatically!
  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <AppointmentCard appointment={item} />
      )}
    />
  );
}
```

## Error Handling

```typescript
const {
  appointments,
  isLoading,
  isError,
  error,
  refetch,
} = useAppointments();

if (isError) {
  return (
    <View>
      <Text>Error: {error?.message}</Text>
      <Button title="Retry" onPress={() => refetch()} />
    </View>
  );
}
```

## Loading States

```typescript
const {
  appointments,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
} = useAppointments();

// Show loading indicator
{isLoading && <ActivityIndicator />}

// Disable button while creating
<Button
  title="Create Appointment"
  onPress={handleCreate}
  disabled={isCreating}
/>

// Show loading overlay while updating
{isUpdating && <LoadingOverlay />}
```
