import { getCategoryIcon, getSubCategoryIcon } from './category-icons';

/**
 * Category groups for Circle of Support
 * Structure: Category -> Sub-categories -> Providers
 */

export interface SubCategory {
  id: string;
  name: string;
  keywords: string[]; // Keywords to match providers to this sub-category
  icon?: string; // Optional icon name
}

export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
  icon?: string; // Optional icon name
}

export const SUPPORT_CATEGORIES: Category[] = [
  {
    id: 'care-manager',
    name: 'Care Manager',
    icon: getCategoryIcon('care-manager'),
    subCategories: [],
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: getCategoryIcon('medical'),
    subCategories: [
      { id: 'pcp', name: 'PCP', icon: getSubCategoryIcon('pcp'), keywords: ['primary care', 'family medicine', 'family practice', 'general practice', 'internal medicine', 'general practitioner', 'gp', 'family physician', 'primary physician', 'md', 'do', 'physician', 'naturopath', 'naturopathic', 'chiropractor', 'chiropractic', 'dc'] },
      { id: 'all-specialists', name: 'All Specialists', icon: getSubCategoryIcon('all-specialists'), keywords: ['specialist', 'specialty', 'cardiology', 'cardiac', 'neurology', 'neurological', 'dermatology', 'dermatologist', 'endocrinology', 'endocrinologist', 'gastroenterology', 'gastroenterologist', 'hematology', 'hematologist', 'oncology', 'oncologist', 'nephrology', 'nephrologist', 'pulmonology', 'pulmonologist', 'rheumatology', 'rheumatologist', 'urology', 'urologist', 'gynecology', 'gynecologist', 'obstetrics', 'obstetrician', 'pediatrics', 'pediatrician', 'orthopedics', 'orthopedic', 'ortho', 'ophthalmology', 'ophthalmologist', 'otolaryngology', 'ent', 'allergy', 'allergist', 'immunology', 'immunologist', 'infectious disease', 'radiology', 'radiologist', 'pathology', 'pathologist', 'anesthesiology', 'anesthesiologist'] },
      { id: 'surgical-specialists', name: 'Surgical Specialists', icon: getSubCategoryIcon('surgical-specialists'), keywords: ['surgeon', 'surgery', 'surgical', 'cardiothoracic', 'neurosurgery', 'orthopedic surgery', 'plastic surgery', 'general surgery', 'vascular surgery', 'urological surgery', 'gynecological surgery', 'otolaryngology', 'ophthalmology'] },
      { id: 'registered-nurses', name: 'Registered Nurses', icon: getSubCategoryIcon('registered-nurses'), keywords: ['registered nurse', 'rn', 'nurse', 'nursing', 'r.n.', 'r.n'] },
      { id: 'nurse-practitioners', name: 'Nurse Practitioners', icon: getSubCategoryIcon('nurse-practitioners'), keywords: ['nurse practitioner', 'np', 'n.p.', 'n.p', 'aprn', 'apn', 'fnp', 'anp', 'pnp'] },
      { id: 'physician-assistants', name: 'Physician Assistants', icon: getSubCategoryIcon('physician-assistants'), keywords: ['physician assistant', 'pa', 'pa-c', 'pa c', 'physician\'s assistant'] },
      { id: 'physical-occupational-therapists', name: 'Physical/Occupational Therapists', icon: getSubCategoryIcon('physical-occupational-therapists'), keywords: ['physical therapist', 'pt', 'occupational therapist', 'ot', 'physical therapy', 'occupational therapy', 'physiotherapy', 'physiotherapist', 'rehabilitation', 'rehab'] },
      { id: 'others', name: 'Others', icon: getSubCategoryIcon('others'), keywords: ['healthcare', 'provider', 'practitioner', 'medical'] },
    ],
  },
  {
    id: 'mental-health',
    name: 'Mental Health',
    icon: getCategoryIcon('mental-health'),
    subCategories: [
      { id: 'psychiatrist', name: 'Psychiatrist', icon: getSubCategoryIcon('psychiatrist'), keywords: ['psychiatrist', 'psychiatry'] },
      { id: 'psychologist', name: 'Psychologist', icon: getSubCategoryIcon('psychologist'), keywords: ['psychologist', 'psychology'] },
      { id: 'mft', name: 'MFT', icon: getSubCategoryIcon('mft'), keywords: ['mft', 'marriage', 'family', 'therapist'] },
      { id: 'lcsw', name: 'LCSW', icon: getSubCategoryIcon('lcsw'), keywords: ['lcsw', 'social worker', 'licensed clinical'] },
      { id: 'aa', name: 'AA', icon: getSubCategoryIcon('aa'), keywords: ['aa', 'alcoholics anonymous', 'substance abuse'] },
      { id: 'substance-abuse', name: 'Substance Abuse Counselors', icon: getSubCategoryIcon('substance-abuse'), keywords: ['substance abuse', 'addiction', 'counselor'] },
    ],
  },
  {
    id: 'services',
    name: 'Services',
    icon: getCategoryIcon('services'),
    subCategories: [
      { id: 'meals', name: 'Meals', icon: getSubCategoryIcon('meals'), keywords: ['meal', 'food', 'nutrition'] },
      { id: 'caregivers', name: 'Caregivers', icon: getSubCategoryIcon('caregivers'), keywords: ['caregiver', 'care'] },
      { id: 'aids', name: 'Aids', icon: getSubCategoryIcon('aids'), keywords: ['aid', 'assistant', 'helper'] },
      { id: 'housekeeper', name: 'Housekeeper', icon: getSubCategoryIcon('housekeeper'), keywords: ['housekeeper', 'cleaning'] },
      { id: 'maintenance', name: 'Maintenance', icon: getSubCategoryIcon('maintenance'), keywords: ['maintenance', 'repair'] },
      { id: 'delivery', name: 'Delivery', icon: getSubCategoryIcon('delivery'), keywords: ['delivery', 'deliver'] },
      { id: 'yard', name: 'Yard', icon: getSubCategoryIcon('yard'), keywords: ['yard', 'landscaping', 'gardening'] },
    ],
  },
  {
    id: 'social-leisure',
    name: 'Social/Leisure',
    icon: getCategoryIcon('social-leisure'),
    subCategories: [
      { id: 'friends', name: 'Friends', icon: getSubCategoryIcon('friends'), keywords: ['friend'] },
      { id: 'groups', name: 'Groups', icon: getSubCategoryIcon('groups'), keywords: ['group', 'community'] },
      { id: 'exercise', name: 'Exercise', icon: getSubCategoryIcon('exercise'), keywords: ['exercise', 'fitness', 'trainer'] },
      { id: 'yoga', name: 'Yoga', icon: getSubCategoryIcon('yoga'), keywords: ['yoga', 'yogi'] },
      { id: 'music', name: 'Music', icon: getSubCategoryIcon('music'), keywords: ['music', 'musician'] },
      { id: 'concerts', name: 'Concerts', icon: getSubCategoryIcon('concerts'), keywords: ['concert'] },
      { id: 'education', name: 'Education', icon: getSubCategoryIcon('education'), keywords: ['education', 'teacher', 'tutor'] },
    ],
  },
  {
    id: 'faith',
    name: 'Faith',
    icon: getCategoryIcon('faith'),
    subCategories: [
      { id: 'priest', name: 'Priest', icon: getSubCategoryIcon('priest'), keywords: ['priest', 'catholic'] },
      { id: 'rabbi', name: 'Rabbi', icon: getSubCategoryIcon('rabbi'), keywords: ['rabbi', 'jewish'] },
      { id: 'minister', name: 'Minister', icon: getSubCategoryIcon('minister'), keywords: ['minister', 'pastor', 'clergy'] },
      { id: 'church', name: 'Church', icon: getSubCategoryIcon('church'), keywords: ['church', 'christian'] },
      { id: 'synagogue', name: 'Synagogue', icon: getSubCategoryIcon('synagogue'), keywords: ['synagogue', 'temple'] },
    ],
  },
  {
    id: 'family',
    name: 'Family',
    icon: getCategoryIcon('family'),
    subCategories: [
      { id: 'spouse', name: 'Spouse', icon: getSubCategoryIcon('spouse'), keywords: ['spouse', 'partner', 'husband', 'wife'] },
      { id: 'children', name: 'Children', icon: getSubCategoryIcon('children'), keywords: ['children', 'child', 'son', 'daughter'] },
      { id: 'siblings', name: 'Siblings', icon: getSubCategoryIcon('siblings'), keywords: ['sibling', 'brother', 'sister'] },
      { id: 'parents', name: 'Parents', icon: getSubCategoryIcon('parents'), keywords: ['parent', 'mother', 'father', 'mom', 'dad'] },
      { id: 'cousins', name: 'Cousins', icon: getSubCategoryIcon('cousins'), keywords: ['cousin'] },
      { id: 'nephews', name: 'Nephews', icon: getSubCategoryIcon('nephews'), keywords: ['nephew'] },
      { id: 'niece', name: 'Niece', icon: getSubCategoryIcon('niece'), keywords: ['niece'] },
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

