# Provider Categorization System

## Overview

This document describes the provider categorization system implemented for segregating health-related data into different categories and subcategories, designed specifically for elderly users to easily access their health providers.

## Categories

Based on the `dtaa` file structure, the following main categories are defined:

1. **Mental Health** - psychiatrist, psychologist, MFT, LCSW, AA, substance abuse counselors
2. **Family** - spouse, children, siblings, parents, cousins, nephews, niece
3. **Social/Leisure** - friends, groups, exercise, yoga, music, concerts, education
4. **Faith** - priest, rabbi, minister, church, synagogue
5. **Services** - meals, caregivers, aids, housekeeper, maintenance, delivery, yard
6. **Medical** - doctors, providers, nurses (with subcategories)

## Medical Subcategories

The Medical category is further divided into the following subcategories:

1. **PCP (Primary Care Practitioner)**
   - MD (Medical Doctor)
   - DO (Doctor of Osteopathy)
   - Physicians
   - Nurse Practitioners (NP)
   - Naturopaths
   - Chiropractors (DC)

2. **All Specialists**
   - Organ specialists from different departments
   - Cardiology, Neurology, Dermatology, Endocrinology, etc.

3. **Surgical Specialists**
   - All surgeons
   - Cardiothoracic, Neurosurgery, Orthopedic Surgery, etc.

4. **Registered Nurses**
   - RN (Registered Nurse)
   - Nursing staff

5. **Physician Assistants**
   - PA (Physician Assistant)
   - PA-C (Physician Assistant - Certified)

6. **Physical/Occupational Therapists**
   - PT (Physical Therapist)
   - OT (Occupational Therapist)
   - Rehabilitation specialists

7. **Others**
   - Everyone else in the medical category

## Implementation

### Files Modified/Created

1. **`services/provider-categorization.ts`** (NEW)
   - Contains categorization logic and configuration
   - Defines keywords and patterns for each category/subcategory
   - Provides helper functions for grouping and filtering providers

2. **`services/fasten-health-processor.ts`** (MODIFIED)
   - Updated `ProcessedProvider` interface to include `category` and `subCategory` fields
   - Integrated categorization logic in `processProviders` function
   - Added API helper functions:
     - `getProvidersByCategory()` - Groups providers by category and subcategory
     - `getProvidersForCategory()` - Gets providers for a specific category
     - `getProvidersForMedicalSubcategory()` - Gets providers for a specific medical subcategory
     - `getAvailableCategories()` - Gets all unique categories
     - `getAvailableMedicalSubcategories()` - Gets all unique medical subcategories
     - `getCategorizedProvidersSummary()` - Gets structured summary for API responses

3. **`services/fasten-health.ts`** (MODIFIED)
   - Updated `Provider` interface to include `category` and `subCategory` fields
   - Integrated categorization in `getFastenPractitioners()` and `getFastenPractitionerById()` functions

## Usage

### Basic Categorization

```typescript
import { categorizeProvider } from './services/provider-categorization';

const categorization = categorizeProvider({
  qualifications: 'MD',
  specialty: 'Cardiology',
  name: 'Dr. John Smith',
});

// Result: { category: 'Medical', subCategory: 'All Specialists' }
```

### Getting Categorized Providers

```typescript
import { processFastenHealthDataFromFile, getProvidersByCategory } from './services/fasten-health-processor';

const processedData = await processFastenHealthDataFromFile();
const groupedProviders = getProvidersByCategory(processedData);

// Access providers by category and subcategory
const pcpProviders = groupedProviders['Medical']['PCP'];
const specialists = groupedProviders['Medical']['All Specialists'];
```

### API Endpoints (Future)

The categorization system is designed to be API-ready. Example endpoints:

- `GET /api/providers` - Get all providers with categorization
- `GET /api/providers/categories` - Get providers grouped by category
- `GET /api/providers/category/:category` - Get providers for a specific category
- `GET /api/providers/medical/:subcategory` - Get providers for a medical subcategory
- `GET /api/providers/summary` - Get categorized providers summary

## Categorization Logic

The categorization algorithm:

1. Checks for medical providers first (MD, DO, NP, PA, RN, PT, OT, DC, etc.)
2. If medical, determines subcategory based on:
   - Keywords in qualifications, specialty, and name
   - Priority order: Registered Nurses → Physician Assistants → Therapists → Surgical Specialists → All Specialists → PCP → Others
3. Non-medical providers default to Medical category with "Others" subcategory (can be expanded in the future)

## Future Enhancements

1. Expand categorization to include other categories (Mental Health, Family, Services, etc.)
2. Add support for custom categorization rules
3. Implement category-based filtering in UI
4. Add category-based search functionality
5. Create category-based navigation for elderly users

## Notes

- The categorization is designed to be flexible and can be easily extended
- Keywords and patterns can be adjusted in `provider-categorization.ts`
- The system is stateless and can be moved to a backend API service
- All categorization logic is centralized in `provider-categorization.ts` for easy maintenance
