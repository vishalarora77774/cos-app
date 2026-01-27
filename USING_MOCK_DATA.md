# Using Mock FHIR Data in the App

## Overview

The app now supports using mock FHIR data for testing purposes. The mock data includes **28 FHIR resource types** with comprehensive healthcare data across 5 hospitals.

## Quick Start

### Option 1: Use Configuration File (Recommended)

Edit `services/fasten-health-config.ts`:

```typescript
export const USE_MOCK_DATA = true;  // Use mock data
// or
export const USE_MOCK_DATA = false; // Use original data
```

### Option 2: Use Environment Variable

Set the environment variable before running the app:

```bash
EXPO_PUBLIC_USE_MOCK_DATA=true npx expo start
```

Or add to your `.env` file:
```
EXPO_PUBLIC_USE_MOCK_DATA=true
```

## What's Included in Mock Data

The mock data includes:

- **1,161 FHIR resources** across 5 hospitals
- **28 resource types** including:
  - Patient, Practitioner, Organization, Location
  - Encounter, DiagnosticReport, Observation
  - Medication, MedicationRequest, MedicationStatement
  - Appointment, ServiceRequest, Specimen
  - Coverage, RelatedPerson, PractitionerRole
  - List, Composition, and more

- **Same patient** (John Smith) across all 5 hospitals with different MRNs
- **Different specialties** per hospital:
  - Metropolitan General Hospital (Cardiology)
  - Pacific Coast Medical Center (Orthopedics)
  - Valley Regional Hospital (Endocrinology)
  - Mountain View Medical Center (Pulmonology)
  - Riverside Community Hospital (Gastroenterology)

## Testing

The mock data is automatically used when `USE_MOCK_DATA = true`. All existing app screens will work with the mock data:

- ✅ Home screen (providers, departments)
- ✅ Reports screen (diagnostic reports)
- ✅ Appointments screen (appointments calendar)
- ✅ Today's Schedule (medications, tasks)
- ✅ Plan screen (health summary)
- ✅ Profile screen (patient info)

## Switching Back to Original Data

Simply change `USE_MOCK_DATA` to `false` in `services/fasten-health-config.ts` or set the environment variable to `false`.

## Regenerating Mock Data

To regenerate the mock data with different values:

```bash
node scripts/generate-mock-fhir-data.js
```

This will overwrite `data/mock-fasten-health-data.json` with fresh data.

## Data Comparison

| Metric | Original Data | Mock Data |
|--------|--------------|-----------|
| Resource Types | 17 | 28 |
| Total Resources | 824 | 1,161 |
| Lines | 83,955 | 71,568 |
| Hospitals | 1 | 5 |
| Patients | 1 | 1 (same patient, 5 MRNs) |

## Benefits of Mock Data

1. **Testing**: Safe to use without exposing real patient data
2. **Development**: Consistent data for development and testing
3. **Comprehensive**: Includes more resource types than original
4. **Multi-Hospital**: Tests multi-hospital scenarios
5. **FHIR Compliant**: All resources follow HL7 FHIR R4 standards

## Troubleshooting

If you encounter issues:

1. **Data not loading**: Check that `data/mock-fasten-health-data.json` exists
2. **Wrong data**: Verify `USE_MOCK_DATA` setting in config file
3. **Processing errors**: Check console logs for specific errors
4. **Fallback**: The app will automatically fall back to original data if mock data fails to load

## Files Modified

- `services/fasten-health-config.ts` - Configuration file (NEW)
- `services/fasten-health.ts` - Updated to support mock data
- `services/fasten-health-processor.ts` - Updated to support mock data

## Next Steps

The mock data is ready to use! Simply set `USE_MOCK_DATA = true` and restart your app.
