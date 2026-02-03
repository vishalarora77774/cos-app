import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'appointments',
      columns: [
        { name: 'clinic_id', type: 'string', isOptional: true },
        { name: 'patient_id', type: 'string', isOptional: true },
        { name: 'date', type: 'string' },
        { name: 'time', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'status', type: 'string' }, // Scheduled, Completed, Cancelled
        { name: 'doctor_name', type: 'string' },
        { name: 'doctor_specialty', type: 'string', isOptional: true },
        { name: 'diagnosis', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'provider_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'medications',
      columns: [
        { name: 'clinic_id', type: 'string', isOptional: true },
        { name: 'patient_id', type: 'string', isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'dosage', type: 'string' },
        { name: 'frequency', type: 'string' },
        { name: 'purpose', type: 'string', isOptional: true },
        { name: 'start_date', type: 'string', isOptional: true },
        { name: 'end_date', type: 'string', isOptional: true },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'medical_reports',
      columns: [
        { name: 'clinic_id', type: 'string', isOptional: true },
        { name: 'patient_id', type: 'string', isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'category', type: 'string', isOptional: true },
        { name: 'date', type: 'string' },
        { name: 'findings', type: 'string', isOptional: true },
        { name: 'impression', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'doctor_name', type: 'string', isOptional: true },
        { name: 'doctor_specialty', type: 'string', isOptional: true },
        { name: 'file_url', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'doctors',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'specialty', type: 'string', isOptional: true },
        { name: 'clinic_id', type: 'string', isOptional: true },
        { name: 'clinic_name', type: 'string', isOptional: true },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'health_metrics',
      columns: [
        { name: 'patient_id', type: 'string', isOptional: true },
        { name: 'type', type: 'string' }, // blood_pressure, heart_rate, weight, etc.
        { name: 'value', type: 'string' },
        { name: 'unit', type: 'string', isOptional: true },
        { name: 'date', type: 'string' },
        { name: 'source', type: 'string', isOptional: true }, // healthkit, manual, etc.
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'synced_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});
