// Feature: smart-diagnosis-center
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT =
  'You are a medical triage assistant. Analyze the following symptom description and respond ONLY with a valid JSON object with exactly these fields: summary (plain-language summary of the condition), urgencyLevel (one of: Emergency, High, Medium, Low), nextSteps (recommended immediate actions for the patient). Do not include any text outside the JSON.';

const FALLBACK = {
  summary: 'AI analysis temporarily unavailable. Please consult a doctor.',
  urgencyLevel: 'Medium',
  nextSteps: 'Please visit the diagnosis center for a proper evaluation.',
};

/**
 * Analyze a symptom description using GPT-4o mini.
 * Returns a fallback object on any error (API error, timeout, parse error).
 *
 * @param {string} symptomDescription
 * @returns {Promise<{ summary: string, urgencyLevel: string, nextSteps: string }>}
 */
export async function analyze(symptomDescription) {
  try {
    const response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: symptomDescription },
        ],
        max_tokens: 300,
      },
      { signal: AbortSignal.timeout(10000) }
    );

    const content = response.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary,
      urgencyLevel: parsed.urgencyLevel,
      nextSteps: parsed.nextSteps,
    };
  } catch {
    return { ...FALLBACK };
  }
}
