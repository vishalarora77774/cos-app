/**
 * Script to list all clinics from the currently used Fasten Health data
 * Run with: node scripts/list-clinics.js
 */

const path = require('path');
const fs = require('fs');

// Import the processor (we'll need to compile TypeScript or use ts-node)
// For now, let's read the data directly and process it manually

// Determine which data file to use
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false;

const dataFile = USE_MOCK_DATA 
  ? path.join(__dirname, '../data/mock-fasten-health-data.json')
  : path.join(__dirname, '../data/fasten-health-data.json');

console.log(`\n📂 Loading data from: ${path.basename(dataFile)}`);
console.log(`   Full path: ${dataFile}\n`);

try {
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const resources = Array.isArray(rawData) ? rawData : [rawData];
  
  console.log(`✅ Loaded ${resources.length} FHIR resources\n`);
  
  // Extract organizations (clinics)
  const organizations = resources.filter(r => r.resourceType === 'Organization');
  const patients = resources.filter(r => r.resourceType === 'Patient');
  
  console.log(`📊 Found ${organizations.length} Organization resources`);
  console.log(`📊 Found ${patients.length} Patient resources\n`);
  
  // Process clinics similar to the processor
  const clinicMap = new Map();
  
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
  patients.forEach(patient => {
    if (patient.managingOrganization) {
      const orgRef = patient.managingOrganization.reference;
      if (orgRef) {
        const orgId = orgRef.split('/')[1];
        if (!clinicMap.has(orgId)) {
          clinicMap.set(orgId, {
            id: orgId,
            name: patient.managingOrganization.display || 'Unknown Clinic',
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
  
  const clinics = Array.from(clinicMap.values());
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🏥 LIST OF CLINICS (Total: ${clinics.length})`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  clinics.forEach((clinic, index) => {
    console.log(`${index + 1}. ${clinic.name}`);
    console.log(`   ID: ${clinic.id}`);
    if (clinic.identifier) {
      console.log(`   Identifier: ${clinic.identifier}`);
    }
    if (clinic.address) {
      const addr = clinic.address;
      const addrParts = [];
      if (addr.line && addr.line.length > 0) {
        addrParts.push(addr.line.join(', '));
      }
      if (addr.city) addrParts.push(addr.city);
      if (addr.state) addrParts.push(addr.state);
      if (addr.zip) addrParts.push(addr.zip);
      if (addr.country) addrParts.push(addr.country);
      if (addrParts.length > 0) {
        console.log(`   Address: ${addrParts.join(', ')}`);
      }
    }
    if (clinic.phone) {
      console.log(`   Phone: ${clinic.phone}`);
    }
    if (clinic.email) {
      console.log(`   Email: ${clinic.email}`);
    }
    console.log('');
  });
  
  console.log('═══════════════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Error processing data:', error.message);
  console.error(error.stack);
  process.exit(1);
}
