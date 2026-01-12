/**
 * Fasten Health Data Processor
 * 
 * This service processes raw FHIR data from Fasten Health and transforms it into
 * a structured format that's compatible with the app views.
 * 
 * Designed to be API-ready: This processor is stateless and can be easily moved
 * to a backend API service. It takes raw data as input and returns processed data.
 * 
 * Features:
 * - Handles multiple clinics
 * - Handles multiple patients
 * - Groups data by clinic and patient
 * - Generates meaningful, structured JSON output
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface ProcessedClinic {
  id: string;
  name: string;
  identifier?: string;
  address?: {
    line?: string[];
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
}

export interface ProcessedPatient {
  id: string;
  clinicId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: {
    line?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  maritalStatus?: string;
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
  };
}

export interface ProcessedProvider {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  qualifications?: string;
  specialty?: string;
  phone?: string;
  email?: string;
  engagementCount: number; // Number of encounters/reports with this provider
}

export interface ProcessedMedicalReport {
  id: string;
  clinicId: string;
  patientId: string;
  title: string;
  category: string;
  date: string;
  formattedDate: string;
  provider?: {
    id: string;
    name: string;
  };
  status: 'Available' | 'Pending' | 'Completed';
  fileType?: string;
  fileUrl?: string;
  interpretedBy?: string;
  signedBy?: string;
  signedOn?: string;
  performingFacility?: {
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  clinicalHistory?: string;
  orderNumber?: string;
}

export interface ProcessedAppointment {
  id: string;
  clinicId: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  doctorName: string;
  doctorSpecialty: string;
  diagnosis?: string;
  providerId?: string;
}

export interface ProcessedMedication {
  id: string;
  clinicId: string;
  patientId: string;
  name: string;
  dosage?: string;
  frequency?: string;
  startDate?: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'Stopped';
  prescriber?: {
    id: string;
    name: string;
  };
}

export interface ProcessedEncounter {
  id: string;
  clinicId: string;
  patientId: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  providers?: Array<{
    id: string;
    name: string;
  }>;
}

export interface ProcessedHealthData {
  clinics: ProcessedClinic[];
  patients: ProcessedPatient[];
  providers: ProcessedProvider[];
  medicalReports: ProcessedMedicalReport[];
  appointments: ProcessedAppointment[];
  medications: ProcessedMedication[];
  encounters: ProcessedEncounter[];
  metadata: {
    processedAt: string;
    totalClinics: number;
    totalPatients: number;
    totalProviders: number;
    totalReports: number;
    totalAppointments: number;
    totalMedications: number;
  };
}

// ============================================================================
// FHIR Resource Type Definitions (for processing)
// ============================================================================

interface FHIRResource {
  resourceType: string;
  id: string;
  [key: string]: any;
}

interface FHIRPatient extends FHIRResource {
  resourceType: 'Patient';
  name?: Array<{
    text?: string;
    family?: string;
    given?: string[];
    use?: string;
  }>;
  birthDate?: string;
  gender?: string;
  telecom?: Array<{
    system?: string;
    value?: string;
    use?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    text?: string;
  }>;
  maritalStatus?: {
    text?: string;
    coding?: Array<{
      display?: string;
    }>;
  };
  contact?: Array<{
    name?: {
      text?: string;
      family?: string;
      given?: string[];
    };
    relationship?: Array<{
      coding?: Array<{
        code?: string;
        display?: string;
      }>;
    }>;
    telecom?: Array<{
      system?: string;
      value?: string;
    }>;
  }>;
  managingOrganization?: {
    reference?: string;
    display?: string;
  };
}

interface FHIRPractitioner extends FHIRResource {
  resourceType: 'Practitioner';
  name?: Array<{
    text?: string;
    family?: string;
    given?: string[];
    suffix?: string[];
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
  }>;
  qualification?: Array<{
    code?: {
      text?: string;
      coding?: Array<{
        display?: string;
      }>;
    };
  }>;
}

interface FHIRDiagnosticReport extends FHIRResource {
  resourceType: 'DiagnosticReport';
  status: string;
  category?: Array<{
    coding?: Array<{
      display?: string;
    }>;
    text?: string;
  }>;
  code?: {
    coding?: Array<{
      display?: string;
    }>;
    text?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  encounter?: {
    reference?: string;
    display?: string;
  };
  effectiveDateTime?: string;
  issued?: string;
  performer?: Array<{
    reference?: string;
    type?: string;
    display?: string;
  }>;
  resultsInterpreter?: Array<{
    reference?: string;
    display?: string;
  }>;
  presentedForm?: Array<{
    contentType?: string;
    url?: string;
    title?: string;
  }>;
  identifier?: Array<{
    value?: string;
  }>;
  conclusionCode?: Array<{
    text?: string;
  }>;
}

interface FHIREncounter extends FHIRResource {
  resourceType: 'Encounter';
  status?: string;
  class?: {
    display?: string;
  };
  type?: Array<{
    text?: string;
    coding?: Array<{
      display?: string;
    }>;
  }>;
  period?: {
    start?: string;
    end?: string;
  };
  subject?: {
    reference?: string;
  };
  participant?: Array<{
    individual?: {
      reference?: string;
    };
  }>;
  serviceProvider?: {
    reference?: string;
    display?: string;
  };
}

interface FHIRMedicationStatement extends FHIRResource {
  resourceType: 'MedicationStatement';
  status?: string;
  medicationCodeableConcept?: {
    text?: string;
    coding?: Array<{
      display?: string;
    }>;
  };
  effectivePeriod?: {
    start?: string;
    end?: string;
  };
  dosage?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: string;
      };
    };
  }>;
  informationSource?: {
    reference?: string;
    display?: string;
  };
  subject?: {
    reference?: string;
  };
}

interface FHIROrganization extends FHIRResource {
  resourceType: 'Organization';
  name?: string;
  identifier?: Array<{
    value?: string;
  }>;
  telecom?: Array<{
    system?: string;
    value?: string;
  }>;
  address?: Array<{
    line?: string[];
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>;
}

// ============================================================================
// Main Processing Functions
// ============================================================================

/**
 * Processes raw FHIR data and returns structured health data
 * This is the main entry point for data processing
 * 
 * @param rawFhirData - Array of FHIR resources
 * @returns Processed health data structured by clinic and patient
 */
export function processFastenHealthData(rawFhirData: FHIRResource[]): ProcessedHealthData {
  // Separate resources by type
  const patients: FHIRPatient[] = [];
  const practitioners: FHIRPractitioner[] = [];
  const diagnosticReports: FHIRDiagnosticReport[] = [];
  const encounters: FHIREncounter[] = [];
  const medications: FHIRMedicationStatement[] = [];
  const organizations: FHIROrganization[] = [];

  rawFhirData.forEach((resource: any) => {
    switch (resource.resourceType) {
      case 'Patient':
        patients.push(resource as FHIRPatient);
        break;
      case 'Practitioner':
        practitioners.push(resource as FHIRPractitioner);
        break;
      case 'DiagnosticReport':
        diagnosticReports.push(resource as FHIRDiagnosticReport);
        break;
      case 'Encounter':
        encounters.push(resource as FHIREncounter);
        break;
      case 'MedicationStatement':
        medications.push(resource as FHIRMedicationStatement);
        break;
      case 'Organization':
        organizations.push(resource as FHIROrganization);
        break;
    }
  });

  // Process clinics (organizations)
  const processedClinics = processClinics(organizations, rawFhirData);

  // Process patients and map to clinics
  const processedPatients = processPatients(patients, processedClinics);

  // Process providers with engagement counts
  const processedProviders = processProviders(practitioners, diagnosticReports, encounters);

  // Process medical reports
  const processedReports = processMedicalReports(
    diagnosticReports,
    practitioners,
    encounters,
    processedPatients,
    processedClinics
  );

  // Process appointments
  const processedAppointments = processAppointments(
    diagnosticReports,
    encounters,
    practitioners,
    processedPatients,
    processedClinics
  );

  // Process medications
  const processedMedications = processMedications(
    medications,
    practitioners,
    processedPatients,
    processedClinics
  );

  // Process encounters
  const processedEncounters = processEncounters(
    encounters,
    practitioners,
    processedPatients,
    processedClinics
  );

  return {
    clinics: processedClinics,
    patients: processedPatients,
    providers: processedProviders,
    medicalReports: processedReports,
    appointments: processedAppointments,
    medications: processedMedications,
    encounters: processedEncounters,
    metadata: {
      processedAt: new Date().toISOString(),
      totalClinics: processedClinics.length,
      totalPatients: processedPatients.length,
      totalProviders: processedProviders.length,
      totalReports: processedReports.length,
      totalAppointments: processedAppointments.length,
      totalMedications: processedMedications.length,
    },
  };
}

// ============================================================================
// Individual Processing Functions
// ============================================================================

/**
 * Processes organizations into clinics
 */
function processClinics(
  organizations: FHIROrganization[],
  allResources: FHIRResource[]
): ProcessedClinic[] {
  const clinics: ProcessedClinic[] = [];
  const clinicMap = new Map<string, ProcessedClinic>();

  // Process explicit organizations
  organizations.forEach(org => {
    const clinicId = org.id;
    if (!clinicMap.has(clinicId)) {
      const address = org.address?.[0];
      const phone = org.telecom?.find(t => t.system === 'phone')?.value;
      const email = org.telecom?.find(t => t.system === 'email')?.value;

      clinicMap.set(clinicId, {
        id: clinicId,
        name: org.name || 'Unknown Clinic',
        identifier: org.identifier?.[0]?.value,
        address: address ? {
          line: address.line,
          city: address.city,
          state: address.state,
          zip: address.postalCode,
          country: address.country,
        } : undefined,
        phone,
        email,
      });
    }
  });

  // Extract clinics from patient managing organizations
  allResources.forEach((resource: any) => {
    if (resource.resourceType === 'Patient' && resource.managingOrganization) {
      const orgRef = resource.managingOrganization.reference;
      if (orgRef) {
        const orgId = orgRef.split('/')[1];
        if (!clinicMap.has(orgId)) {
          clinicMap.set(orgId, {
            id: orgId,
            name: resource.managingOrganization.display || 'Unknown Clinic',
          });
        }
      }
    }
  });

  // If no clinics found, create a default one
  if (clinicMap.size === 0) {
    clinicMap.set('default-clinic', {
      id: 'default-clinic',
      name: 'Default Clinic',
    });
  }

  return Array.from(clinicMap.values());
}

/**
 * Processes patients and maps them to clinics
 */
function processPatients(
  patients: FHIRPatient[],
  clinics: ProcessedClinic[]
): ProcessedPatient[] {
  return patients.map(patient => {
    const nameObj = patient.name?.find(n => n.use === 'official') || patient.name?.[0] || {};
    const fullName = nameObj.text || 
      `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim() ||
      'Unknown Patient';

    const firstName = nameObj.given?.[0];
    const lastName = nameObj.family;

    const phone = patient.telecom?.find(t => t.system === 'phone' && t.use === 'home')?.value ||
      patient.telecom?.find(t => t.system === 'phone')?.value ||
      '';

    const email = patient.telecom?.find(t => t.system === 'email')?.value || '';

    const addressObj = patient.address?.find(a => a.use === 'home') || patient.address?.[0];
    const address = addressObj ? {
      line: addressObj.line?.[0],
      city: addressObj.city,
      state: addressObj.state,
      zip: addressObj.postalCode,
      country: addressObj.country,
    } : undefined;

    const maritalStatus = patient.maritalStatus?.text || 
      patient.maritalStatus?.coding?.[0]?.display || '';

    let emergencyContact: ProcessedPatient['emergencyContact'] | undefined;
    const contact = patient.contact?.find(c => 
      c.relationship?.some(r => 
        r.coding?.some(coding => coding.code === 'C' || coding.display?.toLowerCase().includes('emergency'))
      )
    );

    if (contact) {
      const contactName = contact.name?.text || 
        `${contact.name?.given?.join(' ') || ''} ${contact.name?.family || ''}`.trim();
      const relationship = contact.relationship?.[0]?.coding?.[0]?.display || '';
      const contactPhone = contact.telecom?.find(t => t.system === 'phone')?.value || '';

      emergencyContact = {
        name: contactName,
        relationship,
        phone: contactPhone,
      };
    }

    // Map patient to clinic (use managing organization or default to first clinic)
    const clinicId = patient.managingOrganization?.reference?.split('/')[1] || 
      clinics[0]?.id || 'default-clinic';

    return {
      id: patient.id,
      clinicId,
      name: fullName,
      firstName,
      lastName,
      birthDate: patient.birthDate,
      gender: patient.gender,
      phone,
      email,
      address,
      maritalStatus: maritalStatus || undefined,
      emergencyContact,
    };
  });
}

/**
 * Processes practitioners into providers with engagement counts
 */
function processProviders(
  practitioners: FHIRPractitioner[],
  diagnosticReports: FHIRDiagnosticReport[],
  encounters: FHIREncounter[]
): ProcessedProvider[] {
  // Count engagements per practitioner
  const engagementCountMap = new Map<string, number>();

  diagnosticReports.forEach(report => {
    if (report.performer && report.performer.length > 0) {
      report.performer.forEach(performer => {
        if (performer.reference && (!performer.type || performer.type === 'Practitioner')) {
          const practitionerId = performer.reference.split('/')[1];
          if (practitionerId) {
            engagementCountMap.set(
              practitionerId,
              (engagementCountMap.get(practitionerId) || 0) + 1
            );
          }
        }
      });
    }

    if (report.resultsInterpreter && report.resultsInterpreter.length > 0) {
      report.resultsInterpreter.forEach(interpreter => {
        if (interpreter.reference) {
          const practitionerId = interpreter.reference.split('/')[1];
          if (practitionerId) {
            engagementCountMap.set(
              practitionerId,
              (engagementCountMap.get(practitionerId) || 0) + 1
            );
          }
        }
      });
    }
  });

  encounters.forEach(encounter => {
    if (encounter.participant) {
      encounter.participant.forEach(participant => {
        if (participant.individual?.reference) {
          const practitionerId = participant.individual.reference.split('/')[1];
          if (practitionerId) {
            engagementCountMap.set(
              practitionerId,
              (engagementCountMap.get(practitionerId) || 0) + 1
            );
          }
        }
      });
    }
  });

  return practitioners.map(practitioner => {
    const nameObj = practitioner.name?.[0] || {};
    const fullName = nameObj.text || 
      `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim() ||
      'Unknown Provider';

    const firstName = nameObj.given?.[0];
    const lastName = nameObj.family;

    // Extract qualifications
    let qualifications = '';
    if (nameObj.suffix && nameObj.suffix.length > 0) {
      qualifications = nameObj.suffix.join(', ');
    } else if (practitioner.qualification && practitioner.qualification.length > 0) {
      qualifications = practitioner.qualification
        .map(q => q.code?.text || q.code?.coding?.[0]?.display)
        .filter(Boolean)
        .join(', ');
    }

    // Extract specialty from qualifications
    let specialty = '';
    const qualsLower = qualifications.toLowerCase();
    if (qualsLower.includes('cardiology') || qualsLower.includes('cardiac')) {
      specialty = 'Cardiology';
    } else if (qualsLower.includes('neurology') || qualsLower.includes('neuro')) {
      specialty = 'Neurology';
    } else if (qualsLower.includes('pediatric')) {
      specialty = 'Pediatrics';
    } else if (qualsLower.includes('ortho')) {
      specialty = 'Orthopedics';
    }

    const phone = practitioner.telecom?.find(t => t.system === 'phone')?.value || '';
    const email = practitioner.telecom?.find(t => t.system === 'email')?.value || '';

    return {
      id: practitioner.id,
      name: fullName,
      firstName,
      lastName,
      qualifications: qualifications || undefined,
      specialty: specialty || undefined,
      phone: phone || undefined,
      email: email || undefined,
      engagementCount: engagementCountMap.get(practitioner.id) || 0,
    };
  }).sort((a, b) => b.engagementCount - a.engagementCount); // Sort by engagement
}

/**
 * Processes diagnostic reports into medical reports
 */
function processMedicalReports(
  diagnosticReports: FHIRDiagnosticReport[],
  practitioners: FHIRPractitioner[],
  encounters: FHIREncounter[],
  patients: ProcessedPatient[],
  clinics: ProcessedClinic[]
): ProcessedMedicalReport[] {
  const practitionerMap = new Map(practitioners.map(p => [p.id, p]));
  const patientMap = new Map(patients.map(p => [p.id, p]));

  return diagnosticReports
    .sort((a, b) => {
      const dateA = a.effectiveDateTime || a.issued || '';
      const dateB = b.effectiveDateTime || b.issued || '';
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    })
    .map(report => {
      const date = report.effectiveDateTime || report.issued || new Date().toISOString();
      const dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      // Get patient and clinic
      const patientId = report.subject?.reference?.split('/')[1];
      const patient = patientId ? patientMap.get(patientId) : undefined;
      const clinicId = patient?.clinicId || clinics[0]?.id || 'default-clinic';

      // Get provider
      let provider: ProcessedMedicalReport['provider'];
      if (report.performer && report.performer.length > 0) {
        const performer = report.performer.find(p => p.type === 'Practitioner') || report.performer[0];
        if (performer.reference) {
          const practitionerId = performer.reference.split('/')[1];
          const practitioner = practitionerMap.get(practitionerId);
          if (practitioner) {
            const nameObj = practitioner.name?.[0] || {};
            const providerName = nameObj.text || 
              `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim();
            provider = {
              id: practitionerId,
              name: providerName,
            };
          }
        }
      }

      // Determine category
      let category = 'Medical Records';
      if (report.category && report.category.length > 0) {
        const categoryText = report.category[0].text || report.category[0].coding?.[0]?.display || '';
        const catLower = categoryText.toLowerCase();
        if (catLower.includes('imaging') || catLower.includes('radiology')) {
          category = 'Imaging';
        } else if (catLower.includes('pathology')) {
          category = 'Pathology';
        } else if (catLower.includes('lab') || catLower.includes('laboratory')) {
          category = 'Lab Reports';
        } else {
          category = categoryText || 'Medical Records';
        }
      }

      // Get title
      const title = report.code?.text || report.code?.coding?.[0]?.display || 'Medical Report';

      // Get file info
      const fileForm = report.presentedForm?.[0];
      const fileType = fileForm?.contentType;
      const fileUrl = fileForm?.url;

      // Get interpreter
      let interpretedBy: string | undefined;
      if (report.resultsInterpreter && report.resultsInterpreter.length > 0) {
        const interpreter = report.resultsInterpreter[0];
        if (interpreter.display) {
          interpretedBy = interpreter.display;
        } else if (interpreter.reference) {
          const practitionerId = interpreter.reference.split('/')[1];
          const practitioner = practitionerMap.get(practitionerId);
          if (practitioner) {
            const nameObj = practitioner.name?.[0] || {};
            interpretedBy = nameObj.text || 
              `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim();
          }
        }
      }

      // Get performing facility
      let performingFacility: ProcessedMedicalReport['performingFacility'];
      if (report.performer) {
        const orgPerformer = report.performer.find(p => p.type === 'Organization');
        if (orgPerformer?.display) {
          performingFacility = {
            name: orgPerformer.display,
          };
        }
      }

      // Get clinical history from encounter
      let clinicalHistory: string | undefined;
      if (report.encounter?.reference) {
        const encounterId = report.encounter.reference.split('/')[1];
        const encounter = encounters.find(e => e.id === encounterId);
        if (encounter?.type?.[0]?.text) {
          clinicalHistory = encounter.type[0].text;
        }
      }

      // Get order number
      const orderNumber = report.identifier?.[0]?.value;

      // Determine status
      let status: 'Available' | 'Pending' | 'Completed' = 'Available';
      if (report.status === 'final' || report.status === 'amended') {
        status = 'Completed';
      } else if (report.status === 'preliminary' || report.status === 'registered') {
        status = 'Pending';
      }

      return {
        id: report.id,
        clinicId,
        patientId: patientId || '',
        title,
        category,
        date,
        formattedDate,
        provider,
        status,
        fileType,
        fileUrl,
        interpretedBy,
        signedBy: interpretedBy,
        signedOn: dateObj.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        performingFacility,
        clinicalHistory,
        orderNumber,
      };
    });
}

/**
 * Processes diagnostic reports and encounters into appointments
 */
function processAppointments(
  diagnosticReports: FHIRDiagnosticReport[],
  encounters: FHIREncounter[],
  practitioners: FHIRPractitioner[],
  patients: ProcessedPatient[],
  clinics: ProcessedClinic[]
): ProcessedAppointment[] {
  const practitionerMap = new Map(practitioners.map(p => [p.id, p]));
  const patientMap = new Map(patients.map(p => [p.id, p]));
  const encounterMap = new Map(encounters.map(e => [e.id, e]));

  const appointments: ProcessedAppointment[] = [];

  diagnosticReports.forEach(report => {
    if (report.encounter?.reference) {
      const encounterId = report.encounter.reference.split('/')[1];
      const encounter = encounterMap.get(encounterId);
      const date = report.effectiveDateTime || report.issued || new Date().toISOString();
      const dateObj = new Date(date);

      const patientId = report.subject?.reference?.split('/')[1];
      const patient = patientId ? patientMap.get(patientId) : undefined;
      const clinicId = patient?.clinicId || clinics[0]?.id || 'default-clinic';

      // Get provider
      let doctorName = 'Unknown Doctor';
      let doctorSpecialty = 'General';
      let providerId: string | undefined;

      if (report.performer && report.performer.length > 0) {
        const performer = report.performer[0];
        if (performer.display) {
          doctorName = performer.display;
        } else if (performer.reference) {
          const practitionerId = performer.reference.split('/')[1];
          const practitioner = practitionerMap.get(practitionerId);
          if (practitioner) {
            providerId = practitionerId;
            const nameObj = practitioner.name?.[0] || {};
            doctorName = nameObj.text || 
              `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim();
            
            // Try to get specialty
            const quals = practitioner.qualification?.[0]?.code?.text || '';
            if (quals.toLowerCase().includes('cardiology')) {
              doctorSpecialty = 'Cardiology';
            } else if (quals.toLowerCase().includes('neurology')) {
              doctorSpecialty = 'Neurology';
            }
          }
        }
      }

      const type = encounter?.type?.[0]?.text || 
        encounter?.class?.display || 
        'Follow-up';

      let status: 'Scheduled' | 'Completed' | 'Cancelled' = 'Completed';
      if (dateObj > new Date()) {
        status = 'Scheduled';
      } else if (encounter.status === 'cancelled') {
        status = 'Cancelled';
      }

      const diagnosis = report.conclusionCode?.[0]?.text || report.code?.text;

      appointments.push({
        id: report.id,
        clinicId,
        patientId: patientId || '',
        date: dateObj.toISOString().split('T')[0],
        time: dateObj.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }),
        type,
        status,
        doctorName,
        doctorSpecialty,
        diagnosis,
        providerId,
      });
    }
  });

  // Remove duplicates and sort
  const uniqueAppointments = Array.from(
    new Map(appointments.map(apt => [apt.id, apt])).values()
  ).sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time).getTime();
    const dateB = new Date(b.date + ' ' + b.time).getTime();
    return dateB - dateA;
  });

  return uniqueAppointments;
}

/**
 * Processes medication statements
 */
function processMedications(
  medications: FHIRMedicationStatement[],
  practitioners: FHIRPractitioner[],
  patients: ProcessedPatient[],
  clinics: ProcessedClinic[]
): ProcessedMedication[] {
  const practitionerMap = new Map(practitioners.map(p => [p.id, p]));
  const patientMap = new Map(patients.map(p => [p.id, p]));

  return medications.map(med => {
    const patientId = med.subject?.reference?.split('/')[1];
    const patient = patientId ? patientMap.get(patientId) : undefined;
    const clinicId = patient?.clinicId || clinics[0]?.id || 'default-clinic';

    const name = med.medicationCodeableConcept?.text || 
      med.medicationCodeableConcept?.coding?.[0]?.display || 
      'Unknown Medication';

    const dosage = med.dosage?.[0]?.text;
    const frequency = med.dosage?.[0]?.timing?.repeat 
      ? `${med.dosage[0].timing.repeat.frequency || 1} times per ${med.dosage[0].timing.repeat.period || 'day'}`
      : undefined;

    const startDate = med.effectivePeriod?.start;
    const endDate = med.effectivePeriod?.end;

    let status: 'Active' | 'Completed' | 'Stopped' = 'Active';
    if (med.status === 'completed' || (endDate && new Date(endDate) < new Date())) {
      status = 'Completed';
    } else if (med.status === 'stopped' || med.status === 'cancelled') {
      status = 'Stopped';
    }

    let prescriber: ProcessedMedication['prescriber'];
    if (med.informationSource?.reference) {
      const practitionerId = med.informationSource.reference.split('/')[1];
      const practitioner = practitionerMap.get(practitionerId);
      if (practitioner) {
        const nameObj = practitioner.name?.[0] || {};
        const prescriberName = nameObj.text || 
          `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim();
        prescriber = {
          id: practitionerId,
          name: prescriberName,
        };
      }
    }

    return {
      id: med.id,
      clinicId,
      patientId: patientId || '',
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      status,
      prescriber,
    };
  });
}

/**
 * Processes encounters
 */
function processEncounters(
  encounters: FHIREncounter[],
  practitioners: FHIRPractitioner[],
  patients: ProcessedPatient[],
  clinics: ProcessedClinic[]
): ProcessedEncounter[] {
  const practitionerMap = new Map(practitioners.map(p => [p.id, p]));
  const patientMap = new Map(patients.map(p => [p.id, p]));

  return encounters.map(encounter => {
    const patientId = encounter.subject?.reference?.split('/')[1];
    const patient = patientId ? patientMap.get(patientId) : undefined;
    const clinicId = patient?.clinicId || clinics[0]?.id || 'default-clinic';

    const providers: Array<{ id: string; name: string }> = [];
    if (encounter.participant) {
      encounter.participant.forEach(participant => {
        if (participant.individual?.reference) {
          const practitionerId = participant.individual.reference.split('/')[1];
          const practitioner = practitionerMap.get(practitionerId);
          if (practitioner) {
            const nameObj = practitioner.name?.[0] || {};
            const providerName = nameObj.text || 
              `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim();
            providers.push({
              id: practitionerId,
              name: providerName,
            });
          }
        }
      });
    }

    return {
      id: encounter.id,
      clinicId,
      patientId: patientId || '',
      type: encounter.type?.[0]?.text || encounter.class?.display,
      status: encounter.status,
      startDate: encounter.period?.start,
      endDate: encounter.period?.end,
      providers: providers.length > 0 ? providers : undefined,
    };
  });
}

// ============================================================================
// Utility Functions for API Integration
// ============================================================================

/**
 * Processes data from a JSON file (for app usage)
 * Can be replaced with API call when moved to backend
 */
export async function processFastenHealthDataFromFile(
  filePath?: string
): Promise<ProcessedHealthData> {
  try {
    // In app: load from file
    // In API: this would be replaced with database query or API call
    const fastenData = require('../data/fasten-health-data.json');
    const rawData = Array.isArray(fastenData) ? fastenData : [fastenData];
    return processFastenHealthData(rawData);
  } catch (error) {
    console.error('Error processing Fasten Health data from file:', error);
    throw error;
  }
}

/**
 * Gets processed data for a specific patient
 */
export function getPatientData(
  processedData: ProcessedHealthData,
  patientId: string
): {
  patient: ProcessedPatient | undefined;
  reports: ProcessedMedicalReport[];
  appointments: ProcessedAppointment[];
  medications: ProcessedMedication[];
  encounters: ProcessedEncounter[];
} {
  return {
    patient: processedData.patients.find(p => p.id === patientId),
    reports: processedData.medicalReports.filter(r => r.patientId === patientId),
    appointments: processedData.appointments.filter(a => a.patientId === patientId),
    medications: processedData.medications.filter(m => m.patientId === patientId),
    encounters: processedData.encounters.filter(e => e.patientId === patientId),
  };
}

/**
 * Gets processed data for a specific clinic
 */
export function getClinicData(
  processedData: ProcessedHealthData,
  clinicId: string
): {
  clinic: ProcessedClinic | undefined;
  patients: ProcessedPatient[];
  reports: ProcessedMedicalReport[];
  appointments: ProcessedAppointment[];
  medications: ProcessedMedication[];
} {
  return {
    clinic: processedData.clinics.find(c => c.id === clinicId),
    patients: processedData.patients.filter(p => p.clinicId === clinicId),
    reports: processedData.medicalReports.filter(r => r.clinicId === clinicId),
    appointments: processedData.appointments.filter(a => a.clinicId === clinicId),
    medications: processedData.medications.filter(m => m.clinicId === clinicId),
  };
}

