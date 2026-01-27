/**
 * Mock FHIR Data Generator
 * 
 * Generates HL7 FHIR R4 compliant mock data for testing purposes.
 * Creates data for 5 different hospitals with the same patient but different treatments.
 * 
 * Usage: node scripts/generate-mock-fhir-data.js
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// Configuration
// ============================================================================

const BASE_PATIENT = {
  firstName: "John",
  lastName: "Smith",
  birthDate: "1980-05-15",
  gender: "male",
  phone: "+1-555-123-4567",
  email: "john.smith@example.com",
  address: {
    line: ["123 Main Street"],
    city: "San Francisco",
    state: "CA",
    postalCode: "94102",
    country: "USA"
  }
};

const HOSPITALS = [
  {
    id: "hosp-001",
    name: "Metropolitan General Hospital",
    identifier: "MGH-001",
    address: {
      line: ["100 Medical Center Drive"],
      city: "San Francisco",
      state: "CA",
      postalCode: "94110",
      country: "USA"
    },
    phone: "+1-415-555-1000",
    email: "info@metropolitanhospital.org",
    specialty: "Cardiology",
    conditions: ["Hypertension", "Atrial Fibrillation"],
    treatments: ["Cardiac Monitoring", "Blood Pressure Management", "Anticoagulation Therapy"]
  },
  {
    id: "hosp-002",
    name: "Pacific Coast Medical Center",
    identifier: "PCMC-002",
    address: {
      line: ["250 Ocean Boulevard"],
      city: "Los Angeles",
      state: "CA",
      postalCode: "90025",
      country: "USA"
    },
    phone: "+1-310-555-2000",
    email: "contact@pacificcoastmed.org",
    specialty: "Orthopedics",
    conditions: ["Osteoarthritis of Right Knee", "Chronic Lower Back Pain"],
    treatments: ["Physical Therapy", "Knee Replacement Surgery", "Pain Management"]
  },
  {
    id: "hosp-003",
    name: "Valley Regional Hospital",
    identifier: "VRH-003",
    address: {
      line: ["500 Health Parkway"],
      city: "Sacramento",
      state: "CA",
      postalCode: "95825",
      country: "USA"
    },
    phone: "+1-916-555-3000",
    email: "admin@valleyregional.org",
    specialty: "Endocrinology",
    conditions: ["Type 2 Diabetes Mellitus", "Diabetic Neuropathy"],
    treatments: ["Insulin Therapy", "Blood Glucose Monitoring", "Diabetic Foot Care"]
  },
  {
    id: "hosp-004",
    name: "Mountain View Medical Center",
    identifier: "MVMC-004",
    address: {
      line: ["750 Summit Avenue"],
      city: "Denver",
      state: "CO",
      postalCode: "80202",
      country: "USA"
    },
    phone: "+1-303-555-4000",
    email: "info@mountainviewmed.org",
    specialty: "Pulmonology",
    conditions: ["Chronic Obstructive Pulmonary Disease", "Asthma"],
    treatments: ["Bronchodilator Therapy", "Pulmonary Rehabilitation", "Oxygen Therapy"]
  },
  {
    id: "hosp-005",
    name: "Riverside Community Hospital",
    identifier: "RCH-005",
    address: {
      line: ["300 Riverside Drive"],
      city: "Portland",
      state: "OR",
      postalCode: "97201",
      country: "USA"
    },
    phone: "+1-503-555-5000",
    email: "contact@riversidehospital.org",
    specialty: "Gastroenterology",
    conditions: ["Gastroesophageal Reflux Disease", "Irritable Bowel Syndrome"],
    treatments: ["Acid Suppression Therapy", "Dietary Management", "Endoscopic Procedures"]
  }
];

// ============================================================================
// Helper Functions
// ============================================================================

function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
  return date.toISOString();
}

function getRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================================================
// FHIR Resource Generators
// ============================================================================

function generatePatient(patientId, hospitalId, hospitalIndex = 0) {
  const mrn = `MRN-${hospitalId}-${getRandomInt(100000, 999999)}`;
  const cid = `${getRandomInt(10000000000, 99999999999)}`;
  const ceid = generateId().substring(0, 16).toUpperCase();
  
  return {
    resourceType: "Patient",
    id: patientId,
    extension: [
      {
        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race",
        extension: [
          {
            url: "ombCategory",
            valueCoding: {
              system: "urn:oid:2.16.840.1.113883.6.238",
              code: "2106-3",
              display: "White"
            }
          },
          {
            url: "text",
            valueString: "White"
          }
        ]
      },
      {
        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity",
        extension: [
          {
            url: "text",
            valueString: "Not Hispanic or Latino"
          }
        ]
      },
      {
        url: "http://hl7.org/fhir/us/core/StructureDefinition/us-core-sex",
        valueCode: "184115007"
      }
    ],
    identifier: [
      {
        use: "usual",
        type: {
          text: "MRN"
        },
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.5.${hospitalId}`,
        value: mrn
      },
      {
        use: "usual",
        type: {
          text: "CID"
        },
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.3.${hospitalId}.11`,
        value: cid
      },
      {
        use: "usual",
        type: {
          text: "CEID"
        },
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.3.${hospitalId}.100`,
        value: ceid
      },
      {
        use: "usual",
        type: {
          text: "EPI"
        },
        system: `urn:oid:1.2.840.114350.1.1`,
        value: `E${getRandomInt(20000000000, 29999999999)}`
      },
      {
        use: "usual",
        type: {
          text: "FHIR"
        },
        system: "http://open.epic.com/FHIR/StructureDefinition/patient-fhir-id",
        value: patientId
      },
      {
        use: "usual",
        system: "https://open.epic.com/FHIR/StructureDefinition/PayerMemberId",
        value: `${String.fromCharCode(65 + (hospitalIndex % 26))}${getRandomInt(100000000, 999999999)}`
      },
      {
        use: "usual",
        system: "https://open.epic.com/FHIR/StructureDefinition/PayerMemberId",
        value: `M${getRandomInt(100000000, 999999999)}`
      },
      {
        use: "usual",
        system: "https://open.epic.com/FHIR/StructureDefinition/PayerMemberId",
        value: `XRT${getRandomInt(100000000, 999999999)}`
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        text: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`,
        family: BASE_PATIENT.lastName,
        given: [BASE_PATIENT.firstName]
      }
    ],
    telecom: [
      {
        system: "phone",
        value: BASE_PATIENT.phone,
        use: "home"
      },
      {
        system: "email",
        value: BASE_PATIENT.email,
        rank: 1
      }
    ],
    gender: BASE_PATIENT.gender,
    birthDate: BASE_PATIENT.birthDate,
    deceasedBoolean: false,
    address: [
      {
        use: "home",
        text: `${BASE_PATIENT.address.line[0]}\n${BASE_PATIENT.address.city} ${BASE_PATIENT.address.state} ${BASE_PATIENT.address.postalCode}\n${BASE_PATIENT.address.country}`,
        line: BASE_PATIENT.address.line,
        city: BASE_PATIENT.address.city,
        state: BASE_PATIENT.address.state,
        postalCode: BASE_PATIENT.address.postalCode,
        country: BASE_PATIENT.address.country
      }
    ],
    maritalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-MaritalStatus",
          code: "M",
          display: "Married"
        }
      ],
      text: "Married"
    },
    contact: [
      {
        relationship: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/v2-0131",
                code: "C",
                display: "Emergency Contact"
              },
              {
                system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
                code: "SPS",
                display: "spouse"
              }
            ],
            text: "Spouse"
          }
        ],
        name: {
          use: "usual",
          text: "Jane Smith",
          family: "Smith",
          given: ["Jane"]
        },
        telecom: [
          {
            system: "phone",
            value: "+1-555-123-4568",
            use: "mobile",
            rank: 1
          }
        ]
      }
    ],
    communication: [
      {
        language: {
          coding: [
            {
              system: "urn:ietf:bcp:47",
              code: "en",
              display: "English"
            }
          ],
          text: "English"
        },
        preferred: true
      }
    ],
    managingOrganization: {
      reference: `Organization/${hospitalId}`,
      display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
    }
  };
}

function generateOrganization(hospital) {
  return {
    resourceType: "Organization",
    id: hospital.id,
    identifier: [
      {
        use: "usual",
        type: {
          text: "Hospital ID"
        },
        system: "urn:oid:1.2.840.114350.1.13.297.2.7.3",
        value: hospital.identifier
      }
    ],
    active: true,
    name: hospital.name,
    telecom: [
      {
        system: "phone",
        value: hospital.phone,
        use: "work"
      },
      {
        system: "email",
        value: hospital.email,
        use: "work"
      }
    ],
    address: [
      {
        use: "work",
        text: `${hospital.address.line[0]}\n${hospital.address.city} ${hospital.address.state} ${hospital.address.postalCode}\n${hospital.address.country}`,
        line: hospital.address.line,
        city: hospital.address.city,
        state: hospital.address.state,
        postalCode: hospital.address.postalCode,
        country: hospital.address.country
      }
    ],
    type: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/organization-type",
            code: "prov",
            display: "Healthcare Provider"
          }
        ],
        text: "Hospital"
      }
    ]
  };
}

function generatePractitioner(hospitalId, index, specialty, globalIndex) {
  // Expanded name lists to ensure uniqueness across all hospitals
  const firstNames = [
    "Sarah", "Michael", "Emily", "David", "Jessica", "Robert", "Amanda", "James",
    "Jennifer", "Christopher", "Lisa", "Daniel", "Michelle", "Matthew", "Ashley", "Andrew",
    "Nicole", "Joshua", "Stephanie", "Ryan", "Melissa", "Kevin", "Lauren", "Justin",
    "Rachel", "Brandon", "Samantha", "Tyler", "Megan", "Jacob", "Brittany", "Nicholas",
    "Amanda", "Jonathan", "Kimberly", "Nathan"
  ];
  const lastNames = [
    "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez",
    "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore",
    "Jackson", "Martin", "Lee", "Thompson", "White", "Harris", "Clark", "Lewis",
    "Robinson", "Walker", "Young", "King", "Wright", "Scott", "Torres", "Nguyen",
    "Hill", "Flores", "Green", "Adams"
  ];
  const titles = ["MD", "DO", "NP", "PA"];
  
  // Use globalIndex to ensure unique names across all hospitals
  const firstName = firstNames[globalIndex % firstNames.length];
  const lastName = lastNames[globalIndex % lastNames.length];
  const title = titles[globalIndex % titles.length];
  const practitionerId = generateId(`pract-${hospitalId}-`);
  
  return {
    resourceType: "Practitioner",
    id: practitionerId,
    identifier: [
      {
        use: "usual",
        type: {
          text: "NPI"
        },
        system: "http://hl7.org/fhir/sid/us-npi",
        value: `${getRandomInt(1000000000, 9999999999)}`
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        text: `${firstName} ${lastName}, ${title}`,
        family: lastName,
        given: [firstName],
        suffix: [title]
      }
    ],
    telecom: [
      {
        system: "phone",
        value: `+1-555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
        use: "work"
      },
      {
        system: "email",
        value: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@hospital.org`,
        use: "work"
      }
    ],
    qualification: [
      {
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0360",
              code: specialty,
              display: specialty
            }
          ],
          text: specialty
        }
      }
    ]
  };
}

function generateSupportPractitioner(hospitalId, entry) {
  const practitionerId = generateId(`supp-${hospitalId}-`);
  const fullName = `${entry.firstName} ${entry.lastName} ${entry.specialty}`.trim();
  const suffixValue = entry.suffix || entry.specialty;

  return {
    resourceType: "Practitioner",
    id: practitionerId,
    active: true,
    name: [
      {
        use: "official",
        text: fullName,
        family: entry.lastName,
        given: [entry.firstName],
        suffix: suffixValue ? [suffixValue] : []
      }
    ],
    telecom: [
      {
        system: "phone",
        value: `+1-555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
        use: "work"
      }
    ],
    qualification: [
      {
        code: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0360",
              code: entry.specialty,
              display: entry.specialty
            }
          ],
          text: entry.specialty
        }
      }
    ]
  };
}

function generateLocation(hospitalId, index) {
  const locationTypes = ["Emergency Department", "Outpatient Clinic", "Inpatient Ward", "Operating Room", "Laboratory"];
  const locationId = generateId(`loc-${hospitalId}-`);
  
  return {
    resourceType: "Location",
    id: locationId,
    identifier: [
      {
        use: "usual",
        value: `LOC-${hospitalId}-${index + 1}`
      }
    ],
    status: "active",
    name: `${HOSPITALS.find(h => h.id === hospitalId)?.name} - ${locationTypes[index % locationTypes.length]}`,
    description: locationTypes[index % locationTypes.length],
    type: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
            code: "HOSP",
            display: "Hospital"
          }
        ],
        text: locationTypes[index % locationTypes.length]
      }
    ],
    managingOrganization: {
      reference: `Organization/${hospitalId}`,
      display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
    }
  };
}

function generateEncounter(patientId, hospitalId, practitionerId, locationId, index) {
  const encounterId = generateId(`enc-${hospitalId}-`);
  const startDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const endDate = new Date(startDate.getTime() + getRandomInt(30, 120) * 60000);
  const encounterTypes = ["ambulatory", "emergency", "inpatient", "outpatient"];
  const statuses = ["finished", "in-progress", "planned"];
  
  return {
    resourceType: "Encounter",
    id: encounterId,
    identifier: [
      {
        use: "usual",
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.3.${hospitalId}`,
        value: `ENC-${getRandomInt(100000, 999999)}`
      }
    ],
    status: statuses[index % statuses.length],
    class: {
      system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
      code: encounterTypes[index % encounterTypes.length],
      display: encounterTypes[index % encounterTypes.length].charAt(0).toUpperCase() + encounterTypes[index % encounterTypes.length].slice(1)
    },
    type: [
      {
        coding: [
          {
            system: "http://www.ama-assn.org/go/cpt",
            code: getRandomInt(99201, 99215).toString(),
            display: "Office Visit"
          }
        ],
        text: "Office Visit"
      }
    ],
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    period: {
      start: formatDateTime(startDate),
      end: formatDateTime(endDate)
    },
    participant: [
      {
        individual: {
          reference: `Practitioner/${practitionerId}`,
          display: "Attending Physician"
        }
      }
    ],
    serviceProvider: {
      reference: `Organization/${hospitalId}`,
      display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
    },
    location: [
      {
        location: {
          reference: `Location/${locationId}`,
          display: "Treatment Location"
        }
      }
    ]
  };
}

function generateCondition(patientId, hospitalId, conditionName, index) {
  const conditionId = generateId(`cond-${hospitalId}-`);
  const onsetDate = getRandomDate(new Date(2020, 0, 1), new Date());
  
  return {
    resourceType: "Condition",
    id: conditionId,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
          display: "Active"
        }
      ],
      text: "Active"
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-ver-status",
          code: "confirmed",
          display: "Confirmed"
        }
      ],
      text: "Confirmed"
    },
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/condition-category",
            code: "problem-list-item",
            display: "Problem List Item"
          }
        ],
        text: "Problem"
      }
    ],
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: getRandomInt(100000, 999999).toString(),
          display: conditionName
        }
      ],
      text: conditionName
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    onsetDateTime: formatDateTime(onsetDate),
    recordedDate: formatDateTime(onsetDate)
  };
}

function generateDiagnosticReport(patientId, hospitalId, encounterId, practitionerId, index, dateOverride) {
  const reportId = generateId(`diag-${hospitalId}-`);
  const reportDate = dateOverride || getRandomDate(new Date(2023, 0, 1), new Date());
  const reportTypes = [
    { code: "80061", display: "Lipid Panel", altCodes: ["LAB18", "3302", "43168", "229400", "14852", "LIPID", "LIPRE", "03640", "3640"] },
    { code: "85025", display: "Complete Blood Count", altCodes: ["CBC", "LAB01", "2501", "43121", "229000", "10231"] },
    { code: "80053", display: "Comprehensive Metabolic Panel", altCodes: ["LAB17", "5501", "43375", "CMP", "1943", "322000", "10231"] },
    { code: "85610", display: "Prothrombin Time", altCodes: ["PT", "LAB05", "5901", "43215", "229100", "10331"] },
    { code: "80048", display: "Basic Metabolic Panel", altCodes: ["BMP", "LAB16", "2502", "43122", "229001", "10232"] },
    { code: "80069", display: "Renal Function Panel", altCodes: ["RFP", "LAB19", "3501", "43169", "229401", "14853"] },
    { code: "80074", display: "Acute Hepatitis Panel", altCodes: ["AHP", "LAB20", "4501", "43170", "229402", "14854"] },
    { code: "80076", display: "Hepatic Function Panel", altCodes: ["HFP", "LAB21", "5502", "43171", "229403", "14855"] }
  ];
  const reportType = reportTypes[index % reportTypes.length];
  
  // Generate multiple coding entries like the original data
  const codeCoding = [
    {
      system: "urn:oid:2.16.840.1.113883.6.12",
      code: reportType.code,
      display: reportType.display.toUpperCase()
    }
  ];
  
  // Add alternative coding systems
  reportType.altCodes.forEach((altCode, idx) => {
    codeCoding.push({
      system: `urn:oid:1.2.840.114350.1.13.297.2.7.5.${hospitalId}.${getRandomInt(100, 999)}`,
      code: altCode
    });
  });
  
  return {
    resourceType: "DiagnosticReport",
    id: reportId,
    identifier: [
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "PLAC",
              display: "Placer Identifier"
            }
          ],
          text: "Placer Identifier"
        },
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.2.${hospitalId}`,
        value: `${getRandomInt(1000000000, 9999999999)}`
      },
      {
        use: "official",
        type: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v2-0203",
              code: "FILL",
              display: "Filler Identifier"
            }
          ],
          text: "Filler Identifier"
        },
        system: `https://open.epic.com/FHIR/297/order-accession-number/Beaker`,
        value: `${getRandomInt(100000000, 999999999)}${String.fromCharCode(65 + (index % 26))}${String.fromCharCode(65 + ((index * 2) % 26))}`
      }
    ],
    status: "final",
    category: [
      {
        coding: [
          {
            system: `urn:oid:1.2.840.114350.1.13.297.2.7.10.${hospitalId}.30`,
            code: "Lab"
          }
        ],
        text: "Lab"
      },
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v2-0074",
            code: "LAB",
            display: "Laboratory"
          }
        ],
        text: "Laboratory"
      }
    ],
    code: {
      coding: codeCoding,
      text: reportType.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`,
      identifier: {
        use: "usual",
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.3.${hospitalId}.8`,
        value: `${getRandomInt(10000000000, 99999999999)}`
      },
      display: "Appointment"
    },
    effectiveDateTime: formatDateTime(reportDate),
    issued: formatDateTime(reportDate),
    performer: [
      {
        reference: `Practitioner/${practitionerId}`,
        type: "Practitioner",
        display: "Ordering Physician"
      },
      {
        reference: `Organization/${hospitalId}`,
        type: "Organization",
        display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
      }
    ],
    resultsInterpreter: [
      {
        reference: `Practitioner/${practitionerId}`,
        display: "Interpreting Physician"
      }
    ],
    conclusion: `Results are within normal limits. No significant abnormalities detected. Clinical correlation recommended.`,
    presentedForm: [
      {
        contentType: "text/html",
        url: `Binary/${generateId(`bin-${hospitalId}-`)}`,
        title: "Narrative"
      }
    ]
  };
}

function generateObservation(patientId, hospitalId, encounterId, diagnosticReportId, index) {
  const observationId = generateId(`obs-${hospitalId}-`);
  const observationDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const observations = [
    { code: "2093-3", display: "Cholesterol", value: getRandomInt(120, 200), unit: "mg/dL", altCodes: ["CHOL", "LAB001"] },
    { code: "2085-9", display: "HDL Cholesterol", value: getRandomInt(40, 80), unit: "mg/dL", altCodes: ["HDL", "LAB002"] },
    { code: "2089-1", display: "LDL Cholesterol", value: getRandomInt(70, 130), unit: "mg/dL", altCodes: ["LDL", "LAB003"] },
    { code: "2571-8", display: "Triglycerides", value: getRandomInt(50, 150), unit: "mg/dL", altCodes: ["TRIG", "LAB004"] },
    { code: "789-8", display: "Erythrocytes", value: getRandomInt(4, 6), unit: "10*6/uL", altCodes: ["RBC", "LAB005"] },
    { code: "718-7", display: "Hemoglobin", value: getRandomInt(12, 16), unit: "g/dL", altCodes: ["HGB", "LAB006"] },
    { code: "6690-2", display: "Leukocytes", value: getRandomInt(4, 11), unit: "10*3/uL", altCodes: ["WBC", "LAB007"] },
    { code: "777-3", display: "Platelets", value: getRandomInt(150, 450), unit: "10*3/uL", altCodes: ["PLT", "LAB008"] },
    { code: "786-4", display: "MCV", value: getRandomInt(80, 100), unit: "fL", altCodes: ["MCV", "LAB009"] },
    { code: "785-6", display: "MCH", value: getRandomInt(27, 33), unit: "pg", altCodes: ["MCH", "LAB010"] },
    { code: "786-4", display: "MCHC", value: getRandomInt(32, 36), unit: "g/dL", altCodes: ["MCHC", "LAB011"] },
    { code: "33914-3", display: "Glucose", value: getRandomInt(70, 100), unit: "mg/dL", altCodes: ["GLU", "LAB012"] }
  ];
  const obs = observations[index % observations.length];
  
  // Generate multiple coding entries
  const codeCoding = [
    {
      system: "http://loinc.org",
      code: obs.code,
      display: `${obs.display}.SER/PLAS.QN (BEAKER)`
    }
  ];
  
  // Add alternative coding systems
  obs.altCodes.forEach((altCode) => {
    codeCoding.push({
      system: `urn:oid:1.2.840.114350.1.13.297.2.7.5.${hospitalId}.${getRandomInt(100, 999)}`,
      code: altCode
    });
  });
  
  return {
    resourceType: "Observation",
    id: observationId,
    status: "final",
    category: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/observation-category",
            code: "laboratory",
            display: "Laboratory"
          }
        ],
        text: "Laboratory"
      }
    ],
    code: {
      coding: codeCoding,
      text: `Component (1): ${obs.display}.SER/PLAS.QN (BEAKER)`
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`
    },
    effectiveDateTime: formatDateTime(observationDate),
    valueQuantity: {
      value: obs.value,
      unit: obs.unit,
      system: "http://unitsofmeasure.org",
      code: obs.unit
    },
    interpretation: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation",
            code: "N",
            display: "Normal"
          }
        ],
        text: "Normal"
      }
    ],
    referenceRange: [
      {
        low: {
          value: obs.value - getRandomInt(10, 30),
          unit: obs.unit
        },
        high: {
          value: obs.value + getRandomInt(10, 30),
          unit: obs.unit
        },
        text: `Normal range: ${obs.value - getRandomInt(10, 30)}-${obs.value + getRandomInt(10, 30)} ${obs.unit}`
      }
    ]
  };
}

function generateMedicationStatement(patientId, hospitalId, practitionerId, index) {
  const medicationId = generateId(`med-${hospitalId}-`);
  const startDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const medications = [
    { name: "Lisinopril", dosage: "10 mg", frequency: "Once daily" },
    { name: "Metformin", dosage: "500 mg", frequency: "Twice daily" },
    { name: "Atorvastatin", dosage: "20 mg", frequency: "Once daily" },
    { name: "Albuterol", dosage: "90 mcg", frequency: "As needed" },
    { name: "Omeprazole", dosage: "20 mg", frequency: "Once daily" }
  ];
  const med = medications[index % medications.length];
  
  return {
    resourceType: "MedicationStatement",
    id: medicationId,
    status: "active",
    medicationCodeableConcept: {
      coding: [
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: getRandomInt(100000, 999999).toString(),
          display: med.name
        }
      ],
      text: med.name
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    effectivePeriod: {
      start: formatDateTime(startDate)
    },
    dosage: [
      {
        text: `${med.dosage} ${med.frequency}`,
        timing: {
          repeat: {
            frequency: med.frequency.includes("Twice") ? 2 : 1,
            period: "d",
            periodUnit: "d"
          }
        },
        route: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
              code: "PO",
              display: "Oral"
            }
          ],
          text: "Oral"
        }
      }
    ],
    informationSource: {
      reference: `Practitioner/${practitionerId}`,
      display: "Prescribing Physician"
    }
  };
}

function generateAllergyIntolerance(patientId, hospitalId, index) {
  const allergyId = generateId(`allergy-${hospitalId}-`);
  const allergies = ["Penicillin", "Sulfa Drugs", "Latex", "Shellfish", "Peanuts"];
  const allergy = allergies[index % allergies.length];
  
  return {
    resourceType: "AllergyIntolerance",
    id: allergyId,
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
          code: "active",
          display: "Active"
        }
      ],
      text: "Active"
    },
    verificationStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
          code: "confirmed",
          display: "Confirmed"
        }
      ],
      text: "Confirmed"
    },
    category: ["medication", "food"],
    criticality: "low",
    code: {
      coding: [
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: getRandomInt(100000, 999999).toString(),
          display: allergy
        }
      ],
      text: allergy
    },
    patient: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    }
  };
}

function generateCarePlan(patientId, hospitalId, conditions, treatments) {
  const carePlanId = generateId(`careplan-${hospitalId}-`);
  
  return {
    resourceType: "CarePlan",
    id: carePlanId,
    status: "active",
    intent: "plan",
    category: [
      {
        coding: [
          {
            system: "http://hl7.org/fhir/us/core/CodeSystem/careplan-category",
            code: "assess-plan",
            display: "Assessment and Plan of Treatment"
          }
        ],
        text: "Assessment and Plan of Treatment"
      }
    ],
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    addresses: conditions.map(cond => ({
      display: cond
    })),
    activity: treatments.map((treatment, idx) => ({
      detail: {
        kind: "ServiceRequest",
        status: "scheduled",
        doNotPerform: false,
        code: {
          text: treatment
        },
        scheduledPeriod: {
          start: formatDateTime(getRandomDate(new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)))
        }
      }
    }))
  };
}

function generateProcedure(patientId, hospitalId, encounterId, practitionerId, index) {
  const procedureId = generateId(`proc-${hospitalId}-`);
  const procedureDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const procedures = [
    { code: "27447", display: "Arthroscopy, knee" },
    { code: "45378", display: "Colonoscopy" },
    { code: "93000", display: "Electrocardiogram" },
    { code: "71020", display: "Chest X-ray" },
    { code: "70450", display: "CT Head" }
  ];
  const proc = procedures[index % procedures.length];
  
  return {
    resourceType: "Procedure",
    id: procedureId,
    status: "completed",
    code: {
      coding: [
        {
          system: "http://www.ama-assn.org/go/cpt",
          code: proc.code,
          display: proc.display
        }
      ],
      text: proc.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`
    },
    performedDateTime: formatDateTime(procedureDate),
    performer: [
      {
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: "Performing Physician"
        }
      }
    ]
  };
}

function generateImmunization(patientId, hospitalId, practitionerId, index) {
  const immunizationId = generateId(`imm-${hospitalId}-`);
  const immunizationDate = getRandomDate(new Date(2020, 0, 1), new Date());
  const vaccines = [
    { code: "88", display: "Influenza, seasonal, injectable" },
    { code: "140", display: "COVID-19, mRNA" },
    { code: "33", display: "Pneumococcal polysaccharide" },
    { code: "10", display: "Tetanus and diphtheria toxoids" }
  ];
  const vaccine = vaccines[index % vaccines.length];
  
  return {
    resourceType: "Immunization",
    id: immunizationId,
    status: "completed",
    vaccineCode: {
      coding: [
        {
          system: "http://hl7.org/fhir/sid/cvx",
          code: vaccine.code,
          display: vaccine.display
        }
      ],
      text: vaccine.display
    },
    patient: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    occurrenceDateTime: formatDateTime(immunizationDate),
    performer: [
      {
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: "Administering Provider"
        }
      }
    ],
    location: {
      reference: `Organization/${hospitalId}`,
      display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
    }
  };
}

function generateGoal(patientId, hospitalId, index) {
  const goalId = generateId(`goal-${hospitalId}-`);
  const goals = [
    "Maintain blood pressure below 140/90 mmHg",
    "Achieve HbA1c level below 7%",
    "Reduce pain level to less than 3/10",
    "Improve lung function by 20%",
    "Maintain healthy weight"
  ];
  
  return {
    resourceType: "Goal",
    id: goalId,
    lifecycleStatus: "active",
    description: {
      text: goals[index % goals.length]
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    target: [
      {
        measure: {
          coding: [
            {
              system: "http://loinc.org",
              code: "8480-6",
              display: "Systolic blood pressure"
            }
          ]
        },
        detailQuantity: {
          value: getRandomInt(120, 140),
          unit: "mmHg"
        },
        dueDate: formatDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000))
      }
    ]
  };
}

function generateDocumentReference(patientId, hospitalId, encounterId, index) {
  const docRefId = generateId(`doc-${hospitalId}-`);
  const docDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const docTypes = [
    { code: "51848-0", display: "Discharge summary" },
    { code: "11506-3", display: "Progress note" },
    { code: "18726-0", display: "Radiology report" },
    { code: "18842-5", display: "Laboratory report" }
  ];
  const docType = docTypes[index % docTypes.length];
  
  return {
    resourceType: "DocumentReference",
    id: docRefId,
    status: "current",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: docType.code,
          display: docType.display
        }
      ],
      text: docType.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    date: formatDateTime(docDate),
    content: [
      {
        attachment: {
          contentType: "application/pdf",
          url: `https://example.com/documents/${docRefId}.pdf`,
          title: docType.display
        }
      }
    ],
    context: {
      encounter: [
        {
          reference: `Encounter/${encounterId}`
        }
      ]
    }
  };
}

function generateMedication(hospitalId, index) {
  const medicationId = generateId(`medication-${hospitalId}-`);
  const medications = [
    { name: "Lisinopril", rxnorm: "314076", form: "TAB", display: "Lisinopril 10 MG Oral Tablet" },
    { name: "Metformin", rxnorm: "6809", form: "TAB", display: "Metformin 500 MG Oral Tablet" },
    { name: "Atorvastatin", rxnorm: "83367", form: "TAB", display: "Atorvastatin 20 MG Oral Tablet" },
    { name: "Albuterol", rxnorm: "435", form: "INHL", display: "Albuterol 90 MCG/ACTUAT Inhalant Solution" },
    { name: "Omeprazole", rxnorm: "7646", form: "CAP", display: "Omeprazole 20 MG Delayed Release Oral Capsule" }
  ];
  const med = medications[index % medications.length];
  
  return {
    resourceType: "Medication",
    id: medicationId,
    identifier: [
      {
        system: `urn:oid:1.2.840.114350.1.13.297.2.7.2.${hospitalId}`,
        use: "usual",
        value: `${getRandomInt(10000, 99999)}`
      }
    ],
    code: {
      coding: [
        {
          system: "http://www.nlm.nih.gov/research/umls/rxnorm",
          code: med.rxnorm,
          display: med.display
        },
        {
          system: "urn:oid:2.16.840.1.113883.6.253",
          code: `${getRandomInt(10000, 99999)}`
        }
      ],
      text: med.display
    },
    form: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-orderableDrugForm",
          code: med.form,
          display: med.form === "TAB" ? "Tablet" : med.form === "CAP" ? "Capsule" : "Inhalant"
        }
      ],
      text: med.form === "TAB" ? "Tablet" : med.form === "CAP" ? "Capsule" : "Inhalant"
    },
    ingredient: [
      {
        itemCodeableConcept: {
          text: med.name
        }
      }
    ]
  };
}

function generateServiceRequest(patientId, hospitalId, encounterId, practitionerId, index) {
  const serviceRequestId = generateId(`servreq-${hospitalId}-`);
  const requestDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const services = [
    { code: "80061", display: "Lipid Panel" },
    { code: "85025", display: "Complete Blood Count" },
    { code: "80053", display: "Comprehensive Metabolic Panel" },
    { code: "27447", display: "Arthroscopy, knee" },
    { code: "45378", display: "Colonoscopy" }
  ];
  const service = services[index % services.length];
  
  return {
    resourceType: "ServiceRequest",
    id: serviceRequestId,
    status: "active",
    intent: "order",
    code: {
      coding: [
        {
          system: "http://www.ama-assn.org/go/cpt",
          code: service.code,
          display: service.display
        }
      ],
      text: service.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`
    },
    authoredOn: formatDateTime(requestDate),
    requester: {
      reference: `Practitioner/${practitionerId}`,
      display: "Ordering Physician"
    },
    performer: [
      {
        reference: `Organization/${hospitalId}`,
        display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
      }
    ]
  };
}

function generateMedicationRequest(patientId, hospitalId, encounterId, practitionerId, medicationId, index) {
  const medicationRequestId = generateId(`medreq-${hospitalId}-`);
  const requestDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const dosages = ["10 mg", "20 mg", "500 mg", "90 mcg"];
  const frequencies = ["Once daily", "Twice daily", "Three times daily", "As needed"];
  
  return {
    resourceType: "MedicationRequest",
    id: medicationRequestId,
    status: "active",
    intent: "order",
    medicationReference: {
      reference: `Medication/${medicationId}`,
      display: "Prescribed Medication"
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`
    },
    authoredOn: formatDateTime(requestDate),
    requester: {
      reference: `Practitioner/${practitionerId}`,
      display: "Prescribing Physician"
    },
    dosageInstruction: [
      {
        text: `${dosages[index % dosages.length]} ${frequencies[index % frequencies.length]}`,
        timing: {
          repeat: {
            frequency: frequencies[index % frequencies.length].includes("Twice") ? 2 : 1,
            period: 1,
            periodUnit: "d"
          }
        },
        route: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration",
              code: "PO",
              display: "Oral"
            }
          ],
          text: "Oral"
        }
      }
    ]
  };
}

function generateAppointment(patientId, hospitalId, practitionerId, locationId, index) {
  const appointmentId = generateId(`appt-${hospitalId}-`);
  const appointmentDate = getRandomDate(new Date(), new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const endDate = new Date(appointmentDate.getTime() + getRandomInt(30, 60) * 60000);
  
  return {
    resourceType: "Appointment",
    id: appointmentId,
    status: "booked",
    serviceType: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/service-type",
            code: "57",
            display: "General Practice"
          }
        ],
        text: "General Practice"
      }
    ],
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    participant: [
      {
        actor: {
          reference: `Practitioner/${practitionerId}`,
          display: "Attending Physician"
        },
        status: "accepted"
      },
      {
        actor: {
          reference: `Location/${locationId}`,
          display: "Appointment Location"
        },
        status: "accepted"
      }
    ],
    start: formatDateTime(appointmentDate),
    end: formatDateTime(endDate),
    minutesDuration: getRandomInt(30, 60)
  };
}

function generateCoverage(patientId, hospitalId, index) {
  const coverageId = generateId(`coverage-${hospitalId}-`);
  const payers = ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare", "Cigna", "Medicare"];
  const payer = payers[index % payers.length];
  
  return {
    resourceType: "Coverage",
    id: coverageId,
    status: "active",
    type: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/v3-ActCode",
          code: "HIP",
          display: "Health Insurance Plan"
        }
      ],
      text: "Health Insurance"
    },
    subscriber: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    beneficiary: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    payor: [
      {
        display: payer
      }
    ],
    period: {
      start: formatDate(new Date(2020, 0, 1)),
      end: formatDate(new Date(2025, 11, 31))
    }
  };
}

function generateRelatedPerson(patientId, hospitalId, index) {
  const relatedPersonId = generateId(`related-${hospitalId}-`);
  const relationships = ["spouse", "child", "parent", "sibling"];
  const names = ["Jane Smith", "John Smith Jr.", "Mary Smith", "Robert Smith"];
  const relationship = relationships[index % relationships.length];
  const name = names[index % names.length];
  
  return {
    resourceType: "RelatedPerson",
    id: relatedPersonId,
    patient: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    relationship: [
      {
        coding: [
          {
            system: "http://terminology.hl7.org/CodeSystem/v3-RoleCode",
            code: relationship === "spouse" ? "SPS" : relationship === "child" ? "CHILD" : relationship === "parent" ? "PRN" : "SIB",
            display: relationship.charAt(0).toUpperCase() + relationship.slice(1)
          }
        ],
        text: relationship.charAt(0).toUpperCase() + relationship.slice(1)
      }
    ],
    name: [
      {
        use: "usual",
        text: name,
        family: "Smith",
        given: [name.split(" ")[0]]
      }
    ],
    telecom: [
      {
        system: "phone",
        value: `+1-555-${getRandomInt(100, 999)}-${getRandomInt(1000, 9999)}`,
        use: "home"
      }
    ]
  };
}

function generatePractitionerRole(practitionerId, organizationId, hospitalId, index) {
  const practitionerRoleId = generateId(`practrole-${hospitalId}-`);
  const specialties = ["Cardiology", "Orthopedics", "Endocrinology", "Pulmonology", "Gastroenterology"];
  const specialty = specialties[index % specialties.length];
  
  return {
    resourceType: "PractitionerRole",
    id: practitionerRoleId,
    active: true,
    practitioner: {
      reference: `Practitioner/${practitionerId}`,
      display: "Practitioner"
    },
    organization: {
      reference: `Organization/${organizationId}`,
      display: HOSPITALS.find(h => h.id === hospitalId)?.name || ""
    },
    code: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: "159033005",
            display: specialty
          }
        ],
        text: specialty
      }
    ],
    specialty: [
      {
        coding: [
          {
            system: "http://snomed.info/sct",
            code: getRandomInt(100000, 999999).toString(),
            display: specialty
          }
        ],
        text: specialty
      }
    ]
  };
}

function generateSpecimen(patientId, hospitalId, encounterId, index) {
  const specimenId = generateId(`specimen-${hospitalId}-`);
  const collectionDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const specimenTypes = [
    { code: "119297000", display: "Blood specimen" },
    { code: "119361006", display: "Urine specimen" },
    { code: "119364003", display: "Tissue specimen" },
    { code: "440500007", display: "Saliva specimen" }
  ];
  const specimenType = specimenTypes[index % specimenTypes.length];
  
  return {
    resourceType: "Specimen",
    id: specimenId,
    status: "available",
    type: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: specimenType.code,
          display: specimenType.display
        }
      ],
      text: specimenType.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    receivedTime: formatDateTime(collectionDate),
    collection: {
      collectedDateTime: formatDateTime(collectionDate),
      collector: {
        display: "Collecting Physician"
      }
    }
  };
}

function generateList(patientId, hospitalId, index) {
  const listId = generateId(`list-${hospitalId}-`);
  const listTypes = [
    { code: "10160-0", display: "History of medication use Narrative" },
    { code: "10157-6", display: "Allergies, adverse reactions, alerts" },
    { code: "11450-4", display: "Problem list" },
    { code: "48765-2", display: "Allergies and adverse reactions" }
  ];
  const listType = listTypes[index % listTypes.length];
  
  return {
    resourceType: "List",
    id: listId,
    status: "current",
    mode: "snapshot",
    title: listType.display,
    code: {
      coding: [
        {
          system: "http://loinc.org",
          code: listType.code,
          display: listType.display
        }
      ],
      text: listType.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    date: formatDateTime(new Date()),
    entry: [
      {
        item: {
          display: "List item 1"
        }
      },
      {
        item: {
          display: "List item 2"
        }
      }
    ]
  };
}

function generateComposition(patientId, hospitalId, encounterId, practitionerId, index) {
  const compositionId = generateId(`composition-${hospitalId}-`);
  const compositionDate = getRandomDate(new Date(2023, 0, 1), new Date());
  const compositionTypes = [
    { code: "11506-3", display: "Progress note" },
    { code: "51848-0", display: "Discharge summary" },
    { code: "34117-2", display: "History and physical note" }
  ];
  const compositionType = compositionTypes[index % compositionTypes.length];
  
  return {
    resourceType: "Composition",
    id: compositionId,
    status: "final",
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: compositionType.code,
          display: compositionType.display
        }
      ],
      text: compositionType.display
    },
    subject: {
      reference: `Patient/${patientId}`,
      display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
    },
    encounter: {
      reference: `Encounter/${encounterId}`
    },
    date: formatDateTime(compositionDate),
    author: [
      {
        reference: `Practitioner/${practitionerId}`,
        display: "Authoring Physician"
      }
    ],
    title: compositionType.display,
    section: [
      {
        title: "Clinical Information",
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: "48765-2",
              display: "Allergies and adverse reactions"
            }
          ]
        },
        text: {
          status: "generated",
          div: `<div xmlns="http://www.w3.org/1999/xhtml">Clinical information section content.</div>`
        }
      }
    ]
  };
}

function generateBinary(docRefId) {
  return {
    resourceType: "Binary",
    id: docRefId,
    contentType: "application/pdf",
    data: "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERi9UZXh0XS9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSL1BhcmVudCAyIDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iago1IDAgb2JqCjw8L0xlbmd0aCA0ND4+CnN0cmVhbQpCVAovRjEgMTIgVGYKNzAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMDAgbiAKMDAwMDAwMDEyMyAwMDAwMDAgbiAKMDAwMDAwMDE4OCAwMDAwMDAgbiAKMDAwMDAwMDI1MyAwMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDYvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgozNDMKJSVFT0YK"
  };
}

// ============================================================================
// Main Generation Function
// ============================================================================

function generateMockFhirData() {
  const allResources = [];
  const patientId = generateId("patient-");
  let globalPractitionerIndex = 0; // Track global index to ensure unique names
  
  // Generate resources for each hospital
  HOSPITALS.forEach((hospital, hospitalIndex) => {
    console.log(`Generating data for ${hospital.name}...`);
    
    // Organization
    allResources.push(generateOrganization(hospital));
    
    // Patient (same patient, but with hospital-specific MRN)
    allResources.push(generatePatient(patientId, hospital.id, hospitalIndex));
    
    // Practitioners (7-8 per hospital to match original ~36 practitioners)
    const practitioners = [];
    for (let i = 0; i < 7; i++) {
      const practitioner = generatePractitioner(hospital.id, i, hospital.specialty, globalPractitionerIndex);
      practitioners.push(practitioner);
      allResources.push(practitioner);
      globalPractitionerIndex++; // Increment global index for next practitioner
    }

    const supportPractitionerEntries = [
      // Mental Health
      { firstName: "Ava", lastName: "Nguyen", specialty: "Psychiatrist" },
      { firstName: "Lucas", lastName: "Reed", specialty: "Psychologist" },
      { firstName: "Mia", lastName: "Santos", specialty: "MFT" },
      { firstName: "Evelyn", lastName: "Cruz", specialty: "LCSW" },
      { firstName: "Jack", lastName: "Hughes", specialty: "AA Counselor" },
      { firstName: "Nora", lastName: "Blake", specialty: "Substance Abuse Counselor" },
      { firstName: "Harper", lastName: "Price", specialty: "Psychiatry" },
      { firstName: "Landon", lastName: "Mills", specialty: "Psychology" },
      { firstName: "Sofia", lastName: "Reyes", specialty: "Marriage and Family Therapist" },
      { firstName: "Caleb", lastName: "Parker", specialty: "Licensed Clinical Social Worker" },
      { firstName: "Aria", lastName: "Scott", specialty: "AA" },
      { firstName: "Gabriel", lastName: "Foster", specialty: "Substance abuse" },
      // Family
      { firstName: "Emma", lastName: "Johnson", specialty: "Spouse" },
      { firstName: "Noah", lastName: "Johnson", specialty: "Son" },
      { firstName: "Sophia", lastName: "Johnson", specialty: "Daughter" },
      { firstName: "Liam", lastName: "Johnson", specialty: "Brother" },
      { firstName: "Olivia", lastName: "Johnson", specialty: "Sister" },
      { firstName: "James", lastName: "Johnson", specialty: "Father" },
      { firstName: "Isabella", lastName: "Johnson", specialty: "Mother" },
      { firstName: "Elijah", lastName: "Johnson", specialty: "Cousin" },
      { firstName: "Grace", lastName: "Johnson", specialty: "Nephew" },
      { firstName: "Chloe", lastName: "Johnson", specialty: "Niece" },
      // Social/Leisure
      { firstName: "Olivia", lastName: "Carter", specialty: "Friend" },
      { firstName: "Ethan", lastName: "Lee", specialty: "Community Group" },
      { firstName: "Mason", lastName: "Young", specialty: "Exercise Trainer" },
      { firstName: "Hannah", lastName: "Brooks", specialty: "Yoga Instructor" },
      { firstName: "Carter", lastName: "Morgan", specialty: "Music Coach" },
      { firstName: "Zoe", lastName: "Price", specialty: "Concert Group" },
      { firstName: "Logan", lastName: "King", specialty: "Education Tutor" },
      { firstName: "Aiden", lastName: "Cooper", specialty: "Friend" },
      { firstName: "Ella", lastName: "Mitchell", specialty: "Group" },
      { firstName: "Isaac", lastName: "Reed", specialty: "Exercise" },
      { firstName: "Layla", lastName: "Harris", specialty: "Yoga" },
      { firstName: "Hudson", lastName: "Gray", specialty: "Music" },
      { firstName: "Maya", lastName: "Bennett", specialty: "Concert" },
      { firstName: "Owen", lastName: "Bailey", specialty: "Education" },
      // Faith
      { firstName: "Liam", lastName: "Brooks", specialty: "Priest" },
      { firstName: "Leah", lastName: "Gold", specialty: "Rabbi" },
      { firstName: "Daniel", lastName: "Stone", specialty: "Minister" },
      { firstName: "Grace", lastName: "Church", specialty: "Church" },
      { firstName: "Noah", lastName: "Temple", specialty: "Synagogue" },
      // Services
      { firstName: "Isabella", lastName: "Ward", specialty: "Meal Service" },
      { firstName: "Henry", lastName: "Flores", specialty: "Caregiver" },
      { firstName: "Charlotte", lastName: "Green", specialty: "Home Aid" },
      { firstName: "Aiden", lastName: "Cole", specialty: "Housekeeper" },
      { firstName: "Lily", lastName: "Reed", specialty: "Maintenance" },
      { firstName: "Owen", lastName: "Ross", specialty: "Delivery" },
      { firstName: "Scarlett", lastName: "Yard", specialty: "Yard Service" },
    ];

    supportPractitionerEntries.forEach((entry) => {
      const supportPractitioner = generateSupportPractitioner(hospital.id, entry);
      allResources.push(supportPractitioner);
    });
    
    // Locations (2-3 per hospital to match original ~13 locations)
    const locations = [];
    for (let i = 0; i < 3; i++) {
      const location = generateLocation(hospital.id, i);
      locations.push(location);
      allResources.push(location);
    }
    
    // Conditions
    const conditions = [];
    hospital.conditions.forEach((conditionName, idx) => {
      const condition = generateCondition(patientId, hospital.id, conditionName, idx);
      conditions.push(condition);
      allResources.push(condition);
    });
    
    // Encounters (9-10 per hospital to match original ~46 encounters)
    const encounters = [];
    for (let i = 0; i < 9; i++) {
      const encounter = generateEncounter(
        patientId,
        hospital.id,
        practitioners[i % practitioners.length].id,
        locations[i % locations.length].id,
        i
      );
      encounters.push(encounter);
      allResources.push(encounter);
    }
    
    // Diagnostic Reports (12-15 per hospital to match original ~61 reports)
    const upcomingReportCount = 2;
    for (let i = 0; i < 12; i++) {
      const upcomingDate = i < upcomingReportCount
        ? getRandomDate(new Date(), new Date(Date.now() + 15 * 24 * 60 * 60 * 1000))
        : undefined;
      const diagnosticReport = generateDiagnosticReport(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        practitioners[i % practitioners.length].id,
        i,
        upcomingDate
      );
      allResources.push(diagnosticReport);
      
      // Observations (8-12 per diagnostic report to match original ~493 observations)
      const obsCount = getRandomInt(8, 12);
      for (let j = 0; j < obsCount; j++) {
        allResources.push(generateObservation(
          patientId,
          hospital.id,
          encounters[i % encounters.length].id,
          diagnosticReport.id,
          j
        ));
      }
    }
    
    // Medications (1-2 per hospital to match original ~8 medications)
    const medications = [];
    for (let i = 0; i < 2; i++) {
      const medication = generateMedication(hospital.id, i);
      medications.push(medication);
      allResources.push(medication);
    }
    
    // Medication Statements (1-2 per hospital)
    for (let i = 0; i < 2; i++) {
      allResources.push(generateMedicationStatement(
        patientId,
        hospital.id,
        practitioners[i % practitioners.length].id,
        i
      ));
    }
    
    // Medication Requests (prescriptions) - 2-3 per hospital
    for (let i = 0; i < 3; i++) {
      allResources.push(generateMedicationRequest(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        practitioners[i % practitioners.length].id,
        medications[i % medications.length].id,
        i
      ));
    }
    
    // Service Requests (orders) - 5-8 per hospital
    for (let i = 0; i < 8; i++) {
      allResources.push(generateServiceRequest(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        practitioners[i % practitioners.length].id,
        i
      ));
    }
    
    // Appointments - 3-5 per hospital
    for (let i = 0; i < 5; i++) {
      allResources.push(generateAppointment(
        patientId,
        hospital.id,
        practitioners[i % practitioners.length].id,
        locations[i % locations.length].id,
        i
      ));
    }
    
    // Coverage (insurance) - 1-2 per hospital
    for (let i = 0; i < 2; i++) {
      allResources.push(generateCoverage(patientId, hospital.id, i));
    }
    
    // Related Persons - 2-3 per hospital
    for (let i = 0; i < 3; i++) {
      allResources.push(generateRelatedPerson(patientId, hospital.id, i));
    }
    
    // Practitioner Roles - link practitioners to organization
    practitioners.forEach((pract, idx) => {
      allResources.push(generatePractitionerRole(
        pract.id,
        hospital.id,
        hospital.id,
        idx
      ));
    });
    
    // Specimens - 3-5 per hospital
    for (let i = 0; i < 5; i++) {
      allResources.push(generateSpecimen(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        i
      ));
    }
    
    // Lists (problem lists, medication lists, etc.) - 2-3 per hospital
    for (let i = 0; i < 3; i++) {
      allResources.push(generateList(patientId, hospital.id, i));
    }
    
    // Compositions (structured clinical documents) - 3-5 per hospital
    for (let i = 0; i < 5; i++) {
      allResources.push(generateComposition(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        practitioners[i % practitioners.length].id,
        i
      ));
    }
    
    // Allergy Intolerances (1 per hospital total to match original ~1 allergy)
    if (hospitalIndex === 0) {
      allResources.push(generateAllergyIntolerance(patientId, hospital.id, 0));
    }
    
    // Care Plan (1 per hospital total to match original ~1 care plan)
    if (hospitalIndex === 0) {
      allResources.push(generateCarePlan(patientId, hospital.id, hospital.conditions, hospital.treatments));
    }
    
    // Procedures (1 per hospital to match original ~3 procedures)
    for (let i = 0; i < 1; i++) {
      allResources.push(generateProcedure(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        practitioners[i % practitioners.length].id,
        i
      ));
    }
    
    // Immunizations (1 per hospital to match original ~4 immunizations)
    for (let i = 0; i < 1; i++) {
      allResources.push(generateImmunization(
        patientId,
        hospital.id,
        practitioners[i % practitioners.length].id,
        i
      ));
    }
    
    // Goals (2-3 per hospital to match original ~12 goals)
    for (let i = 0; i < 2; i++) {
      allResources.push(generateGoal(patientId, hospital.id, i));
    }
    
    // Document References (13-14 per hospital to match original ~67 document references)
    for (let i = 0; i < 13; i++) {
      const docRef = generateDocumentReference(
        patientId,
        hospital.id,
        encounters[i % encounters.length].id,
        i
      );
      allResources.push(docRef);
      
      // Binary resources for documents (only for some documents to match original ~67 binaries)
      if (i < 13) {
        allResources.push(generateBinary(docRef.id));
      }
    }
    
    // Care Team (1 per hospital total to match original ~1 care team)
    if (hospitalIndex === 0) {
      allResources.push({
      resourceType: "CareTeam",
      id: generateId(`careteam-${hospital.id}-`),
      status: "active",
      category: [
        {
          coding: [
            {
              system: "http://loinc.org",
              code: "LA28865-6",
              display: "Longitudinal care-coordination focused care team"
            }
          ],
          text: "Longitudinal care-coordination focused care team"
        }
      ],
      subject: {
        reference: `Patient/${patientId}`,
        display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
      },
      participant: practitioners.map(pract => ({
        role: [
          {
            coding: [
              {
                system: "http://snomed.info/sct",
                code: "223366009",
                display: "Healthcare professional"
              }
            ],
            text: hospital.specialty
          }
        ],
        member: {
          reference: `Practitioner/${pract.id}`,
          type: "Practitioner",
          display: pract.name[0].text
        }
      }))
      });
    }
    
    // Devices (1 per hospital to match original ~4 devices)
    for (let i = 0; i < 1; i++) {
      allResources.push({
        resourceType: "Device",
        id: generateId(`device-${hospital.id}-`),
        status: "active",
        deviceName: [
          {
            name: ["Blood Pressure Monitor", "Glucose Meter", "Pulse Oximeter"][i % 3],
            type: "user-name"
          }
        ],
        patient: {
          reference: `Patient/${patientId}`,
          display: `${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`
        }
      });
    }
  });
  
  return allResources;
}

// ============================================================================
// Main Execution
// ============================================================================

function main() {
  console.log("Generating mock FHIR R4 compliant data...");
  console.log(`Creating data for ${HOSPITALS.length} hospitals...`);
  
  const mockData = generateMockFhirData();
  
  console.log(`Generated ${mockData.length} FHIR resources`);
  console.log("\nResource breakdown:");
  
  const resourceCounts = {};
  mockData.forEach(resource => {
    resourceCounts[resource.resourceType] = (resourceCounts[resource.resourceType] || 0) + 1;
  });
  
  Object.entries(resourceCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
  
  // Write to file
  const outputPath = path.join(__dirname, '../data/mock-fasten-health-data.json');
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2));
  
  console.log(`\n✅ Mock data written to: ${outputPath}`);
  console.log(`📊 Total resources: ${mockData.length}`);
  console.log(`🏥 Hospitals: ${HOSPITALS.length}`);
  console.log(`👤 Patient: ${BASE_PATIENT.firstName} ${BASE_PATIENT.lastName}`);
}

if (require.main === module) {
  main();
}

module.exports = { generateMockFhirData, HOSPITALS, BASE_PATIENT };

