import { useState, useEffect } from 'react'
import api from '../api/axios'

// Single frontend source for pricing/shipping display rules — fetched once
// from GET /api/config/pricing-rules, which reads the SAME constants the
// backend actually enforces (Backend/src/services/pricing.js). This is what
// replaced the old bug: Cart.jsx used ₹999, Checkout used ₹1,500, and the
// backend used yet another number. Now there is exactly one number, and the
// frontend only ever displays it.
const FALLBACK_RULES = {
  freeShippingThresholdPaise: 1500_00,
  flatShippingPaise: 99_00,
  custom: null
}

let cached = null // avoid refetching on every page nav within one session

export function usePricingRules() {
  const [rules, setRules] = useState(cached || FALLBACK_RULES)

  useEffect(() => {
    if (cached) return
    api.get('/config/pricing-rules')
      .then(({ data }) => { cached = data.rules; setRules(data.rules) })
      .catch(() => {}) // fallback already in place
  }, [])

  return rules
}

export function computeShipping(itemsPriceRupees, rules) {
  const shipping = (itemsPriceRupees * 100) >= rules.freeShippingThresholdPaise ? 0 : rules.flatShippingPaise / 100
  return shipping
}
