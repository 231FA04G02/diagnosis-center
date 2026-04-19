// Feature: smart-diagnosis-center
// Pure stateless priority engine — no I/O, no side effects

const KEYWORD_RULES = [
  {
    score: 100,
    level: 'Emergency',
    keywords: [
      'breathing difficulty',
      "can't breathe",
      'shortness of breath',
      'difficulty breathing',
      'cannot breathe',
      'trouble breathing',
    ],
  },
  {
    score: 75,
    level: 'High',
    keywords: ['chest pain', 'chest tightness', 'chest pressure'],
  },
  {
    score: 50,
    level: 'Medium',
    keywords: ['fever', 'high temperature', 'high fever'],
  },
  {
    score: 25,
    level: 'Low',
    keywords: ['cold', 'runny nose', 'sore throat', 'cough', 'sneezing'],
  },
];

/**
 * Score a symptom description and return a priority score and level.
 * When multiple categories match, the highest score wins.
 * When no keywords match, defaults to score=25, level='Low'.
 *
 * @param {string} description
 * @returns {{ score: number, level: 'Emergency'|'High'|'Medium'|'Low' }}
 */
export function scoreSymptoms(description) {
  const lower = typeof description === 'string' ? description.toLowerCase() : '';

  let result = { score: 25, level: 'Low' };

  for (const rule of KEYWORD_RULES) {
    if (rule.score > result.score && rule.keywords.some((kw) => lower.includes(kw))) {
      result = { score: rule.score, level: rule.level };
    }
  }

  return result;
}
