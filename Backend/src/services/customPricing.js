/**
 * Authoritative pricing/validation for custom (3D-customizer) garments.
 *
 * The frontend customizer (Customize.jsx) shows these same option names and
 * price adjustments for UX purposes, but that copy is for display only — the
 * numbers here are what actually get charged. A client can send any
 * customConfig it wants; anything not matching these option sets is rejected.
 *
 * Scope note: this validates and prices the *configuration* (fabric, print
 * side, size, color, how many design layers). It intentionally does not
 * re-transmit or persist the actual artwork/text pixel data as part of the
 * order — that's a separate "design persistence" feature (the original
 * project review flagged this as incomplete) and is out of scope here.
 * `designCount` is stored on the order as a record of complexity, not as a
 * reconstructable design.
 */

export const CUSTOM_BASE_PRICE_PAISE = 499_00

export const CUSTOM_FABRIC_OPTIONS = {
  cotton: { name: '100% Cotton', priceAdjPaise: 0 },
  polyester: { name: '100% Polyester', priceAdjPaise: 50_00 },
  'cotton-poly': { name: 'Cotton-Poly Blend', priceAdjPaise: 30_00 },
  organic: { name: 'Organic Cotton', priceAdjPaise: 80_00 }
}

// Keys matched to the actual Customize.jsx `printSide` state values (default 'front').
export const CUSTOM_PRINT_SIDE_OPTIONS = {
  front: { priceAdjPaise: 0 },
  both: { priceAdjPaise: 100_00 }
}

export const CUSTOM_SIZES = ['S', 'M', 'L', 'XL', 'XXL']
export const CUSTOM_MAX_DESIGN_LAYERS = 6
const HEX_COLOR_RE = /^#?[0-9a-fA-F]{6}$/

/**
 * @param {{fabric: string, printSide: string, size: string, color: string, designCount: number}} customConfig
 * @returns {{unitPricePaise: number, sanitizedConfig: object, name: string}}
 */
export function computeCustomItemPrice(customConfig) {
  if (!customConfig || typeof customConfig !== 'object') {
    const err = new Error('Missing customization configuration')
    err.statusCode = 400
    throw err
  }
  const { fabric, printSide, size, color, designCount } = customConfig

  const fabricOption = CUSTOM_FABRIC_OPTIONS[fabric]
  if (!fabricOption) {
    const err = new Error(`Invalid fabric option '${fabric}'`)
    err.statusCode = 400
    throw err
  }

  const printSideOption = CUSTOM_PRINT_SIDE_OPTIONS[printSide]
  if (!printSideOption) {
    const err = new Error(`Invalid print side option '${printSide}'`)
    err.statusCode = 400
    throw err
  }

  if (!CUSTOM_SIZES.includes(size)) {
    const err = new Error(`Invalid size '${size}'`)
    err.statusCode = 400
    throw err
  }

  if (color && !HEX_COLOR_RE.test(color)) {
    const err = new Error('Invalid color format')
    err.statusCode = 400
    throw err
  }

  const safeDesignCount = Number.isInteger(designCount) ? Math.max(0, Math.min(designCount, CUSTOM_MAX_DESIGN_LAYERS)) : 0

  const unitPricePaise = CUSTOM_BASE_PRICE_PAISE + fabricOption.priceAdjPaise + printSideOption.priceAdjPaise

  return {
    unitPricePaise,
    sanitizedConfig: { fabric, printSide, size, color: color || null, designCount: safeDesignCount },
    name: `Custom T-Shirt (${size}, ${fabricOption.name})`
  }
}
