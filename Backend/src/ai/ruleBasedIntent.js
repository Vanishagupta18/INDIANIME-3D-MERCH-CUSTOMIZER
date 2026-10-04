/**
 * Deterministic natural-language shopping intent extraction — no API key,
 * no network call, no external dependency. This is the DEFAULT provider
 * (see ai/index.js), not just a fallback: INDIANIME's AI shopping agent
 * works out of the box with this, and an LLM-based extractor can be
 * layered in behind the exact same interface for better recall on phrasing
 * this parser doesn't catch.
 *
 * It deliberately only recognizes a bounded vocabulary — that's what makes
 * it fast, free, and impossible to prompt-inject.
 */

const COLOR_WORDS = ['black', 'white', 'red', 'blue', 'navy', 'grey', 'gray', 'green', 'yellow', 'orange', 'purple', 'maroon', 'beige']
const STYLE_WORDS = ['oversized', 'slim', 'regular', 'fitted', 'loose', 'relaxed']

// Common anime titles likely to appear in an anime-merch store's catalog.
// A real deployment would generate this list from the distinct `anime`
// values actually in the Product collection rather than a fixed list —
// documented as a known improvement (see FIXES.md).
const KNOWN_ANIME = [
  'naruto', 'attack on titan', 'aot', 'jujutsu kaisen', 'jjk', 'demon slayer',
  'one piece', 'dragon ball', 'my hero academia', 'mha', 'death note',
  'bleach', 'tokyo revengers', 'chainsaw man', 'spy x family'
]

const CATEGORY_WORDS = ['hoodie', 'hoodies', 'tshirt', 't-shirt', 'tee', 'tees', 'shirt', 'cap', 'caps', 'poster', 'posters', 'accessory', 'accessories']

function extractPrice(message) {
  const lower = message.toLowerCase()
  let maxPrice = null
  let minPrice = null

  // "under 1500", "under ₹1500", "below 2000", "less than 2500", "max budget 1000"
  const underMatch = lower.match(/(?:under|below|less than|max(?:imum)?(?: budget)?(?: of)?)\s*(?:rs\.?|₹|inr)?\s*(\d{2,6})/)
  if (underMatch) maxPrice = Number(underMatch[1])

  // "over 500", "above 1000", "at least 500", "min budget 500"
  const overMatch = lower.match(/(?:over|above|at least|min(?:imum)?(?: budget)?(?: of)?)\s*(?:rs\.?|₹|inr)?\s*(\d{2,6})/)
  if (overMatch) minPrice = Number(overMatch[1])

  // "between 1000 and 2000"
  const betweenMatch = lower.match(/between\s*(?:rs\.?|₹|inr)?\s*(\d{2,6})\s*(?:and|-|to)\s*(?:rs\.?|₹|inr)?\s*(\d{2,6})/)
  if (betweenMatch) {
    minPrice = Number(betweenMatch[1])
    maxPrice = Number(betweenMatch[2])
  }

  return { maxPrice, minPrice }
}

function extractQuantity(message) {
  const lower = message.toLowerCase()
  const wordNums = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1, pair: 2, couple: 2 }
  const digitMatch = lower.match(/\b(\d{1,2})\s*(?:x|hoodies|tshirts|t-shirts|tees|shirts|caps|posters|items|pieces)\b/)
  if (digitMatch) return Number(digitMatch[1])
  for (const [word, n] of Object.entries(wordNums)) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) return n
  }
  return 1
}

function extractFirstMatch(message, wordList) {
  const lower = message.toLowerCase()
  for (const word of wordList) {
    if (new RegExp(`\\b${word}\\b`).test(lower)) return word
  }
  return null
}

/**
 * @param {string} message — raw user shopping request
 * @returns {object} unvalidated intent — caller must pass through validateIntent()
 */
export function extractIntentRuleBased(message) {
  if (typeof message !== 'string' || !message.trim()) {
    return { category: null, color: null, style: null, anime: null, maxPrice: null, minPrice: null, quantity: 1 }
  }

  const { maxPrice, minPrice } = extractPrice(message)
  const category = extractFirstMatch(message, CATEGORY_WORDS)
  const color = extractFirstMatch(message, COLOR_WORDS)
  const style = extractFirstMatch(message, STYLE_WORDS)
  const anime = extractFirstMatch(message, KNOWN_ANIME)
  const quantity = extractQuantity(message)

  return { category, color, style, anime, maxPrice, minPrice, quantity }
}
