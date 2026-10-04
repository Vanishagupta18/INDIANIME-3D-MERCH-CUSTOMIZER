import { extractIntentRuleBased } from '../ai/ruleBasedIntent.js'
import { validateIntent, mergeIntent, normalizeCategory } from '../ai/intentSchema.js'

describe('extractIntentRuleBased', () => {
  test('extracts category, color, style, and a budget from a natural request', () => {
    const r = extractIntentRuleBased('Find me a black oversized anime hoodie under ₹1500')
    expect(r.category).toBe('hoodie')
    expect(r.color).toBe('black')
    expect(r.style).toBe('oversized')
    expect(r.maxPrice).toBe(1500)
  })

  test('extracts a known anime title', () => {
    const r = extractIntentRuleBased('I want a Naruto oversized t-shirt')
    expect(r.anime).toBe('naruto')
    expect(r.category).toBe('t-shirt')
  })

  test('extracts a price range from "between X and Y"', () => {
    const r = extractIntentRuleBased('Show me posters between 500 and 1200')
    expect(r.minPrice).toBe(500)
    expect(r.maxPrice).toBe(1200)
  })

  test('extracts quantity from a number word and a digit', () => {
    expect(extractIntentRuleBased('I want two anime t-shirts').quantity).toBe(2)
    expect(extractIntentRuleBased('give me 3 caps').quantity).toBe(3)
  })

  test('returns nulls for an unrelated message instead of guessing', () => {
    const r = extractIntentRuleBased('what is your return policy')
    expect(r.category).toBeNull()
    expect(r.maxPrice).toBeNull()
  })

  test('handles empty/non-string input safely', () => {
    expect(extractIntentRuleBased('').category).toBeNull()
    expect(extractIntentRuleBased(undefined).category).toBeNull()
  })
})

describe('validateIntent — the AI-output trust boundary', () => {
  test('normalizes category synonyms to the catalog enum', () => {
    expect(normalizeCategory('t-shirt')).toBe('tshirt')
    expect(normalizeCategory('hoodies')).toBe('hoodie')
    expect(normalizeCategory('sneakers')).toBeNull() // not a real category — rejected, not guessed
  })

  test('drops any field not in the known schema, however the input is shaped', () => {
    const malicious = {
      category: 'hoodie',
      maxPrice: 1500,
      // an LLM (or an attacker) could return anything else here:
      $where: 'drop everything',
      role: 'admin',
      isPaid: true,
      stock: 999999
    }
    const result = validateIntent(malicious)
    expect(result).not.toHaveProperty('$where')
    expect(result).not.toHaveProperty('role')
    expect(result).not.toHaveProperty('isPaid')
    expect(result).not.toHaveProperty('stock')
    expect(Object.keys(result).sort()).toEqual(
      ['anime', 'category', 'color', 'intent', 'maxPrice', 'minPrice', 'quantity', 'style'].sort()
    )
  })

  test('clamps an absurd maxPrice instead of trusting it verbatim', () => {
    const result = validateIntent({ maxPrice: 99999999999 })
    expect(result.maxPrice).toBeLessThanOrEqual(1_000_000)
  })

  test('clamps quantity to a sane maximum', () => {
    expect(validateIntent({ quantity: 99999 }).quantity).toBeLessThanOrEqual(20)
  })

  test('defaults quantity to 1 when absent or invalid', () => {
    expect(validateIntent({}).quantity).toBe(1)
    expect(validateIntent({ quantity: -5 }).quantity).toBe(1)
    expect(validateIntent({ quantity: 2.5 }).quantity).toBe(1)
  })
})

describe('mergeIntent — multi-turn refinement', () => {
  test('a follow-up message only overrides the fields it mentions', () => {
    const first = validateIntent({ category: 'hoodie', color: 'black', maxPrice: 1500 })
    const refinement = validateIntent({ maxPrice: 1000 }) // "make it under 1000"
    const merged = mergeIntent(first, refinement)
    expect(merged.category).toBe('hoodie') // kept
    expect(merged.color).toBe('black')     // kept
    expect(merged.maxPrice).toBe(1000)     // overridden
  })

  test('with no previous intent, returns the new one unchanged', () => {
    const fresh = validateIntent({ category: 'cap' })
    expect(mergeIntent(null, fresh)).toEqual(fresh)
  })
})
