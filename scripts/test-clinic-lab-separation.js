/**
 * Script to test clinic and lab separation
 * Run with: node scripts/test-clinic-lab-separation.js
 */

const path = require('path');
const fs = require('fs');

// Determine which data file to use
const USE_MOCK_DATA = process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true' || false;

const dataFile = USE_MOCK_DATA 
  ? path.join(__dirname, '../data/mock-fasten-health-data.json')
  : path.join(__dirname, '../data/fasten-health-data.json');

console.log(`\n📂 Loading data from: ${path.basename(dataFile)}\n`);

// Lab detection function (same as in processor)
function isLab(orgName) {
  const nameLower = orgName.toLowerCase();
  const labKeywords = [
    'lab',
    'laboratory',
    'diagnostic',
    'pathology',
    'quest',
    'labcorp',
    'testing',
    'specimen',
    'analytical',
    'imaging', // Imaging centers are typically diagnostic/lab services
  ];
  
  return labKeywords.some(keyword => nameLower.includes(keyword));
}

// Exclude internal systems and interfaces
function shouldExcludeOrganization(orgName) {
  const nameLower = orgName.toLowerCase();
  const excludeKeywords = [
    'interface',
    'pws interface',
    'system',
    'internal',
    'csv', // Exclude CSV export artifacts
  ];
  
  return excludeKeywords.some(keyword => nameLower.includes(keyword));
}


try {
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const resources = Array.isArray(rawData) ? rawData : [rawData];
  
  // Extract organizations
  const organizations = resources.filter(r => r.resourceType === 'Organization');
  const patients = resources.filter(r => r.resourceType === 'Patient');
  
  console.log(`📊 Found ${organizations.length} Organization resources`);
  console.log(`📊 Found ${patients.length} Patient resources\n`);
  
  // Separate clinics and labs
  const clinics = [];
  const labs = [];
  
  organizations.forEach(org => {
    const orgName = org.name || 'Unknown Organization';
    
    // Skip internal systems and interfaces
    if (shouldExcludeOrganization(orgName)) {
      return;
    }
    
    if (isLab(orgName)) {
      labs.push({
        id: org.id,
        name: orgName,
      });
    } else {
      clinics.push({
        id: org.id,
        name: orgName,
      });
    }
  });
  
  // Patient managing organizations are typically clinics
  patients.forEach(patient => {
    if (patient.managingOrganization) {
      const orgName = patient.managingOrganization.display || 'Unknown Organization';
      const orgId = patient.managingOrganization.reference?.split('/')[1];
      
      // Skip if should be excluded
      if (shouldExcludeOrganization(orgName)) {
        return;
      }
      
      if (orgId && !clinics.find(c => c.id === orgId) && !labs.find(l => l.id === orgId)) {
        clinics.push({
          id: orgId,
          name: orgName,
        });
      }
    }
  });
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🏥 CLINICS (Total: ${clinics.length})`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  clinics.forEach((clinic, index) => {
    console.log(`${index + 1}. ${clinic.name}`);
    console.log(`   ID: ${clinic.id}\n`);
  });
  
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`🔬 LABS (Total: ${labs.length})`);
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  labs.forEach((lab, index) => {
    console.log(`${index + 1}. ${lab.name}`);
    console.log(`   ID: ${lab.id}\n`);
  });
  
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Save to JSON files for reference
  const outputDir = path.join(__dirname, '../data/processed');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(outputDir, 'clinics.json'),
    JSON.stringify(clinics, null, 2)
  );
  
  fs.writeFileSync(
    path.join(outputDir, 'labs.json'),
    JSON.stringify(labs, null, 2)
  );
  
  console.log(`✅ Saved clinics to: data/processed/clinics.json`);
  console.log(`✅ Saved labs to: data/processed/labs.json\n`);
  
} catch (error) {
  console.error('❌ Error processing data:', error.message);
  console.error(error.stack);
  process.exit(1);
}
