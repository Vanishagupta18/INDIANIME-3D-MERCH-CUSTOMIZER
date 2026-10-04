import { rankCandidates } from '../ai/ranking.js'
import { validateIntent } from '../ai/intentSchema.js'

const candidates = [
  { _id: '1', name: 'Shadow Hoodie', description: 'oversized fit', category: 'hoodie', anime: 'Naruto', price: 1299, tags: ['black'], rating: 4.5 },
  { _id: '2', name: 'Plain Cap', description: 'basic', category: 'cap', anime: 'One Piece', price: 299, tags: [], rating: 2 },
  { _id: '3', name: 'Expensive Hoodie', description: 'oversized black', category: 'hoodie', anime: 'Naruto', price: 1800, tags: ['black'], rating: 4.8 }
]

describe('rankCandidates', () => {
  test('ranks the item matching category, color, style, anime, and budget first', () => {
    const intent = validateIntent({ category: 'hoodie', color: 'black', style: 'oversized', anime: 'naruto', maxPrice: 1500 })
    const ranked = rankCandidates(candidates, intent)
    expect(ranked[0].product._id).toBe('1')
  })

  test('does not exclude an over-budget item, just scores it lower', () => {
    const intent = validateIntent({ maxPrice: 1500 })
    const ranked = rankCandidates(candidates, intent)
    expect(ranked.some((r) => r.product._id === '3')).toBe(true)
    const inBudget = ranked.find((r) => r.product._id === '1').score
    const overBudget = ranked.find((r) => r.product._id === '3').score
    expect(overBudget).toBeLessThan(inBudget)
  })

  test('produces a human-readable match reason for every candidate', () => {
    const intent = validateIntent({ category: 'hoodie' })
    const ranked = rankCandidates(candidates, intent)
    for (const r of ranked) {
      expect(typeof r.matchReason).toBe('string')
      expect(r.matchReason.length).toBeGreaterThan(0)
    }
  })

  test('with an empty intent, still returns all candidates without throwing', () => {
    const intent = validateIntent({})
    expect(() => rankCandidates(candidates, intent)).not.toThrow()
    expect(rankCandidates(candidates, intent)).toHaveLength(3)
  })
})
