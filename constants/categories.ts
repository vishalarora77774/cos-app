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
      { id: 'pcp', name: 'PCP', keywords: ['primary care', 'family medicine', 'family practice', 'general practice', 'internal medicine', 'general practitioner', 'gp', 'family physician', 'primary physician', 'md', 'do', 'physician', 'naturopath', 'naturopathic', 'chiropractor', 'chiropractic', 'dc'] },
      { id: 'all-specialists', name: 'All Specialists', keywords: ['specialist', 'specialty', 'cardiology', 'cardiac', 'neurology', 'neurological', 'dermatology', 'dermatologist', 'endocrinology', 'endocrinologist', 'gastroenterology', 'gastroenterologist', 'hematology', 'hematologist', 'oncology', 'oncologist', 'nephrology', 'nephrologist', 'pulmonology', 'pulmonologist', 'rheumatology', 'rheumatologist', 'urology', 'urologist', 'gynecology', 'gynecologist', 'obstetrics', 'obstetrician', 'pediatrics', 'pediatrician', 'orthopedics', 'orthopedic', 'ortho', 'ophthalmology', 'ophthalmologist', 'otolaryngology', 'ent', 'allergy', 'allergist', 'immunology', 'immunologist', 'infectious disease', 'radiology', 'radiologist', 'pathology', 'pathologist', 'anesthesiology', 'anesthesiologist'] },
      { id: 'surgical-specialists', name: 'Surgical Specialists', keywords: ['surgeon', 'surgery', 'surgical', 'cardiothoracic', 'neurosurgery', 'orthopedic surgery', 'plastic surgery', 'general surgery', 'vascular surgery', 'urological surgery', 'gynecological surgery', 'otolaryngology', 'ophthalmology'] },
      { id: 'registered-nurses', name: 'Registered Nurses', keywords: ['registered nurse', 'rn', 'nurse', 'nursing', 'r.n.', 'r.n'] },
      { id: 'nurse-practitioners', name: 'Nurse Practitioners', keywords: ['nurse practitioner', 'np', 'n.p.', 'n.p', 'aprn', 'apn', 'fnp', 'anp', 'pnp'] },
      { id: 'physician-assistants', name: 'Physician Assistants', keywords: ['physician assistant', 'pa', 'pa-c', 'pa c', 'physician\'s assistant'] },
      { id: 'physical-occupational-therapists', name: 'Physical/Occupational Therapists', keywords: ['physical therapist', 'pt', 'occupational therapist', 'ot', 'physical therapy', 'occupational therapy', 'physiotherapy', 'physiotherapist', 'rehabilitation', 'rehab'] },
      { id: 'others', name: 'Others', keywords: ['healthcare', 'provider', 'practitioner', 'medical'] },
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
 * Match a provider to sub-categories based on keywords
 * Uses the new categorization system from provider-categorization.ts
 * Returns all applicable subcategories (a provider can belong to multiple)
 * 
 * @returns Array of category-subcategory pairs, or null if no match
 */
export function matchProviderToSubCategory(
  providerName: string,
  providerSpecialty?: string,
  providerQualifications?: string
): { categoryId: string; subCategoryId: string }[] | null {
  // Import the categorization function dynamically to avoid circular dependencies
  const { categorizeProvider } = require('@/services/provider-categorization');
  
  const categorization = categorizeProvider({
    qualifications: providerQualifications,
    specialty: providerSpecialty,
    name: providerName,
  });
  
  // Map the new category names to the old category IDs
  const categoryIdMap: Record<string, string> = {
    'Mental Health': 'mental-health',
    'Family': 'family',
    'Social/Leisure': 'social-leisure',
    'Faith': 'faith',
    'Services': 'services',
    'Medical': 'medical',
  };
  
  // Map the new subcategory names to the old subcategory IDs
  const subCategoryIdMap: Record<string, string> = {
    'Psychiatrist': 'psychiatrist',
    'Psychologist': 'psychologist',
    'MFT': 'mft',
    'LCSW': 'lcsw',
    'AA': 'aa',
    'Substance Abuse Counselors': 'substance-abuse',
    'Spouse': 'spouse',
    'Children': 'children',
    'Siblings': 'siblings',
    'Parents': 'parents',
    'Cousins': 'cousins',
    'Nephews': 'nephews',
    'Niece': 'niece',
    'Friends': 'friends',
    'Groups': 'groups',
    'Exercise': 'exercise',
    'Yoga': 'yoga',
    'Music': 'music',
    'Concerts': 'concerts',
    'Education': 'education',
    'Priest': 'priest',
    'Rabbi': 'rabbi',
    'Minister': 'minister',
    'Church': 'church',
    'Synagogue': 'synagogue',
    'Meals': 'meals',
    'Caregivers': 'caregivers',
    'Aids': 'aids',
    'Housekeeper': 'housekeeper',
    'Maintenance': 'maintenance',
    'Delivery': 'delivery',
    'Yard': 'yard',
    'PCP': 'pcp',
    'All Specialists': 'all-specialists',
    'Surgical Specialists': 'surgical-specialists',
    'Registered Nurses': 'registered-nurses',
    'Nurse Practitioners': 'nurse-practitioners',
    'Physician Assistants': 'physician-assistants',
    'Physical/Occupational Therapists': 'physical-occupational-therapists',
    'Others': 'others',
  };
  
  const categoryId = categoryIdMap[categorization.category] || 'medical';
  
  // Get all applicable subcategories
  const subCategories = categorization.subCategories || 
    (categorization.subCategory ? [categorization.subCategory] : ['Others']);
  
  // Return array of all category-subcategory pairs
  return subCategories.map(subCategory => ({
    categoryId,
    subCategoryId: subCategoryIdMap[subCategory] || 'others',
  }));
}

/**
 * Match a provider to a single primary sub-category (for backward compatibility)
 * Returns the first/primary subcategory
 */
export function matchProviderToPrimarySubCategory(
  providerName: string,
  providerSpecialty?: string,
  providerQualifications?: string
): { categoryId: string; subCategoryId: string } | null {
  const matches = matchProviderToSubCategory(providerName, providerSpecialty, providerQualifications);
  return matches && matches.length > 0 ? matches[0] : null;
}

