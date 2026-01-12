/**
 * Category groups for Circle of Support
 * Structure: Category -> Sub-categories -> Providers
 */

export interface SubCategory {
  id: string;
  name: string;
  keywords: string[]; // Keywords to match providers to this sub-category
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export const SUPPORT_CATEGORIES: Category[] = [
  {
    id: 'mental-health',
    name: 'Mental Health',
    subCategories: [
      { id: 'psychiatrist', name: 'Psychiatrist', keywords: ['psychiatrist', 'psychiatry'] },
      { id: 'psychologist', name: 'Psychologist', keywords: ['psychologist', 'psychology'] },
      { id: 'mft', name: 'MFT', keywords: ['mft', 'marriage', 'family', 'therapist'] },
      { id: 'lcsw', name: 'LCSW', keywords: ['lcsw', 'social worker', 'licensed clinical'] },
      { id: 'aa', name: 'AA', keywords: ['aa', 'alcoholics anonymous', 'substance abuse'] },
      { id: 'substance-abuse', name: 'Substance Abuse Counselors', keywords: ['substance abuse', 'addiction', 'counselor'] },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    subCategories: [
      { id: 'spouse', name: 'Spouse', keywords: ['spouse', 'partner', 'husband', 'wife'] },
      { id: 'children', name: 'Children', keywords: ['children', 'child', 'son', 'daughter'] },
      { id: 'siblings', name: 'Siblings', keywords: ['sibling', 'brother', 'sister'] },
      { id: 'parents', name: 'Parents', keywords: ['parent', 'mother', 'father', 'mom', 'dad'] },
      { id: 'cousins', name: 'Cousins', keywords: ['cousin'] },
      { id: 'nephews', name: 'Nephews', keywords: ['nephew'] },
      { id: 'niece', name: 'Niece', keywords: ['niece'] },
    ],
  },
  {
    id: 'social-leisure',
    name: 'Social/Leisure',
    subCategories: [
      { id: 'friends', name: 'Friends', keywords: ['friend'] },
      { id: 'groups', name: 'Groups', keywords: ['group', 'community'] },
      { id: 'exercise', name: 'Exercise', keywords: ['exercise', 'fitness', 'trainer'] },
      { id: 'yoga', name: 'Yoga', keywords: ['yoga', 'yogi'] },
      { id: 'music', name: 'Music', keywords: ['music', 'musician'] },
      { id: 'concerts', name: 'Concerts', keywords: ['concert'] },
      { id: 'education', name: 'Education', keywords: ['education', 'teacher', 'tutor'] },
    ],
  },
  {
    id: 'faith',
    name: 'Faith',
    subCategories: [
      { id: 'priest', name: 'Priest', keywords: ['priest', 'catholic'] },
      { id: 'rabbi', name: 'Rabbi', keywords: ['rabbi', 'jewish'] },
      { id: 'minister', name: 'Minister', keywords: ['minister', 'pastor', 'clergy'] },
      { id: 'church', name: 'Church', keywords: ['church', 'christian'] },
      { id: 'synagogue', name: 'Synagogue', keywords: ['synagogue', 'temple'] },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    subCategories: [
      { id: 'meals', name: 'Meals', keywords: ['meal', 'food', 'nutrition'] },
      { id: 'caregivers', name: 'Caregivers', keywords: ['caregiver', 'care'] },
      { id: 'aids', name: 'Aids', keywords: ['aid', 'assistant', 'helper'] },
      { id: 'housekeeper', name: 'Housekeeper', keywords: ['housekeeper', 'cleaning'] },
      { id: 'maintenance', name: 'Maintenance', keywords: ['maintenance', 'repair'] },
      { id: 'delivery', name: 'Delivery', keywords: ['delivery', 'deliver'] },
      { id: 'yard', name: 'Yard', keywords: ['yard', 'landscaping', 'gardening'] },
    ],
  },
  {
    id: 'medical',
    name: 'Medical',
    subCategories: [
      { id: 'doctors', name: 'Doctors', keywords: ['doctor', 'physician', 'md', 'do'] },
      { id: 'providers', name: 'Providers', keywords: ['provider', 'practitioner', 'healthcare', 'np', 'nurse practitioner'] },
      { id: 'nurses', name: 'Nurses', keywords: ['nurse', 'rn', 'nursing'] },
    ],
  },
];

/**
 * Get all sub-categories for a given category ID
 */
export function getSubCategoriesByCategoryId(categoryId: string): SubCategory[] {
  const category = SUPPORT_CATEGORIES.find(cat => cat.id === categoryId);
  return category?.subCategories || [];
}

/**
 * Get category by ID
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return SUPPORT_CATEGORIES.find(cat => cat.id === categoryId);
}

/**
 * Get sub-category by ID
 */
export function getSubCategoryById(categoryId: string, subCategoryId: string): SubCategory | undefined {
  const category = getCategoryById(categoryId);
  return category?.subCategories.find(sub => sub.id === subCategoryId);
}

/**
 * Match a provider to a sub-category based on keywords
 * Prioritizes qualifications and specialty over name
 */
export function matchProviderToSubCategory(
  providerName: string,
  providerSpecialty?: string,
  providerQualifications?: string
): { categoryId: string; subCategoryId: string } | null {
  const searchText = `${providerName} ${providerSpecialty || ''} ${providerQualifications || ''}`.toLowerCase();
  const qualificationsLower = (providerQualifications || '').toLowerCase();
  const specialtyLower = (providerSpecialty || '').toLowerCase();
  const nameLower = providerName.toLowerCase();
  
  // Priority matching: Check qualifications first, then specialty, then name
  // This ensures more accurate categorization
  
  // Check Medical category first with priority on qualifications
  const medicalCategory = SUPPORT_CATEGORIES.find(cat => cat.id === 'medical');
  if (medicalCategory) {
    // Check doctors first (MD, DO are specific)
    const doctorsSubCat = medicalCategory.subCategories.find(sub => sub.id === 'doctors');
    if (doctorsSubCat && (
      qualificationsLower.includes('md') || 
      qualificationsLower.includes('do') ||
      nameLower.includes('md') ||
      nameLower.includes('do') ||
      nameLower.includes('doctor') ||
      nameLower.includes('physician')
    )) {
      return {
        categoryId: 'medical',
        subCategoryId: 'doctors',
      };
    }
    
    // Check providers (NP, PA, practitioners)
    const providersSubCat = medicalCategory.subCategories.find(sub => sub.id === 'providers');
    if (providersSubCat && (
      qualificationsLower.includes('np') ||
      qualificationsLower.includes('nurse practitioner') ||
      qualificationsLower.includes('pa') ||
      qualificationsLower.includes('physician assistant') ||
      qualificationsLower.includes('practitioner') ||
      searchText.includes('nurse practitioner') ||
      searchText.includes('physician assistant')
    )) {
      return {
        categoryId: 'medical',
        subCategoryId: 'providers',
      };
    }
    
    // Check nurses (RN, but not NP)
    const nursesSubCat = medicalCategory.subCategories.find(sub => sub.id === 'nurses');
    if (nursesSubCat && (
      (qualificationsLower.includes('rn') && !qualificationsLower.includes('np')) ||
      (nameLower.includes('nurse') && !nameLower.includes('practitioner') && !qualificationsLower.includes('np'))
    )) {
      return {
        categoryId: 'medical',
        subCategoryId: 'nurses',
      };
    }
  }
  
  // Check other categories (Mental Health, Family, etc.)
  for (const category of SUPPORT_CATEGORIES) {
    // Skip medical as we already checked it
    if (category.id === 'medical') continue;
    
    for (const subCategory of category.subCategories) {
      if (subCategory.keywords.some(keyword => searchText.includes(keyword.toLowerCase()))) {
        return {
          categoryId: category.id,
          subCategoryId: subCategory.id,
        };
      }
    }
  }
  
  // Default to Medical > Providers if no match found
  return {
    categoryId: 'medical',
    subCategoryId: 'providers',
  };
}

