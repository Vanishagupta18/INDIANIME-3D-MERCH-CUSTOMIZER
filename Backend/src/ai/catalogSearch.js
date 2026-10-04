import Product from '../models/Product.js'

/**
 * Builds and runs a MongoDB query from validated intent. This is the only
 * place product data enters the AI shopping flow — candidates always come
 * from the real `products` collection, with real prices and real stock
 * counts, never from the AI's own output.
 *
 * Known limitation (documented honestly rather than faked): the Product
 * schema has no structured `color` or `style`/`fit` field, only
 * name/description/tags as free text. So color and style are matched with
 * a best-effort regex across name/description/tags, not a precise
 * attribute filter — less accurate than a real color field would be, but
 * it doesn't fabricate structure the schema doesn't have.
 *
 * @param {ReturnType<import('./intentSchema.js').validateIntent>} intent
 * @returns {Promise<Array>} up to 20 candidate products (lean, real DB documents)
 */
export async function searchCatalog(intent) {
  const query = { stock: { $gt: 0 } } // never recommend something that can't actually be bought

  if (intent.category) query.category = intent.category
  if (intent.anime) query.anime = { $regex: intent.anime, $options: 'i' }

  if (intent.maxPrice != null || intent.minPrice != null) {
    query.price = {}
    if (intent.maxPrice != null) query.price.$lte = intent.maxPrice
    if (intent.minPrice != null) query.price.$gte = intent.minPrice
  }

  const keywordParts = [intent.color, intent.style].filter(Boolean)
  if (keywordParts.length > 0) {
    query.$or = keywordParts.map((word) => ({
      $or: [
        { name: { $regex: word, $options: 'i' } },
        { description: { $regex: word, $options: 'i' } },
        { tags: { $regex: word, $options: 'i' } }
      ]
    }))
  }

  const candidates = await Product.find(query).limit(20).lean()

  // If the keyword filter was too strict and returned nothing, retry
  // without it rather than showing a dead end — category/price/anime are
  // the fields we're actually confident about.
  if (candidates.length === 0 && query.$or) {
    const { $or, ...looserQuery } = query
    return Product.find(looserQuery).limit(20).lean()
  }

  return candidates
}
