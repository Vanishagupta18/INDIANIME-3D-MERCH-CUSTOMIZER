/**
 * Validates and sanitizes an "intent" object — whether it came from the
 * rule-based extractor or an LLM — before it is allowed anywhere near a
 * MongoDB query. This is the boundary described in the architecture
 * requirements: the AI may only produce these specific fields, with these
 * specific types; anything else is dropped, not passed through.
 *
 * No npm schema library (zod/joi) was already a dependency of this backend,
 * and adding one wasn't worth a new dependency for five fields — this is a
 * small enough contract to validate by hand, explicitly, where every rule is
 * visible in one place.
 */

export const KNOWN_CATEGORIES = ['tshirt', 'hoodie', 'cap', 'poster', 'accessory']

const CATEGORY_SYNONYMS = {
  tshirt: 'tshirt', tshirts: 'tshirt', 't-shirt': 'tshirt', 'tshirt': 'tshirt',
  tee: 'tshirt', tees: 'tshirt', shirt: 'tshirt', shirts: 'tshirt',
  hoodie: 'hoodie', hoodies: 'hoodie', sweatshirt: 'hoodie',
  cap: 'cap', caps: 'cap', hat: 'cap', hats: 'cap',
  poster: 'poster', posters: 'poster', print: 'poster', prints: 'poster',
  accessory: 'accessory', accessories: 'accessory'
}

export function normalizeCategory(raw) {
  if (!raw || typeof raw !== 'string') return null
  const key = raw.trim().toLowerCase()
  return CATEGORY_SYNONYMS[key] || (KNOWN_CATEGORIES.includes(key) ? key : null)
}

/**
 * @param {any} raw — untrusted object from a rule-based parser or an LLM response
 * @returns {{intent: 'product_search', category: string|null, color: string|null,
 *            style: string|null, anime: string|null, maxPrice: number|null,
 *            minPrice: number|null, quantity: number}}
 */
export function validateIntent(raw) {
  const obj = raw && typeof raw === 'object' ? raw : {}

  const category = normalizeCategory(obj.category)

  const color = typeof obj.color === 'string' && obj.color.trim().length > 0 && obj.color.length <= 30
    ? obj.color.trim().toLowerCase()
    : null

  const style = typeof obj.style === 'string' && obj.style.trim().length > 0 && obj.style.length <= 30
    ? obj.style.trim().toLowerCase()
    : null

  const anime = typeof obj.anime === 'string' && obj.anime.trim().length > 0 && obj.anime.length <= 60
    ? obj.anime.trim()
    : null

  const maxPrice = Number.isFinite(obj.maxPrice) && obj.maxPrice > 0 ? Math.min(obj.maxPrice, 1_000_000) : null
  const minPrice = Number.isFinite(obj.minPrice) && obj.minPrice >= 0 ? Math.min(obj.minPrice, 1_000_000) : null

  const quantity = Number.isInteger(obj.quantity) && obj.quantity > 0 ? Math.min(obj.quantity, 20) : 1

  return { intent: 'product_search', category, color, style, anime, maxPrice, minPrice, quantity }
}

/**
 * Merges a freshly-extracted intent over a previous one, so a refinement
 * message ("make it under 1000") only overrides the fields it actually
 * mentions and keeps everything else from the prior turn (e.g. category).
 */
export function mergeIntent(previous, update) {
  if (!previous) return update
  const merged = { ...previous }
  for (const key of ['category', 'color', 'style', 'anime', 'maxPrice', 'minPrice']) {
    if (update[key] !== null && update[key] !== undefined) merged[key] = update[key]
  }
  if (update.quantity && update.quantity !== 1) merged.quantity = update.quantity
  return merged
}
