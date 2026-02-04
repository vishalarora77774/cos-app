/**
 * Care Management Agencies Data
 */

export interface CareManagerAgency {
  id: string;
  name: string;
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  specialties?: string[];
  services?: string[];
  rating?: number;
  reviewCount?: number;
}

// Mock data for care management agencies
export const CARE_MANAGER_AGENCIES: CareManagerAgency[] = [
  {
    id: 'cm-1',
    name: 'HealthCare Partners Management',
    description: 'Comprehensive care management services for individuals with chronic conditions. We provide personalized care coordination, medication management, and health education.',
    phone: '+1 (555) 123-4567',
    email: 'info@healthcarepartners.com',
    website: 'www.healthcarepartners.com',
    address: '123 Medical Plaza',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    specialties: ['Chronic Disease Management', 'Medication Management', 'Care Coordination'],
    services: ['24/7 Nurse Hotline', 'Home Visits', 'Telehealth Consultations', 'Medication Reviews'],
    rating: 4.8,
    reviewCount: 127,
  },
  {
    id: 'cm-2',
    name: 'Wellness Care Solutions',
    description: 'Dedicated to improving health outcomes through proactive care management. Our team of registered nurses and care coordinators work closely with patients and their families.',
    phone: '+1 (555) 234-5678',
    email: 'contact@wellnesscare.com',
    website: 'www.wellnesscare.com',
    address: '456 Health Avenue',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    specialties: ['Preventive Care', 'Health Coaching', 'Transitional Care'],
    services: ['Health Assessments', 'Care Planning', 'Provider Coordination', 'Health Education'],
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: 'cm-3',
    name: 'Comprehensive Care Network',
    description: 'A network of experienced care managers providing holistic care coordination services. We focus on connecting patients with the right resources and support.',
    phone: '+1 (555) 345-6789',
    email: 'support@comprehensivecare.com',
    website: 'www.comprehensivecare.com',
    address: '789 Care Boulevard',
    city: 'San Diego',
    state: 'CA',
    zipCode: '92101',
    specialties: ['Complex Care Management', 'Mental Health Support', 'Social Services Coordination'],
    services: ['Multi-disciplinary Team', 'Behavioral Health Support', 'Social Work Services', 'Community Resources'],
    rating: 4.9,
    reviewCount: 203,
  },
  {
    id: 'cm-4',
    name: 'Patient Advocate Services',
    description: 'Empowering patients through personalized care management. We help navigate the healthcare system and ensure continuity of care across all providers.',
    phone: '+1 (555) 456-7890',
    email: 'help@patientadvocate.com',
    website: 'www.patientadvocate.com',
    address: '321 Support Street',
    city: 'Oakland',
    state: 'CA',
    zipCode: '94601',
    specialties: ['Patient Advocacy', 'Healthcare Navigation', 'Insurance Coordination'],
    services: ['Appointment Scheduling', 'Insurance Assistance', 'Medical Records Management', 'Provider Communication'],
    rating: 4.7,
    reviewCount: 156,
  },
  {
    id: 'cm-5',
    name: 'Integrated Health Management',
    description: 'Seamless care coordination for individuals with multiple health conditions. Our integrated approach ensures all aspects of your health are managed effectively.',
    phone: '+1 (555) 567-8901',
    email: 'info@integratedhealth.com',
    website: 'www.integratedhealth.com',
    address: '654 Wellness Way',
    city: 'Sacramento',
    state: 'CA',
    zipCode: '95814',
    specialties: ['Multi-condition Management', 'Medication Therapy Management', 'Chronic Disease Care'],
    services: ['Comprehensive Health Assessments', 'Medication Reviews', 'Care Plan Development', 'Regular Check-ins'],
    rating: 4.5,
    reviewCount: 94,
  },
];

/**
 * Get all care manager agencies
 */
export function getAllCareManagerAgencies(): CareManagerAgency[] {
  return CARE_MANAGER_AGENCIES;
}

/**
 * Get care manager agency by ID
 */
export function getCareManagerAgencyById(id: string): CareManagerAgency | undefined {
  return CARE_MANAGER_AGENCIES.find(agency => agency.id === id);
}

/**
 * Search care manager agencies by query
 */
export function searchCareManagerAgencies(query: string): CareManagerAgency[] {
  if (!query.trim()) return CARE_MANAGER_AGENCIES;
  
  const lowerQuery = query.toLowerCase().trim();
  return CARE_MANAGER_AGENCIES.filter(agency => 
    agency.name.toLowerCase().includes(lowerQuery) ||
    agency.description.toLowerCase().includes(lowerQuery) ||
    agency.city?.toLowerCase().includes(lowerQuery) ||
    agency.state?.toLowerCase().includes(lowerQuery) ||
    agency.specialties?.some(s => s.toLowerCase().includes(lowerQuery)) ||
    agency.services?.some(s => s.toLowerCase().includes(lowerQuery))
  );
}
