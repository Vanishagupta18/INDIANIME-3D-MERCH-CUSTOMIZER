import { computeOrderTotals, FREE_SHIPPING_THRESHOLD_PAISE, FLAT_SHIPPING_PAISE } from '../services/pricing.js'

function productsMap(list) {
  return new Map(list.map((p) => [String(p._id), p]))
}

const tshirt = { _id: 'p1', name: 'Naruto Tee', price: 799, images: ['tee.jpg'], category: 'tshirt', stock: 10 }
const hoodie = { _id: 'p2', name: 'AOT Hoodie', price: 1899, images: ['hoodie.jpg'], category: 'hoodie', stock: 5 }

describe('computeOrderTotals', () => {
  test('computes totals from the database record, ignoring any client-supplied price', () => {
    const requested = [{ productId: 'p1', quantity: 2, size: 'M' }]
    // Note: no price field on the request at all — this is the point.
    const result = computeOrderTotals(requested, productsMap([tshirt]))
    expect(result.itemsPricePaise).toBe(799 * 100 * 2)
    expect(result.verifiedItems[0].price).toBe(799)
  })

  test('a request claiming a different price for the same product has zero effect on the total', () => {
    const tamperedRequest = [{ productId: 'p1', quantity: 1, size: 'M', price: 1 }] // attacker tries price: ₹1
    const result = computeOrderTotals(tamperedRequest, productsMap([tshirt]))
    expect(result.itemsPricePaise).toBe(799 * 100) // real price used, not ₹1
  })

  test('sums multiple line items correctly', () => {
    const requested = [
      { productId: 'p1', quantity: 2, size: 'M' },
      { productId: 'p2', quantity: 1, size: 'L' }
    ]
    const result = computeOrderTotals(requested, productsMap([tshirt, hoodie]))
    const expectedItemsPaise = 799 * 100 * 2 + 1899 * 100
    expect(result.itemsPricePaise).toBe(expectedItemsPaise)
  })

  test('applies flat shipping below the free-shipping threshold', () => {
    const requested = [{ productId: 'p1', quantity: 1, size: 'M' }]
    const result = computeOrderTotals(requested, productsMap([tshirt]))
    expect(result.itemsPricePaise).toBeLessThan(FREE_SHIPPING_THRESHOLD_PAISE)
    expect(result.shippingPricePaise).toBe(FLAT_SHIPPING_PAISE)
    expect(result.totalPricePaise).toBe(result.itemsPricePaise + FLAT_SHIPPING_PAISE)
  })

  test('waives shipping at/above the free-shipping threshold', () => {
    const requested = [{ productId: 'p2', quantity: 1, size: 'L' }] // ₹1,899 > ₹1,500 threshold
    const result = computeOrderTotals(requested, productsMap([hoodie]))
    expect(result.shippingPricePaise).toBe(0)
  })

  test('throws on an unknown product id instead of silently skipping it', () => {
    const requested = [{ productId: 'does-not-exist', quantity: 1 }]
    expect(() => computeOrderTotals(requested, productsMap([tshirt]))).toThrow(/not found/i)
  })

  test('throws on a zero, negative, or fractional quantity', () => {
    expect(() => computeOrderTotals([{ productId: 'p1', quantity: 0 }], productsMap([tshirt]))).toThrow()
    expect(() => computeOrderTotals([{ productId: 'p1', quantity: -1 }], productsMap([tshirt]))).toThrow()
    expect(() => computeOrderTotals([{ productId: 'p1', quantity: 1.5 }], productsMap([tshirt]))).toThrow()
  })

  test('throws on an empty item list', () => {
    expect(() => computeOrderTotals([], productsMap([tshirt]))).toThrow(/no order items/i)
  })

  test('prices a custom-garment item from its validated config, ignoring any client price', () => {
    const requested = [{
      isCustom: true,
      quantity: 1,
      customConfig: { fabric: 'cotton', printSide: 'front', size: 'M', color: '#111111', designCount: 1, price: 1 }
    }]
    const result = computeOrderTotals(requested, productsMap([]))
    expect(result.verifiedItems[0].price).toBe(499) // base price in rupees, client's price:1 ignored
    expect(result.verifiedItems[0].isCustom).toBe(true)
  })

  test('mixes catalog and custom items in the same order correctly', () => {
    const requested = [
      { productId: 'p1', quantity: 1 },
      { isCustom: true, quantity: 1, customConfig: { fabric: 'cotton', printSide: 'front', size: 'M', color: '#111111', designCount: 0 } }
    ]
    const result = computeOrderTotals(requested, productsMap([tshirt]))
    expect(result.itemsPricePaise).toBe(799 * 100 + 499 * 100)
  })

  test('rejects an invalid custom configuration the same way an invalid product id is rejected', () => {
    const requested = [{ isCustom: true, quantity: 1, customConfig: { fabric: 'unobtainium', printSide: 'front', size: 'M' } }]
    expect(() => computeOrderTotals(requested, productsMap([]))).toThrow(/invalid fabric/i)
  })
})
