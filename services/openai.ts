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

export interface Appointment {
  id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  doctorName: string;
  doctorSpecialty?: string;
  diagnosis?: string;
  notes?: string;
}

export interface DoctorDiagnosis {
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  diagnosis: string;
  notes?: string;
  treatmentRecommendations?: string[];
}

export interface HealthSummary {
  treatmentPlan: TreatmentPlan;
  medicalReports: MedicalReport[];
  medications: Medication[];
  appointments?: Appointment[];
  doctorDiagnoses?: DoctorDiagnosis[];
}

export interface AISuggestion {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  warnings: string[];
}

function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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
    console.error('OpenAI API key is missing. Please set EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY in your .env file.');
    throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY in your .env file.');
  }

  console.log('Calling OpenAI API with model: gpt-4o-mini');

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

${healthData.appointments && healthData.appointments.length > 0 ? `
RECENT APPOINTMENTS:
${healthData.appointments.map(apt => `
- ${apt.type} with ${apt.doctorName}${apt.doctorSpecialty ? ` (${apt.doctorSpecialty})` : ''} on ${apt.date} at ${apt.time}
  Status: ${apt.status}
  ${apt.diagnosis ? `Diagnosis: ${apt.diagnosis}` : ''}
  ${apt.notes ? `Notes: ${apt.notes}` : ''}
`).join('\n')}
` : ''}

${healthData.doctorDiagnoses && healthData.doctorDiagnoses.length > 0 ? `
DOCTOR DIAGNOSES:
${healthData.doctorDiagnoses.map(diag => `
- ${diag.doctorName} (${diag.doctorSpecialty}) - ${diag.date}:
  Diagnosis: ${diag.diagnosis}
  ${diag.notes ? `Notes: ${diag.notes}` : ''}
  ${diag.treatmentRecommendations && diag.treatmentRecommendations.length > 0 ? `Treatment Recommendations: ${diag.treatmentRecommendations.join(', ')}` : ''}
`).join('\n')}
` : ''}

Please provide:
1. A brief, easy-to-understand summary (6-9 sentences) in simple language that incorporates information from all doctors, appointments, and diagnoses
2. 3-5 key points the patient should remember (each point should be one simple sentence)
3. 5-7 specific recommendations for daily care (each recommendation should be actionable and clear)
4. Any important warnings or precautions (if applicable, otherwise return an empty array)

${isRefresh ? 'Note: This is an updated analysis request. Please provide fresh insights and potentially new perspectives on the patient\'s health information.' : ''}

Format your response as a JSON object with these exact keys:
{
  "summary": "brief summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "warnings": ["warning 1", "warning 2", ...] or []
}

Important: Use simple, clear language appropriate for elderly patients. Avoid medical jargon. Consider all diagnoses and appointment information from different doctors when providing your analysis.`;

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
        temperature: isRefresh ? getRandomValue(0.75, 1) : 0.7, // Higher temperature on refresh for more variation
        max_tokens: getRandomValue(1000, 2000),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: { message: errorText } };
      }
      console.error('OpenAI API Error:', errorData);
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText} (Status: ${response.status})`);
    }

    const data = await response.json();
    console.log('OpenAI API Response:', JSON.stringify(data, null, 2));
    
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in OpenAI response:', data);
      throw new Error(`No response from OpenAI. Response: ${JSON.stringify(data)}`);
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

