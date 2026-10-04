/**
 * Ranks catalog candidates against the user's intent.
 *
 * This is a deterministic scoring function, not a second LLM call. That's a
 * deliberate choice, not a shortcut forced by missing time: a rule-based
 * ranker is free, instant, fully offline-testable, and — per Part 10 of the
 * spec this was built against — ranking/recommendation is explicitly an
 * area where deterministic code is allowed and arguably preferable to an
 * LLM making a second opaque judgment call. An LLM-based reranker could be
 * added behind this same function signature later if desired.
 *
 * @param {Array} candidates — real Product documents from catalogSearch.js
 * @param {object} intent — validated intent
 * @returns {Array<{product: object, score: number, matchReason: string}>}
 */
export function rankCandidates(candidates, intent) {
  return candidates
    .map((product) => {
      let score = 0
      const reasons = []

      if (intent.category && product.category === intent.category) {
        score += 3
        reasons.push(`matches the ${intent.category} category`)
      }
      if (intent.anime && product.anime?.toLowerCase().includes(intent.anime.toLowerCase())) {
        score += 3
        reasons.push(`a ${product.anime} design`)
      }
      if (intent.color) {
        const hay = `${product.name} ${product.description} ${(product.tags || []).join(' ')}`.toLowerCase()
        if (hay.includes(intent.color)) { score += 2; reasons.push(`${intent.color} colorway`) }
      }
      if (intent.style) {
        const hay = `${product.name} ${product.description} ${(product.tags || []).join(' ')}`.toLowerCase()
        if (hay.includes(intent.style)) { score += 2; reasons.push(`${intent.style} fit`) }
      }
      if (intent.maxPrice != null) {
        if (product.price <= intent.maxPrice) {
          // Closer to the budget (without exceeding it) scores slightly higher —
          // a ₹1,299 item against a ₹1,500 budget beats a ₹400 item that
          // technically also "fits".
          const closeness = 1 - (intent.maxPrice - product.price) / intent.maxPrice
          score += closeness * 2
          reasons.push(`₹${product.price} fits your ₹${intent.maxPrice} budget`)
        }
      }
      if (product.rating >= 4) { score += 0.5 }

      const matchReason = reasons.length > 0
        ? `Matches because: ${reasons.join(', ')}.`
        : 'A popular pick from the catalog.'

      return { product, score, matchReason }
    })
    .sort((a, b) => b.score - a.score)
}
