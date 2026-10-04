import { computeCustomItemPrice, CUSTOM_BASE_PRICE_PAISE } from '../services/customPricing.js'

const validConfig = { fabric: 'cotton', printSide: 'front', size: 'M', color: '#1a1a1a', designCount: 2 }

describe('computeCustomItemPrice', () => {
  test('prices a valid base configuration at the base price', () => {
    const result = computeCustomItemPrice(validConfig)
    expect(result.unitPricePaise).toBe(CUSTOM_BASE_PRICE_PAISE)
  })

  test('adds the fabric surcharge for a premium fabric', () => {
    const result = computeCustomItemPrice({ ...validConfig, fabric: 'organic' })
    expect(result.unitPricePaise).toBe(CUSTOM_BASE_PRICE_PAISE + 80_00)
  })

  test('adds the double-print surcharge', () => {
    const result = computeCustomItemPrice({ ...validConfig, printSide: 'both' })
    expect(result.unitPricePaise).toBe(CUSTOM_BASE_PRICE_PAISE + 100_00)
  })

  test('a client-supplied price field has no effect — there is no price field this function reads', () => {
    const tampered = { ...validConfig, price: 1, unitPricePaise: 1 }
    const result = computeCustomItemPrice(tampered)
    expect(result.unitPricePaise).toBe(CUSTOM_BASE_PRICE_PAISE)
  })

  test('rejects an unknown fabric', () => {
    expect(() => computeCustomItemPrice({ ...validConfig, fabric: 'silk' })).toThrow(/invalid fabric/i)
  })

  test('rejects an unknown print side', () => {
    expect(() => computeCustomItemPrice({ ...validConfig, printSide: 'triple' })).toThrow(/invalid print side/i)
  })

  test('rejects an unsupported size', () => {
    expect(() => computeCustomItemPrice({ ...validConfig, size: 'XXXL' })).toThrow(/invalid size/i)
  })

  test('rejects a malformed color', () => {
    expect(() => computeCustomItemPrice({ ...validConfig, color: 'not-a-color' })).toThrow(/invalid color/i)
  })

  test('clamps an absurd designCount instead of trusting it', () => {
    const result = computeCustomItemPrice({ ...validConfig, designCount: 9999 })
    expect(result.sanitizedConfig.designCount).toBeLessThanOrEqual(6)
  })

  test('rejects a missing configuration object', () => {
    expect(() => computeCustomItemPrice(undefined)).toThrow(/missing customization/i)
  })
})
