const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'fasten-health-data.json');
const loincPath = path.join(__dirname, '..', 'data', 'loinc-map.json');

function collectCodesFromResource(resource, set) {
  if (!resource || typeof resource !== 'object') return;
  // Common places: resource.code.coding, resource.component[].code.coding, observation.code, etc.
  const tryAddCodingArray = (codingArr) => {
    if (!Array.isArray(codingArr)) return;
    codingArr.forEach(c => {
      if (c && c.code && typeof c.code === 'string') set.add(c.code);
      // also check valueQuantity.code sometimes
      if (c && c.system && typeof c.system === 'string' && c.system.toLowerCase().includes('loinc') && c.code) set.add(c.code);
    });
  };

  if (resource.code && resource.code.coding) tryAddCodingArray(resource.code.coding);
  if (resource.coding) tryAddCodingArray(resource.coding);
  if (resource.component && Array.isArray(resource.component)) {
    resource.component.forEach(comp => {
      if (comp.code && comp.code.coding) tryAddCodingArray(comp.code.coding);
    });
  }
  // Observations sometimes embed code in valueQuantity or valueCodeableConcept
  if (resource.valueCodeableConcept && resource.valueCodeableConcept.coding) tryAddCodingArray(resource.valueCodeableConcept.coding);
  if (resource.valueQuantity && resource.valueQuantity.code) set.add(resource.valueQuantity.code);
}

(function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const loincJson = JSON.parse(fs.readFileSync(loincPath, 'utf8'));
  const loincSet = new Set(Object.keys(loincJson));

  const foundCodes = new Set();

  if (Array.isArray(data)) {
    data.forEach(resource => {
      // Only check Observation, DiagnosticReport, or resources that include code
      if (resource.resourceType === 'Observation' || resource.resourceType === 'DiagnosticReport' || resource.code || resource.coding) {
        collectCodesFromResource(resource, foundCodes);
      }
    });
  }

  const codesArray = Array.from(foundCodes).sort();
  const total = codesArray.length;
  let matched = 0;
  const matchedCodes = [];
  const unmatchedCodes = [];
  codesArray.forEach(code => {
    if (loincSet.has(code)) {
      matched++;
      matchedCodes.push(code);
    } else {
      const cleaned = code.trim();
      if (loincSet.has(cleaned)) {
        matched++;
        matchedCodes.push(code);
      } else {
        unmatchedCodes.push(code);
      }
    }
  });

  console.log(`Found ${total} unique coding.code values in Observation/Report resources.`);
  console.log(`LOINC map contains ${loincSet.size} codes.`);
  console.log(`${matched} codes (${total>0?((matched/total)*100).toFixed(1):0}%) are present in loinc-map.json`);
  if (matched < total) {
    console.log('Sample unmatched codes (first 20):', unmatchedCodes.slice(0, 20));
  }
})();

