const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const pdfFiles = [
  'LOINC-Mapping-Guide-Allergy-Version-1.0.pdf',
  'LOINC-Mapping-Guide-Cell-Markers-Version-1.0.pdf',
  'LOINC-Mapping-Guide-Chemistry-Version-1.0.pdf',
  'LOINC-Mapping-Guide-Drug-and-Toxicology-Version-1.0.pdf',
  'LOINC-Mapping-Guide-Hematology-Serology-Version-1.0.pdf',
  'LOINC-Mapping-Guide-Molecular-Pathology-Version-1.0.pdf',
  'GuideForUsingLoincMicrobiologyTerms1.1.pdf',
];

const projectRoot = path.join(__dirname, '..');
const pdfPaths = pdfFiles.map(f => path.join(projectRoot, f));

function cleanWhitespace(s) {
  return s.replace(/\s+/g, ' ').trim();
}

const loincRegex = /\b\d{1,6}-\d+\b/g;

async function extractText(filePath) {
  const data = fs.readFileSync(filePath);
  const parsed = await pdf(data);
  return parsed.text || '';
}

function parseFromText(text, sourceFile) {
  const results = {};
  let match;
  while ((match = loincRegex.exec(text)) !== null) {
    const code = match[0];
    const idx = match.index;
    const start = Math.max(0, idx - 180);
    const end = Math.min(text.length, idx + code.length + 180);
    const snippet = cleanWhitespace(text.slice(start, end));

    const labels = {
      component: /component[:\s]+([^;,\n]+)/i,
      shortName: /(short\s*name|shortname)[:\s]+([^;,\n]+)/i,
      property: /property[:\s]+([^;,\n]+)/i,
      method: /method[:\s]+([^;,\n]+)/i,
      system: /system[:\s]+([^;,\n]+)/i,
      units: /unit[s]?\s*[:\s]+([^;,\n]+)/i,
    };

    const tryMatch = (re) => {
      const m = re.exec(snippet);
      return m ? cleanWhitespace(m[1]) : undefined;
    };

    const entry = {
      loincCode: code,
      component: tryMatch(labels.component),
      shortName: tryMatch(labels.shortName),
      property: tryMatch(labels.property),
      method: tryMatch(labels.method),
      system: tryMatch(labels.system),
      units: tryMatch(labels.units),
      context: snippet,
      sourceFile: path.basename(sourceFile),
    };

    // merge with existing, prefer non-empty fields
    if (!results[code]) {
      results[code] = entry;
    } else {
      const exist = results[code];
      results[code] = {
        loincCode: code,
        component: exist.component || entry.component,
        shortName: exist.shortName || entry.shortName,
        property: exist.property || entry.property,
        method: exist.method || entry.method,
        system: exist.system || entry.system,
        units: exist.units || entry.units,
        context: (exist.context && exist.context.length > entry.context.length) ? exist.context : entry.context,
        sourceFile: exist.sourceFile || entry.sourceFile,
      };
    }
  }
  return results;
}

(async () => {
  try {
    const finalMap = {};
    for (const p of pdfPaths) {
      if (!fs.existsSync(p)) {
        console.warn('PDF not found, skipping:', p);
        continue;
      }
      process.stdout.write(`Processing ${path.basename(p)}... `);
      const text = await extractText(p);
      const parsed = parseFromText(text, p);
      let added = 0;
      Object.keys(parsed).forEach(code => {
        if (!finalMap[code]) {
          finalMap[code] = parsed[code];
          added++;
        } else {
          // merge
          const exist = finalMap[code];
          finalMap[code] = {
            loincCode: code,
            component: exist.component || parsed[code].component,
            shortName: exist.shortName || parsed[code].shortName,
            property: exist.property || parsed[code].property,
            method: exist.method || parsed[code].method,
            system: exist.system || parsed[code].system,
            units: exist.units || parsed[code].units,
            context: (exist.context && exist.context.length > parsed[code].context.length) ? exist.context : parsed[code].context,
            sourceFile: exist.sourceFile || parsed[code].sourceFile,
          };
        }
      });
      console.log(`done (${Object.keys(parsed).length} codes, ${added} new)`);
    }

    const outPath = path.join(projectRoot, 'data', 'loinc-map.json');
    fs.writeFileSync(outPath, JSON.stringify(finalMap, null, 2), 'utf8');
    console.log('Wrote LOINC map to', outPath, `(${Object.keys(finalMap).length} codes)`);
    process.exit(0);
  } catch (err) {
    console.error('Error generating LOINC map:', err);
    process.exit(1);
  }
})();

