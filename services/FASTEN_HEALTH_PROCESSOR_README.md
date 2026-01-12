# Fasten Health Data Processor

## Overview

The `fasten-health-processor.ts` service processes raw FHIR data from Fasten Health and transforms it into a structured, meaningful JSON format that's compatible with the app views.

## Key Features

- ✅ **Multi-Clinic Support**: Handles data from multiple clinics
- ✅ **Multi-Patient Support**: Processes data for multiple patients
- ✅ **Structured Output**: Generates clean, organized JSON with proper relationships
- ✅ **API-Ready**: Stateless design allows easy migration to backend API
- ✅ **Engagement Tracking**: Calculates provider engagement counts automatically
- ✅ **Type-Safe**: Full TypeScript support with comprehensive interfaces

## Architecture

The processor is designed with separation of concerns:

1. **Data Input**: Raw FHIR resources (can come from file, API, or database)
2. **Processing**: Transforms FHIR data into app-compatible format
3. **Data Output**: Structured JSON with relationships between entities

## Usage

### In the App (Current)

```typescript
import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';

// Process data from JSON file
const processedData = await processFastenHealthDataFromFile();
console.log(processedData.clinics);
console.log(processedData.patients);
console.log(processedData.providers);
```

### In an API (Future)

```typescript
import { processFastenHealthData } from '@/services/fasten-health-processor';

// API endpoint example
app.post('/api/process-health-data', async (req, res) => {
  const rawFhirData = req.body; // Raw FHIR resources from request
  const processedData = processFastenHealthData(rawFhirData);
  res.json(processedData);
});
```

## Data Structure

The processor outputs a `ProcessedHealthData` object with:

```typescript
{
  clinics: ProcessedClinic[];           // All clinics/organizations
  patients: ProcessedPatient[];          // All patients with clinic mapping
  providers: ProcessedProvider[];        // All providers with engagement counts
  medicalReports: ProcessedMedicalReport[]; // All diagnostic reports
  appointments: ProcessedAppointment[];   // All appointments
  medications: ProcessedMedication[];     // All medications
  encounters: ProcessedEncounter[];       // All encounters
  metadata: {                             // Processing metadata
    processedAt: string;
    totalClinics: number;
    totalPatients: number;
    // ... etc
  }
}
```

## Key Relationships

- **Patient → Clinic**: Each patient is mapped to a clinic via `clinicId`
- **Report → Patient → Clinic**: Medical reports are linked to patients and clinics
- **Appointment → Patient → Clinic**: Appointments are linked to patients and clinics
- **Provider Engagement**: Providers are sorted by engagement count (most active first)

## Migration to API

To move this processor to a backend API:

1. **Copy the file** to your API service
2. **Replace file loading** with database queries or API calls:
   ```typescript
   // Instead of:
   const fastenData = require('../data/fasten-health-data.json');
   
   // Use:
   const fastenData = await database.getFhirResources();
   // or
   const fastenData = await fetchFhirDataFromApi();
   ```

3. **Create API endpoints**:
   - `POST /api/process-health-data` - Process raw FHIR data
   - `GET /api/patients/:id` - Get processed data for a patient
   - `GET /api/clinics/:id` - Get processed data for a clinic
   - `GET /api/providers` - Get all providers with engagement data

4. **Update app services** to call API instead of processing locally

## Utility Functions

### Get Patient Data
```typescript
import { getPatientData } from '@/services/fasten-health-processor';

const patientData = getPatientData(processedData, 'patient-id-123');
// Returns: patient, reports, appointments, medications, encounters
```

### Get Clinic Data
```typescript
import { getClinicData } from '@/services/fasten-health-processor';

const clinicData = getClinicData(processedData, 'clinic-id-456');
// Returns: clinic, patients, reports, appointments, medications
```

## Benefits

1. **Separation of Concerns**: Data processing is separate from data access
2. **Reusability**: Same processor can be used in app and API
3. **Testability**: Easy to unit test with mock FHIR data
4. **Maintainability**: Single source of truth for data transformation logic
5. **Scalability**: Can handle large datasets efficiently
6. **Type Safety**: Full TypeScript support prevents runtime errors

## Future Enhancements

- [ ] Add caching support for processed data
- [ ] Add incremental processing (only process new data)
- [ ] Add data validation and error handling
- [ ] Add support for additional FHIR resource types
- [ ] Add data filtering and pagination
- [ ] Add export functionality (JSON, CSV, etc.)

