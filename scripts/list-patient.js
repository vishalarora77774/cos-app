/**
 * Script to show patient information from the currently used Fasten Health data
 * Run with: node scripts/list-patient.js
 */

const path = require('path');
const fs = require('fs');

// Determine which data file to use
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false;

const dataFile = USE_MOCK_DATA 
  ? path.join(__dirname, '../data/mock-fasten-health-data.json')
  : path.join(__dirname, '../data/fasten-health-data.json');

console.log(`\n📂 Loading data from: ${path.basename(dataFile)}\n`);

try {
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const resources = Array.isArray(rawData) ? rawData : [rawData];
  
  // Extract patients
  const patients = resources.filter(r => r.resourceType === 'Patient');
  
  console.log(`📊 Found ${patients.length} Patient resource(s)\n`);
  
  if (patients.length === 0) {
    console.log('❌ No patients found in the data\n');
    process.exit(0);
  }
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`👤 PATIENT INFORMATION`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  patients.forEach((patient, index) => {
    console.log(`Patient ${index + 1}:`);
    console.log(`   ID: ${patient.id}`);
    
    // Extract name
    const nameObj = patient.name?.find(n => n.use === 'official') || patient.name?.[0] || {};
    const fullName = nameObj.text || 
      `${nameObj.given?.join(' ') || ''} ${nameObj.family || ''}`.trim() ||
      'Unknown Patient';
    
    console.log(`   Name: ${fullName}`);
    if (nameObj.given && nameObj.given.length > 0) {
      console.log(`   First Name: ${nameObj.given.join(' ')}`);
    }
    if (nameObj.family) {
      console.log(`   Last Name: ${nameObj.family}`);
    }
    
    // Birth date
    if (patient.birthDate) {
      console.log(`   Birth Date: ${patient.birthDate}`);
    }
    
    // Gender
    if (patient.gender) {
      console.log(`   Gender: ${patient.gender}`);
    }
    
    // Phone
    const phone = patient.telecom?.find(t => t.system === 'phone' && t.use === 'home')?.value ||
      patient.telecom?.find(t => t.system === 'phone')?.value;
    if (phone) {
      console.log(`   Phone: ${phone}`);
    }
    
    // Email
    const email = patient.telecom?.find(t => t.system === 'email')?.value;
    if (email) {
      console.log(`   Email: ${email}`);
    }
    
    // Address
    const addressObj = patient.address?.find((a) => a.use === 'home') || patient.address?.[0];
    if (addressObj) {
      const addrParts = [];
      if (addressObj.line && addressObj.line.length > 0) {
        addrParts.push(addressObj.line.join(', '));
      }
      if (addressObj.city) addrParts.push(addressObj.city);
      if (addressObj.state) addrParts.push(addressObj.state);
      if (addressObj.postalCode) addrParts.push(addressObj.postalCode);
      if (addressObj.country) addrParts.push(addressObj.country);
      if (addrParts.length > 0) {
        console.log(`   Address: ${addrParts.join(', ')}`);
      }
    }
    
    // Marital Status
    const maritalStatus = patient.maritalStatus?.text || 
      patient.maritalStatus?.coding?.[0]?.display;
    if (maritalStatus) {
      console.log(`   Marital Status: ${maritalStatus}`);
    }
    
    // Managing Organization (Clinic)
    if (patient.managingOrganization) {
      const orgRef = patient.managingOrganization.reference;
      const orgDisplay = patient.managingOrganization.display;
      if (orgRef) {
        const orgId = orgRef.split('/')[1];
        console.log(`   Managing Organization ID: ${orgId}`);
      }
      if (orgDisplay) {
        console.log(`   Managing Organization: ${orgDisplay}`);
      }
    }
    
    // Emergency Contact
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
      
      console.log(`   Emergency Contact:`);
      console.log(`      Name: ${contactName}`);
      if (relationship) {
        console.log(`      Relationship: ${relationship}`);
      }
      if (contactPhone) {
        console.log(`      Phone: ${contactPhone}`);
      }
    }
    
    console.log('');
  });
  
  console.log('═══════════════════════════════════════════════════════════════\n');
  
} catch (error) {
  console.error('❌ Error processing data:', error.message);
  console.error(error.stack);
  process.exit(1);
}
