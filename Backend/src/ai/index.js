import { extractIntentRuleBased } from './ruleBasedIntent.js'
import { extractIntentOpenAI } from './openaiIntent.js'
import { validateIntent, mergeIntent } from './intentSchema.js'

/**
 * Extracts and validates shopping intent from a message, using whichever
 * provider AI_PROVIDER selects (default: rule-based). If the LLM provider
 * is selected but fails for any reason — missing key, network error,
 * timeout, malformed response — this falls back to the rule-based
 * extractor instead of surfacing an error. That fallback is the actual
 * mechanism behind "the app must not become unusable when the AI API is
 * down": there's no special-case error screen, the agent just gets a
 * little less clever for that one request.
 *
 * @param {string} message
 * @param {object|null} previousIntent — for multi-turn refinement ("make it under 1000")
 * @returns {Promise<{intent: object, usedProvider: 'rule-based'|'openai', degraded: boolean}>}
 */
export async function extractAndValidateIntent(message, previousIntent = null) {
  const provider = process.env.AI_PROVIDER || 'rule-based'
  let raw
  let usedProvider = 'rule-based'
  let degraded = false

  if (provider === 'openai') {
    try {
      raw = await extractIntentOpenAI(message)
      usedProvider = 'openai'
    } catch (err) {
      console.error('OpenAI intent extraction failed, falling back to rule-based:', err.message)
      raw = extractIntentRuleBased(message)
      degraded = true
    }
  } else {
    raw = extractIntentRuleBased(message)
  }

  const validated = validateIntent(raw)
  const merged = mergeIntent(previousIntent, validated)
  return { intent: merged, usedProvider, degraded }
}
