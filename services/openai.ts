// Note: In Expo, environment variables must be prefixed with EXPO_PUBLIC_ to be accessible on the client
// Make sure your .env file contains: EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY=your_key_here
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface TreatmentPlan {
  plan: string;
  duration: string;
  goals: string[];
}

export interface MedicalReport {
  date: string;
  type: string;
  summary: string;
  findings: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  purpose: string;
}

export interface HealthSummary {
  treatmentPlan: TreatmentPlan;
  medicalReports: MedicalReport[];
  medications: Medication[];
}

export interface AISuggestion {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  warnings: string[];
}

/**
 * Generates AI-powered health suggestions based on treatment plan, medical reports, and medications
 * @param healthData - The health summary data
 * @param isRefresh - Whether this is a refresh call (increases temperature for more variation)
 */
export async function generateHealthSuggestions(
  healthData: HealthSummary,
  isRefresh: boolean = false
): Promise<AISuggestion> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY in your .env file.');
  }

  // Construct comprehensive prompt for OpenAI
  const prompt = `You are a helpful medical assistant providing clear, easy-to-understand health summaries for elderly patients.

Based on the following information:

TREATMENT PLAN:
- Plan: ${healthData.treatmentPlan.plan}
- Duration: ${healthData.treatmentPlan.duration}
- Goals: ${healthData.treatmentPlan.goals.join(', ')}

MEDICAL REPORTS:
${healthData.medicalReports.map(report => `
- ${report.type} (${report.date}): ${report.summary}
  Findings: ${report.findings.join(', ')}
`).join('\n')}

CURRENT MEDICATIONS:
${healthData.medications.map(med => `
- ${med.name}: ${med.dosage} - ${med.frequency} (${med.purpose})
`).join('\n')}

Please provide:
1. A brief, easy-to-understand summary (2-3 sentences) in simple language
2. 3-5 key points the patient should remember (each point should be one simple sentence)
3. 2-4 specific recommendations for daily care (each recommendation should be actionable and clear)
4. Any important warnings or precautions (if applicable, otherwise return an empty array)

${isRefresh ? 'Note: This is an updated analysis request. Please provide fresh insights and potentially new perspectives on the patient\'s health information.' : ''}

Format your response as a JSON object with these exact keys:
{
  "summary": "brief summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "warnings": ["warning 1", "warning 2", ...] or []
}

Important: Use simple, clear language appropriate for elderly patients. Avoid medical jargon.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using cost-effective model
        messages: [
          {
            role: 'system',
            content: 'You are a compassionate medical assistant that provides clear, simple health information for elderly patients. Always use easy-to-understand language and avoid complex medical terms.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: isRefresh ? 0.85 : 0.7, // Higher temperature on refresh for more variation
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(content);
      return {
        summary: parsedResponse.summary || 'Unable to generate summary.',
        keyPoints: Array.isArray(parsedResponse.keyPoints) ? parsedResponse.keyPoints : [],
        recommendations: Array.isArray(parsedResponse.recommendations) ? parsedResponse.recommendations : [],
        warnings: Array.isArray(parsedResponse.warnings) ? parsedResponse.warnings : [],
      };
    } catch (parseError) {
      // Fallback: treat the entire response as summary if JSON parsing fails
      return {
        summary: content,
        keyPoints: [],
        recommendations: [],
        warnings: [],
      };
    }
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

