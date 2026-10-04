/**
 * Optional LLM-based intent extraction via the OpenAI API.
 *
 * NOT exercised or network-tested in the environment this was written in
 * (no outbound network access there) — the rule-based extractor was tested
 * directly instead. This implementation follows OpenAI's documented
 * Chat Completions + JSON response format; verify it against a real
 * OPENAI_API_KEY before relying on it for a demo.
 *
 * Whatever this returns is NOT trusted as-is: the caller (ai/index.js)
 * always pipes the result through validateIntent() from intentSchema.js,
 * exactly like the rule-based path. An LLM hallucinating an extra field,
 * a wrong type, or a prompt-injected instruction has no effect — the
 * validator only reads the five known fields and ignores everything else.
 */

const SYSTEM_PROMPT = `You extract structured shopping intent from a user's message for an anime streetwear store.
Respond with ONLY a JSON object with these fields (use null for anything not mentioned):
{
  "category": one of "tshirt" | "hoodie" | "cap" | "poster" | "accessory" | null,
  "color": a single color word or null,
  "style": a fit/style word like "oversized" or "slim" or null,
  "anime": the anime/series name mentioned or null,
  "maxPrice": a number (INR) or null,
  "minPrice": a number (INR) or null,
  "quantity": an integer, default 1
}
Do not include any text outside the JSON object. Do not invent values the user didn't imply.`

export async function extractIntentOpenAI(message, { timeoutMs = 8000 } = {}) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: message }
        ]
      }),
      signal: controller.signal
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`OpenAI request failed (${res.status}): ${body}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenAI returned no content')

    let parsed
    try {
      parsed = JSON.parse(content)
    } catch {
      throw new Error('OpenAI returned non-JSON content')
    }
    return parsed // unvalidated — caller must run this through validateIntent()
  } finally {
    clearTimeout(timeout)
  }
}
