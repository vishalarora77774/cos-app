import fs from "fs";
import pdf from "pdf-parse";

export type LoincInfo = {
	loincCode: string;
	component?: string;
	property?: string;
	shortName?: string;
	method?: string;
	system?: string;
	units?: string;
	context?: string; // fallback raw context/snippet from the PDF
	sourceFile?: string;
};

/**
 * Extract raw text from a PDF file using pdf-parse.
 */
export async function extractTextFromPdf(filePath: string): Promise<string> {
	const fileBuffer = fs.readFileSync(filePath);
	const parsed = await pdf(fileBuffer as Buffer);
	// pdf-parse returns text in `text` property (plain text extracted)
	return parsed.text || "";
}

function cleanWhitespace(s: string): string {
	return s.replace(/\s+/g, " ").trim();
}

/**
 * Parse LOINC mappings from extracted plain text.
 *
 * This function uses a heuristic approach:
 * - Finds LOINC-style codes (pattern: digits, hyphen, digits e.g. 2345-7)
 * - For each code, grabs a window of surrounding text and attempts to split
 *   it into likely fields. Exact field extraction is dataset-dependent,
 *   so this returns a best-effort object with `context` for manual inspection.
 */
export function parseLoincMappingsFromText(text: string): LoincInfo[] {
	const results: LoincInfo[] = [];

	// LOINC codes typically look like 4-6 digits, dash, check digit (e.g. 1234-5)
	const loincRegex = /\b\d{1,6}-\d+\b/g;
	let match: RegExpExecArray | null;

	while ((match = loincRegex.exec(text)) !== null) {
		const code = match[0];
		const idx = match.index;
		// Grab surrounding context: 180 chars before and after (heuristic)
		const start = Math.max(0, idx - 180);
		const end = Math.min(text.length, idx + code.length + 180);
		const snippet = cleanWhitespace(text.slice(start, end));

		// Try to extract short name/component heuristically:
		// Look for patterns like "Component: ...", "Shortname: ...", or text around newline.
		let component: string | undefined;
		let shortName: string | undefined;
		let property: string | undefined;
		let method: string | undefined;
		let system: string | undefined;
		let units: string | undefined;

		// Simple label-based extraction (case-insensitive)
		const labels = {
			component: /component[:\s]+([^;,\n]+)/i,
			shortName: /(short\s*name|shortname)[:\s]+([^;,\n]+)/i,
			property: /property[:\s]+([^;,\n]+)/i,
			method: /method[:\s]+([^;,\n]+)/i,
			system: /system[:\s]+([^;,\n]+)/i,
			units: /unit[s]?\s*[:\s]+([^;,\n]+)/i,
		};

		const tryMatch = (re: RegExp) => {
			const m = re.exec(snippet);
			return m ? cleanWhitespace(m[1]) : undefined;
		};

		component = tryMatch(labels.component);
		shortName = tryMatch(labels.shortName);
		property = tryMatch(labels.property);
		method = tryMatch(labels.method);
		system = tryMatch(labels.system);
		units = tryMatch(labels.units);

		// If label-based extraction failed, fall back to nearby tokens:
		if (!shortName) {
			// often the short name follows the code in the same line; try to grab next 60 chars
			const after = cleanWhitespace(text.slice(idx + code.length, Math.min(text.length, idx + code.length + 120)));
			const firstPhrase = after.split(/[\n\r;,.]/)[0];
			if (firstPhrase && firstPhrase.length > 2 && firstPhrase.length < 120) {
				shortName = cleanWhitespace(firstPhrase);
			}
		}

		results.push({
			loincCode: code,
			component,
			property,
			shortName,
			method,
			system,
			units,
			context: snippet,
		});
	}

	return results;
}

/**
 * Build a mapping (Map<loincCode, LoincInfo>) from an array of PDF file paths.
 * This method reads each PDF, extracts text, parses mappings, and merges results.
 */
export async function buildLoincMapFromPdfFiles(pdfPaths: string[]): Promise<Map<string, LoincInfo>> {
	const loincMap = new Map<string, LoincInfo>();

	for (const p of pdfPaths) {
		try {
			const text = await extractTextFromPdf(p);
			const parsed = parseLoincMappingsFromText(text);
			for (const item of parsed) {
				// prefer richer entries (with shortName/component) when merging
				const existing = loincMap.get(item.loincCode);
				if (!existing) {
					item.sourceFile = p;
					loincMap.set(item.loincCode, item);
					continue;
				}
				// merge fields preferring non-empty values
				const merged: LoincInfo = {
					loincCode: existing.loincCode,
					component: existing.component || item.component,
					property: existing.property || item.property,
					shortName: existing.shortName || item.shortName,
					method: existing.method || item.method,
					system: existing.system || item.system,
					units: existing.units || item.units,
					context: (existing.context && existing.context.length > item.context!.length) ? existing.context : item.context,
					sourceFile: existing.sourceFile || item.sourceFile || p,
				};
				loincMap.set(item.loincCode, merged);
			}
		} catch (err) {
			// swallow per-file errors but rethrow if needed; keep processing other files
			// consumers can log or surface these errors
			console.warn(`Failed to process PDF ${p}: ${(err as Error).message}`);
		}
	}

	return loincMap;
}

export default {
	extractTextFromPdf,
	parseLoincMappingsFromText,
	buildLoincMapFromPdfFiles,
};

