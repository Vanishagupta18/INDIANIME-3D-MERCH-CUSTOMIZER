/**
 * Server-authoritative price computation.
 *
 * This is the fix for the #1 critical bug found in the original INDIANIME
 * review: the order controller used to accept itemsPrice/totalPrice
 * straight from the request body. Now the server looks up each product by
 * ID and recomputes everything from the database record — the client's
 * numbers are never trusted, only its list of {productId, quantity, size}
 * (or, for customizer items, {isCustom: true, customConfig, quantity}).
 *
 * All money is handled in integer paise internally to avoid floating-point
 * rounding bugs, and only converted to rupees for display.
 *
 * Single source of truth: FREE_SHIPPING_THRESHOLD_PAISE and
 * FLAT_SHIPPING_PAISE below are the only place shipping rules are defined.
 * The frontend no longer hardcodes its own copy of these numbers — it reads
 * them from GET /api/config/pricing-rules (see routes/configRoutes.js) so a
 * change here can never silently diverge from what the cart/checkout pages
 * display.
 */
import { computeCustomItemPrice } from './customPricing.js'

export const FREE_SHIPPING_THRESHOLD_PAISE = 1_500_00 // ₹1,500
export const FLAT_SHIPPING_PAISE = 99_00 // ₹99

/**
 * @param {Array<{productId?: string, isCustom?: boolean, customConfig?: object, quantity: number, size?: string}>} requestedItems
 * @param {Map<string, {_id: any, name: string, price: number, images: string[], category: string, stock: number}>} productsById
 */
export function computeOrderTotals(requestedItems, productsById) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const err = new Error('No order items')
    err.statusCode = 400
    throw err
  }

  const verifiedItems = requestedItems.map((requested) => {
    const quantity = Number(requested.quantity)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      const err = new Error('Invalid quantity for an order item')
      err.statusCode = 400
      throw err
    }

    if (requested.isCustom) {
      const { unitPricePaise, sanitizedConfig, name } = computeCustomItemPrice(requested.customConfig)
      return {
        productId: null,
        isCustom: true,
        customConfig: sanitizedConfig,
        name,
        image: '',
        price: unitPricePaise / 100,
        unitPricePaise,
        size: sanitizedConfig.size,
        quantity,
        category: 'custom-apparel',
        stock: Infinity // made-to-order — not subject to catalog stock limits
      }
    }

    const product = productsById.get(String(requested.productId))
    if (!product) {
      const err = new Error(`Product ${requested.productId} not found`)
      err.statusCode = 400
      throw err
    }

    const unitPricePaise = Math.round(Number(product.price) * 100)

    return {
      productId: String(product._id),
      isCustom: false,
      name: product.name,
      image: product.images?.[0] || '',
      price: product.price,
      unitPricePaise,
      size: requested.size,
      quantity,
      category: product.category,
      stock: product.stock
    }
  })

  const itemsPricePaise = verifiedItems.reduce(
    (sum, item) => sum + item.unitPricePaise * item.quantity,
    0
  )
  const shippingPricePaise = itemsPricePaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 0 : FLAT_SHIPPING_PAISE
  const totalPricePaise = itemsPricePaise + shippingPricePaise

  return { verifiedItems, itemsPricePaise, shippingPricePaise, totalPricePaise }
}

export const paiseToRupees = (paise) => Math.round(paise) / 100
