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

export interface HealthMetricsData {
  steps: number;
  heartRate: number | null;
  sleepHours: number;
  caloriesBurned: number;
}

function getRandomValue(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generates AI-powered health suggestions based on treatment plan, medical reports, and medications
 * @param healthData - The health summary data
 * @param isRefresh - Whether this is a refresh call (increases temperature for more variation)
 * @param healthMetrics - Optional health metrics from HealthKit (steps, heart rate, sleep, calories)
 */
export async function generateHealthSuggestions(
  healthData: HealthSummary,
  isRefresh: boolean = false,
  healthMetrics?: HealthMetricsData | null
): Promise<AISuggestion> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key is missing. Please set EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY in your .env file.');
    throw new Error('OpenAI API key not configured. Please set EXPO_PUBLIC_OPEN_AI_PUBLIC_KEY in your .env file.');
  }

  console.log('Calling OpenAI API with model: gpt-4o-mini');
  console.log('📊 Health metrics received:', healthMetrics ? {
    steps: healthMetrics.steps,
    heartRate: healthMetrics.heartRate,
    sleepHours: healthMetrics.sleepHours,
    caloriesBurned: healthMetrics.caloriesBurned,
    hasData: healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0,
  } : 'null');

  // Sort appointments and diagnoses by date (most recent first)
  const sortedAppointments = healthData.appointments 
    ? [...healthData.appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];
  const sortedDiagnoses = healthData.doctorDiagnoses 
    ? [...healthData.doctorDiagnoses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];
  
  const currentDiagnoses = sortedDiagnoses.length > 0 ? [sortedDiagnoses[0]] : [];
  const previousDiagnoses = sortedDiagnoses.length > 1 ? sortedDiagnoses.slice(1) : [];
  
  const currentAppointments = sortedAppointments.filter(apt => apt.status === 'Scheduled' || apt.status === 'Upcoming');
  const completedAppointments = sortedAppointments.filter(apt => apt.status === 'Completed');

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

${sortedAppointments.length > 0 ? `
APPOINTMENT HISTORY:
${completedAppointments.length > 0 ? `
COMPLETED APPOINTMENTS (Most Recent First):
${completedAppointments.map(apt => `
- ${apt.type} with ${apt.doctorName}${apt.doctorSpecialty ? ` (${apt.doctorSpecialty})` : ''} on ${apt.date} at ${apt.time}
  Status: ${apt.status}
  ${apt.diagnosis ? `Diagnosis: ${apt.diagnosis}` : ''}
  ${apt.notes ? `Notes: ${apt.notes}` : ''}
`).join('\n')}
` : ''}
${currentAppointments.length > 0 ? `
UPCOMING/SCHEDULED APPOINTMENTS:
${currentAppointments.map(apt => `
- ${apt.type} with ${apt.doctorName}${apt.doctorSpecialty ? ` (${apt.doctorSpecialty})` : ''} on ${apt.date} at ${apt.time}
  Status: ${apt.status}
`).join('\n')}
` : ''}
` : ''}

${sortedDiagnoses.length > 0 ? `
DIAGNOSIS HISTORY:
${currentDiagnoses.length > 0 ? `
CURRENT/MOST RECENT DIAGNOSES:
${currentDiagnoses.map(diag => `
- ${diag.doctorName} (${diag.doctorSpecialty}) - ${diag.date}:
  Diagnosis: ${diag.diagnosis}
  ${diag.notes ? `Notes: ${diag.notes}` : ''}
  ${diag.treatmentRecommendations && diag.treatmentRecommendations.length > 0 ? `Treatment Recommendations: ${diag.treatmentRecommendations.join(', ')}` : ''}
`).join('\n')}
` : ''}
${previousDiagnoses.length > 0 ? `
PREVIOUS DIAGNOSES (Historical):
${previousDiagnoses.map(diag => `
- ${diag.doctorName} (${diag.doctorSpecialty}) - ${diag.date}:
  Diagnosis: ${diag.diagnosis}
  ${diag.notes ? `Notes: ${diag.notes}` : ''}
  ${diag.treatmentRecommendations && diag.treatmentRecommendations.length > 0 ? `Treatment Recommendations: ${diag.treatmentRecommendations.join(', ')}` : ''}
`).join('\n')}
` : ''}
` : ''}

${healthMetrics && (healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0) ? `
HEALTH APP DATA (Today's Activity from Apple Health):
- Steps: ${healthMetrics.steps.toLocaleString()} steps
- Heart Rate: ${healthMetrics.heartRate ? `${healthMetrics.heartRate} bpm` : 'Not available'}
- Sleep: ${healthMetrics.sleepHours.toFixed(1)} hours
- Calories Burned: ${healthMetrics.caloriesBurned.toLocaleString()} calories

IMPORTANT: You MUST incorporate this activity data into your analysis. This real-time health data provides crucial insights into the patient's daily activity levels, exercise patterns, sleep quality, and overall physical health. 
- Analyze how their activity levels (steps, calories) relate to their treatment plan and medical conditions
- Consider sleep duration in relation to their health goals and recovery
- If heart rate data is available, note any patterns or concerns
- Provide specific recommendations based on this activity data
- Mention these metrics in your summary and recommendations where relevant
` : ''}

Please provide:
1. A brief, easy-to-understand summary (6-9 sentences) in simple language that:
   - Incorporates information from all doctors, appointments, and diagnoses
   - ${healthMetrics && (healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0) ? 'MUST include insights from the Health App data (steps, sleep, calories, heart rate) and how it relates to their treatment plan' : ''}
   - Analyzes the progression of diagnoses over time (comparing current vs previous diagnoses)
   - Identifies trends and improvements or concerns based on appointment history
   - Considers how different specialists' diagnoses relate to each other
2. 3-5 key points the patient should remember (each point should be one simple sentence, focusing on important insights from diagnoses, appointments${healthMetrics && (healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0) ? ', and activity data' : ''})
3. 5-7 specific recommendations for daily care (each recommendation should be actionable and clear, incorporating treatment recommendations from diagnoses${healthMetrics && (healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0) ? ' and activity levels from Health App data' : ''})
4. Any important warnings or precautions based on diagnosis trends, appointment findings, or conflicting information between different doctors (if applicable, otherwise return an empty array)

${isRefresh ? 'Note: This is an updated analysis request. Please provide fresh insights and potentially new perspectives on the patient\'s health information.' : ''}

IMPORTANT ANALYSIS REQUIREMENTS:
- Compare current diagnoses with previous diagnoses to identify improvements, stability, or new concerns
- Analyze appointment history to understand the patient's health journey
- Look for patterns or trends across different doctors' assessments
- Consider how diagnoses from different specialists (e.g., Cardiologist, Endocrinologist) relate to each other
- Highlight any significant changes in diagnosis or treatment approach over time

Format your response as a JSON object with these exact keys:
{
  "summary": "brief summary here",
  "keyPoints": ["point 1", "point 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "warnings": ["warning 1", "warning 2", ...] or []
}

Important: Use simple, clear language appropriate for elderly patients. Avoid medical jargon. Make sure to analyze and incorporate insights from both current and previous diagnoses, as well as the complete appointment history.`;

  // Log a snippet of the prompt to verify health data is included
  const hasHealthData = healthMetrics && (healthMetrics.steps > 0 || healthMetrics.heartRate !== null || healthMetrics.sleepHours > 0 || healthMetrics.caloriesBurned > 0);
  console.log('📝 Prompt includes health data:', hasHealthData);
  if (hasHealthData) {
    const healthDataSection = prompt.match(/HEALTH APP DATA[\s\S]*?IMPORTANT:[\s\S]*?activity data/);
    console.log('📝 Health data section in prompt:', healthDataSection ? 'Found' : 'NOT FOUND');
  }

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

