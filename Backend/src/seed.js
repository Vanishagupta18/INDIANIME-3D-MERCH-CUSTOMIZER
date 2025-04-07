import 'dotenv/config'
import mongoose from 'mongoose'
import Product from './models/Product.js'

const products = [
  // ONE PIECE
  {
    name: 'LUFFY Gear 5 T-Shirt',
    description: 'Premium quality 100% cotton tee featuring Luffy in his iconic Gear 5 transformation. Vibrant print, regular fit for everyday wear.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'one-piece',
    images: ['/images/gear3.jpeg', '/images/gear2.jpeg'],
    sizes: ['S','M','L','XL','XXL'], stock: 50,
    rating: 4, numReviews: 12, isFeatured: true,
    tags: ['luffy','gear5','one-piece']
  },
  {
    name: 'ZORO King of Hell T-Shirt',
    description: 'Zoro in his King of Hell form. Acid-wash finish with premium print. A must-have for every One Piece fan.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'one-piece',
    images: ['/images/zoro3.jpeg', '/images/zoro2.jpeg'],
    sizes: ['S','M','L','XL','XXL'], stock: 40,
    rating: 4, numReviews: 8, isFeatured: true,
    tags: ['zoro','one-piece','king-of-hell']
  },
  {
    name: 'MY HERO ACADEMIA Izuku Black Hoodie',
    description: 'Premium hoodie featuring Izuku Midoriya. Soft fleece lining, kangaroo pocket, adjustable drawstrings.',
    price: 4999, originalPrice: 5999,
    category: 'hoodie', anime: 'my-hero-academia',
    images: ['/images/68061211_0 (1).jpg', '/images/68061211_0.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 30,
    rating: 4, numReviews: 6,
    tags: ['deku','mha','hoodie']
  },
  {
    name: 'NARUTO SHIPPUDEN Madara Uchiha Hoodie',
    description: 'Bold Madara Uchiha graphic on premium black hoodie. Fade-resistant print, comfortable everyday fit.',
    price: 7999, originalPrice: 9999,
    category: 'hoodie', anime: 'naruto',
    images: ['/images/59645499_0.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 20,
    rating: 4, numReviews: 10,
    tags: ['madara','naruto','hoodie']
  },
  {
    name: 'DRAGON BALL Goku Grey Hoodie',
    description: 'Goku Super Saiyan graphic on ash grey hoodie. Ribbed cuffs and hem, premium quality fleece.',
    price: 3999, originalPrice: 4999,
    category: 'hoodie', anime: 'dragon-ball',
    images: ['/images/26518150_0.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 35,
    rating: 4, numReviews: 7,
    tags: ['goku','dragon-ball','hoodie']
  },
  // JUJUTSU KAISEN
  {
    name: 'MAHORAGA FUSHIGURO T-Shirt',
    description: 'Mahoraga Divine General Fushiguro on premium black tee. High-definition graphic, breathable cotton.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'jujutsu-kaisen',
    images: ['/images/mahagora3.jpeg', '/images/mahagora1.jpeg'],
    sizes: ['S','M','L','XL','XXL'], stock: 45,
    rating: 5, numReviews: 20, isFeatured: true,
    tags: ['mahoraga','jjk','fushiguro']
  },
  {
    name: 'JUJUTSU KAISEN Characters T-Shirt',
    description: 'All main JJK characters in one epic print. Premium 100% cotton, regular unisex fit.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'jujutsu-kaisen',
    images: ['/images/62607717_0 (2).jpg', '/images/62607717_0.jpg'],
    sizes: ['XS','S','M','L','XL','XXL'], stock: 60,
    rating: 4, numReviews: 15,
    tags: ['jjk','gojo','itadori']
  },
  // NARUTO
  {
    name: 'NARUTO Baryon Mode T-Shirt',
    description: 'Naruto in powerful Baryon Mode on premium red tee. Vibrant colors, fade-resistant printing.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'naruto',
    images: ['/images/baryon3.jpeg', '/images/baryon4.jpeg'],
    sizes: ['S','M','L','XL','XXL'], stock: 55,
    rating: 4, numReviews: 15, isFeatured: true,
    tags: ['naruto','baryon-mode','kurama']
  },
  {
    name: 'NARUTO Kakashi Acid-Wash Tee',
    description: 'Kakashi Hatake with Sharingan on premium acid-wash black tee. Unique vintage finish.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'naruto',
    images: ['/images/1733491332_5188276.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 40,
    rating: 5, numReviews: 18,
    tags: ['kakashi','naruto','sharingan']
  },
  // DEATHNOTE
  {
    name: 'DEATHNOTE L T-Shirt',
    description: 'L Lawliet iconic pose on premium black tee. High quality screen print, regular fit.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'deathnote',
    images: ['/images/67681908_0 (1).jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 35,
    rating: 4, numReviews: 9,
    tags: ['L','deathnote','light']
  },
  // DEMON SLAYER
  {
    name: 'DEMON SLAYER Characters T-Shirt',
    description: 'Tanjiro, Nezuko, Zenitsu and Inosuke all together. Premium print, 100% cotton, unisex fit.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'demon-slayer',
    images: ['/images/67641939_0 (1).jpg'],
    sizes: ['XS','S','M','L','XL','XXL'], stock: 50,
    rating: 5, numReviews: 22,
    tags: ['tanjiro','nezuko','demon-slayer']
  },
  // ATTACK ON TITAN
  {
    name: 'ATTACK ON TITAN Survey Corps Hoodie',
    description: 'Wings of Freedom Survey Corps emblem on premium hoodie. Heavyweight fleece, drawstring hood.',
    price: 4999, originalPrice: 5999,
    category: 'hoodie', anime: 'attack-on-titan',
    images: ['/images/69124830_0 (1).jpg', '/images/69124830_0.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 25,
    rating: 4, numReviews: 11,
    tags: ['aot','eren','survey-corps']
  },
  {
    name: 'ATTACK ON TITAN Eren T-Shirt',
    description: 'Eren Yeager founding titan form on premium black tee. Bold graphic, regular fit for fans.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'attack-on-titan',
    images: ['/images/67385860_0 (1).jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 40,
    rating: 4, numReviews: 14,
    tags: ['eren','aot','founding-titan']
  },
  // MORE PRODUCTS
  {
    name: 'FULLMETAL ALCHEMIST T-Shirt',
    description: 'Edward Elric transmutation circle on premium black tee. Iconic FMA design, premium cotton.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'fullmetal-alchemist',
    images: ['/images/67040433_0.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 30,
    rating: 4, numReviews: 8,
    tags: ['fma','edward','alphonse']
  },
  {
    name: 'ONE PIECE Pirates Hoodie',
    description: 'Straw Hat Pirates jolly roger on premium acid-wash brown hoodie. Vintage distressed finish.',
    price: 4999, originalPrice: 5999,
    category: 'hoodie', anime: 'one-piece',
    images: ['/images/1734158281_8025971.jpg'],
    sizes: ['S','M','L','XL','XXL'], stock: 20,
    rating: 4, numReviews: 9,
    tags: ['luffy','one-piece','pirates']
  },
  {
    name: 'NARUTO Group T-Shirt',
    description: 'Naruto, Sasuke and Sakura iconic team 7 print. Premium cotton, vibrant colors.',
    price: 1999, originalPrice: 2499,
    category: 'tshirt', anime: 'naruto',
    images: ['/images/Naruto_Group_Stacked_Eyes_T-Shirt-removebg-preview.png'],
    sizes: ['S','M','L','XL','XXL'], stock: 45,
    rating: 4, numReviews: 13,
    tags: ['naruto','sasuke','sakura','team7']
  },
]

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('MongoDB connected')

    await Product.deleteMany({})
    console.log('Cleared existing products')

    const inserted = await Product.insertMany(products)
    console.log(`✅ Seeded ${inserted.length} products successfully!`)

    inserted.forEach(p => console.log(`  - ${p.name} [${p._id}]`))

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seed()