# Mock FHIR Data for Testing

## Overview

This directory contains mock HL7 FHIR R4 compliant health data generated for testing purposes. The data simulates a single patient receiving care from 5 different hospitals with different specialties and treatments.

## Generated Files

- **`mock-fasten-health-data.json`**: Complete FHIR R4 compliant mock data bundle containing 505+ resources

## Data Structure

### Hospitals (Organizations)

1. **Metropolitan General Hospital** (San Francisco, CA)
   - Specialty: Cardiology
   - Conditions: Hypertension, Atrial Fibrillation
   - Treatments: Cardiac Monitoring, Blood Pressure Management, Anticoagulation Therapy

2. **Pacific Coast Medical Center** (Los Angeles, CA)
   - Specialty: Orthopedics
   - Conditions: Osteoarthritis of Right Knee, Chronic Lower Back Pain
   - Treatments: Physical Therapy, Knee Replacement Surgery, Pain Management

3. **Valley Regional Hospital** (Sacramento, CA)
   - Specialty: Endocrinology
   - Conditions: Type 2 Diabetes Mellitus, Diabetic Neuropathy
   - Treatments: Insulin Therapy, Blood Glucose Monitoring, Diabetic Foot Care

4. **Mountain View Medical Center** (Denver, CO)
   - Specialty: Pulmonology
   - Conditions: Chronic Obstructive Pulmonary Disease, Asthma
   - Treatments: Bronchodilator Therapy, Pulmonary Rehabilitation, Oxygen Therapy

5. **Riverside Community Hospital** (Portland, OR)
   - Specialty: Gastroenterology
   - Conditions: Gastroesophageal Reflux Disease, Irritable Bowel Syndrome
   - Treatments: Acid Suppression Therapy, Dietary Management, Endoscopic Procedures

### Patient Information

- **Name**: John Smith
- **Date of Birth**: 1980-05-15
- **Gender**: Male
- **Address**: 123 Main Street, San Francisco, CA 94102
- **Phone**: +1-555-123-4567
- **Email**: john.smith@example.com

> **Note**: The same patient appears across all 5 hospitals with different Medical Record Numbers (MRN) for each hospital.

## FHIR Resource Types Included

The mock data includes all major FHIR R4 resource types:

| Resource Type | Count | Description |
|--------------|-------|-------------|
| **Patient** | 5 | Patient records (same patient, different MRNs per hospital) |
| **Organization** | 5 | Hospital/clinic organizations |
| **Practitioner** | 15 | Healthcare providers (3 per hospital) |
| **Location** | 15 | Hospital locations (3 per hospital) |
| **Encounter** | 25 | Patient encounters/visits (5 per hospital) |
| **Condition** | 10 | Medical conditions/diagnoses (2 per hospital) |
| **DiagnosticReport** | 40 | Laboratory and diagnostic reports (8 per hospital) |
| **Observation** | 200 | Clinical observations and test results (5 per diagnostic report) |
| **MedicationStatement** | 25 | Medication prescriptions (5 per hospital) |
| **AllergyIntolerance** | 10 | Known allergies (2 per hospital) |
| **Procedure** | 25 | Medical procedures (5 per hospital) |
| **Immunization** | 15 | Vaccination records (3 per hospital) |
| **CarePlan** | 5 | Treatment care plans (1 per hospital) |
| **CareTeam** | 5 | Care team assignments (1 per hospital) |
| **Goal** | 15 | Treatment goals (3 per hospital) |
| **Device** | 10 | Medical devices (2 per hospital) |
| **DocumentReference** | 40 | Clinical documents (8 per hospital) |
| **Binary** | 40 | Binary document attachments (8 per hospital) |

**Total Resources**: 505+

## Usage

### Using with Fasten Health Processor

```typescript
import { processFastenHealthDataFromFile } from '@/services/fasten-health-processor';

// Process mock data
const processedData = await processFastenHealthDataFromFile('./data/mock-fasten-health-data.json');

console.log('Clinics:', processedData.clinics.length); // 5
console.log('Patients:', processedData.patients.length); // 5 (same patient, different MRNs)
console.log('Providers:', processedData.providers.length); // 15
console.log('Reports:', processedData.medicalReports.length); // 40
```

### Direct FHIR Data Access

```typescript
import mockFhirData from '@/data/mock-fasten-health-data.json';

// Access raw FHIR resources
const patients = mockFhirData.filter(r => r.resourceType === 'Patient');
const organizations = mockFhirData.filter(r => r.resourceType === 'Organization');
const diagnosticReports = mockFhirData.filter(r => r.resourceType === 'DiagnosticReport');
```

## Regenerating Mock Data

To regenerate the mock data with different values or add more hospitals:

```bash
node scripts/generate-mock-fhir-data.js
```

This will overwrite the existing `mock-fasten-health-data.json` file.

## Customization

Edit `scripts/generate-mock-fhir-data.js` to customize:

- Patient information (name, DOB, address, etc.)
- Hospital details (names, addresses, specialties)
- Number of resources per hospital
- Treatment conditions and plans
- Resource types and counts

## FHIR R4 Compliance

All generated resources follow HL7 FHIR R4 standards:

- ✅ Proper resource structure and required fields
- ✅ Standard coding systems (SNOMED CT, LOINC, CPT, etc.)
- ✅ Valid reference relationships between resources
- ✅ Proper date/time formatting (ISO 8601)
- ✅ US Core extensions for race, ethnicity, and sex
- ✅ Standard terminology systems for codes

## Data Relationships

The mock data maintains proper FHIR resource relationships:

```
Organization (Hospital)
  ├── Patient (with hospital-specific MRN)
  ├── Practitioner (multiple providers)
  ├── Location (multiple locations)
  └── Encounter
        ├── DiagnosticReport
        │     └── Observation (multiple)
        ├── Procedure
        └── DocumentReference
              └── Binary
```

## Testing Scenarios

This mock data supports testing:

1. **Multi-hospital patient data aggregation**
2. **Different specialties and treatment plans**
3. **Longitudinal care tracking**
4. **Resource relationship navigation**
5. **Data processing and transformation**
6. **UI rendering with various resource types**
7. **Search and filtering across hospitals**

## Notes

- All dates are randomly generated within reasonable ranges (2020-2024)
- IDs are randomly generated and unique
- Some coding values use placeholder codes (should be replaced with real codes in production)
- Binary resources contain sample base64-encoded PDF data
- All resources are properly linked via references

## References

- [HL7 FHIR R4 Specification](https://www.hl7.org/fhir/R4/)
- [FHIR Resource List](https://www.hl7.org/fhir/R4/resourcelist.html)
- [US Core Implementation Guide](http://hl7.org/fhir/us/core/)

