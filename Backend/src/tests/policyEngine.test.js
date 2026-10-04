import { evaluateLineItem, evaluateOrder } from '../policy/policyEngine.js'

const baseConfig = {
  confirmationRequired: true,
  maximumAmountPaise: 10_000_00,
  maximumQuantity: 5,
  allowedCategories: null
}

const baseItem = {
  amountPaise: 1_000_00,
  quantity: 2,
  category: 'tshirt',
  stock: 10,
  isActive: true,
  userConfirmed: true,
  isDuplicateAttempt: false
}

describe('policy engine — evaluateLineItem', () => {
  test('allows a valid, confirmed, in-stock purchase', () => {
    const result = evaluateLineItem(baseItem, baseConfig)
    expect(result.allowed).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  test('rejects when user confirmation is required but missing', () => {
    const result = evaluateLineItem({ ...baseItem, userConfirmed: false }, baseConfig)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/confirmation is required/i)
  })

  test('rejects when requested quantity exceeds available stock', () => {
    const result = evaluateLineItem({ ...baseItem, quantity: 20, stock: 3 }, baseConfig)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/only 3 unit/i)
  })

  test('rejects when quantity exceeds the configured maximum', () => {
    const result = evaluateLineItem({ ...baseItem, quantity: 6 }, baseConfig)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/exceeds the maximum allowed quantity/i)
  })

  test('rejects when the line total exceeds the spending limit', () => {
    const result = evaluateLineItem({ ...baseItem, amountPaise: 6_000_00, quantity: 2 }, baseConfig)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/spending limit/i)
  })

  test('rejects a category not on the allow-list', () => {
    const config = { ...baseConfig, allowedCategories: ['hoodie'] }
    const result = evaluateLineItem(baseItem, config)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/not in the allowed category list/i)
  })

  test('short-circuits on a duplicate/idempotent attempt', () => {
    const result = evaluateLineItem({ ...baseItem, isDuplicateAttempt: true }, baseConfig)
    expect(result.allowed).toBe(false)
    expect(result.checks).toHaveLength(1)
  })

  test('rejects a non-positive or non-integer quantity even if everything else is valid', () => {
    expect(evaluateLineItem({ ...baseItem, quantity: 0 }, baseConfig).allowed).toBe(false)
    expect(evaluateLineItem({ ...baseItem, quantity: 1.5 }, baseConfig).allowed).toBe(false)
  })
})

describe('policy engine — evaluateOrder', () => {
  test('rejects the whole order if the aggregate total exceeds the order-level limit', () => {
    const items = [baseItem, baseItem, baseItem] // 3 x ₹2,000 = ₹6,000 line totals, well within per-item limit
    const result = evaluateOrder(items, baseConfig, 6_000_00, 5_000_00)
    expect(result.allowed).toBe(false)
    expect(result.reasons.join(' ')).toMatch(/order-level|order total/i)
  })

  test('allows a multi-item order within all limits', () => {
    const items = [baseItem, baseItem]
    const result = evaluateOrder(items, baseConfig, 4_000_00, 10_000_00)
    expect(result.allowed).toBe(true)
  })
})
