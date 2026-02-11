const fs = require('fs');
const path = require('path');

const loincPath = path.join(__dirname, '..', 'data', 'loinc-map.json');
const backupPath = path.join(__dirname, '..', 'data', 'loinc-map.orig.json');

function extractShortNameFromContext(code, context) {
  if (!context || typeof context !== 'string') return undefined;
  // Try patterns like "1234-5 SomeName [" or "1234-5 SomeName:" or "1234-5 SomeName "
  const regexes = [
    new RegExp(`${code}\\s+([A-Za-z0-9 \\-/&()]{2,80})\\s*\\[`),
    new RegExp(`${code}\\s+([A-Za-z0-9 \\-/&()]{2,80})\\s*:`),
    new RegExp(`${code}\\s+([A-Za-z0-9 \\-/&()]{2,80})\\s+in\\s`),
    new RegExp(`${code}\\s+([A-Za-z0-9 \\-/&()]{2,80})\\s+\\bPt\\b`),
    // FSN style: "1234-5 Albumin [Moles/Vol] in Serum"
    new RegExp(`${code}[^\\n]*?([A-Za-z0-9 \\-/&()]{2,80})\\s*\\[`),
  ];

  for (const r of regexes) {
    const m = r.exec(context);
    if (m && m[1]) {
      return m[1].trim();
    }
  }
  // fallback: take first capitalized phrase up to colon/comma/newline
  const fallback = (context.match(new RegExp(`${code}(.{0,120})`)) || [])[1];
  if (fallback) {
    const m = fallback.match(/([A-Z][A-Za-z0-9 \-\/&()]{2,60})/);
    if (m) return m[1].trim();
  }
  return undefined;
}

(function main() {
  if (!fs.existsSync(loincPath)) {
    console.error('loinc-map.json not found, run generate script first');
    process.exit(1);
  }
  const loincJson = JSON.parse(fs.readFileSync(loincPath, 'utf8'));
  // Backup original
  if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, JSON.stringify(loincJson, null, 2), 'utf8');
    console.log('Backup written to', backupPath);
  }

  let improved = 0;
  Object.keys(loincJson).forEach(code => {
    const entry = loincJson[code];
    if ((!entry.shortName || entry.shortName.trim() === '') && entry.context) {
      const sn = extractShortNameFromContext(code, entry.context);
      if (sn) {
        entry.shortName = sn;
        improved++;
      }
    }
    // Normalize some units if present
    if (entry.units && entry.units.length < 6) {
      entry.units = entry.units.replace(/[^A-Za-z0-9\/%\.\s]/g, '').trim();
    }
  });

  fs.writeFileSync(loincPath, JSON.stringify(loincJson, null, 2), 'utf8');
  console.log(`Improved shortName for ${improved} entries and updated ${loincPath}`);
})();

