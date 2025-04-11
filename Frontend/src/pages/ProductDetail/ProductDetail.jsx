import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/ui/Toast'
import './ProductDetail.css'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuth } = useAuth()

  const [product, setProduct]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [activeImg, setActiveImg]   = useState(0)
  const [size, setSize]             = useState('M')
  const [qty, setQty]               = useState(1)
  const [review, setReview]         = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/products/${id}`)
      .then(r => { setProduct(r.data.product); setSize(r.data.product.sizes?.[0] || 'M') })
      .catch(() => toast('Product not found', 'error'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAdd = () => {
    addToCart(product, size, qty)
    toast(`${product.name} added to cart`, 'success')
  }

  const handleBuyNow = () => {
    if (!isAuth) { navigate('/login'); return }
    handleAdd(); navigate('/cart')
  }

  const handleReview = async e => {
    e.preventDefault()
    if (!isAuth) { navigate('/login'); return }
    setSubmitting(true)
    try {
      await api.post(`/products/${id}/reviews`, review)
      toast('Review submitted!', 'success')
      const r = await api.get(`/products/${id}`)
      setProduct(r.data.product)
      setReview({ rating: 5, comment: '' })
    } catch (err) {
      toast(err.response?.data?.message || 'Could not submit review', 'error')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  if (!product) return (
    <div className="pd-empty">
      <h2>Product not found</h2>
      <button onClick={() => navigate('/products')} className="btn-primary" style={{ marginTop: 20 }}>
        Back to Products
      </button>
    </div>
  )

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null

  return (
    <div className="pd-page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="pd-breadcrumb">
          <span onClick={() => navigate('/')}>Home</span>
          <span className="pd-sep">/</span>
          <span onClick={() => navigate('/products')}>Products</span>
          <span className="pd-sep">/</span>
          <span style={{ color: 'var(--text-muted)' }}>{product.name}</span>
        </nav>

        <div className="pd-layout">
          {/* Images */}
          <div className="pd-images">
            <div className="pd-main-img">
              <img src={product.images?.[activeImg]} alt={product.name} />
              {discount && <span className="pd-discount-tag badge-red">-{discount}%</span>}
            </div>
            {product.images?.length > 1 && (
              <div className="pd-thumbs">
                {product.images.map((img, i) => (
                  <button key={i}
                    className={`pd-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}>
                    <img src={img} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <p className="pd-series">{product.anime?.replace(/-/g,' ').toUpperCase()}</p>
            <h1 className="pd-name">{product.name}</h1>

            <div className="pd-rating">
              {[...Array(5)].map((_, i) => (
                <i key={i} className={i < Math.round(product.rating) ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
              ))}
              <span className="pd-rating-count">({product.numReviews} reviews)</span>
            </div>

            <div className="pd-price-row">
              <span className="pd-price">₹{product.price}</span>
              {product.originalPrice && <span className="pd-orig">₹{product.originalPrice}</span>}
              {discount && <span className="badge-red">{discount}% OFF</span>}
            </div>

            <div className="divider" style={{ margin: '24px 0' }} />

            <p className="pd-desc">{product.description}</p>

            {/* Size */}
            <div className="pd-section">
              <p className="field-label">Size — <span style={{ color: 'var(--text-primary)', textTransform:'none' }}>{size}</span></p>
              <div className="pd-sizes">
                {(product.sizes || ['XS','S','M','L','XL','XXL']).map(s => (
                  <button key={s}
                    className={`pd-size-btn ${size === s ? 'active' : ''}`}
                    onClick={() => setSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="pd-section">
              <p className="field-label">Quantity</p>
              <div className="pd-qty">
                <button onClick={() => setQty(q => Math.max(1, q-1))}>−</button>
                <span className="mono">{qty}</span>
                <button onClick={() => setQty(q => q+1)}>+</button>
              </div>
            </div>

            <p className={`pd-stock ${product.stock > 0 ? 'in' : 'out'}`}>
              {product.stock > 0
                ? <><i className="fa-solid fa-circle-check" /> In stock ({product.stock} left)</>
                : <><i className="fa-solid fa-circle-xmark" /> Out of stock</>}
            </p>

            <div className="pd-actions">
              <button className="btn-outline pd-action-btn" onClick={handleAdd} disabled={product.stock === 0}>
                <i className="fa-solid fa-bag-shopping" /> Add to Cart
              </button>
              <button className="btn-primary pd-action-btn" onClick={handleBuyNow} disabled={product.stock === 0}>
                Buy Now <i className="fa-solid fa-arrow-right" />
              </button>
            </div>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="pd-tags">
                {product.tags.map(t => (
                  <span key={t} className="pd-tag">#{t}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="pd-reviews">
          <div className="divider" style={{ marginBottom: 48 }} />
          <h2 className="display pd-reviews-title">REVIEWS ({product.numReviews})</h2>

          {product.reviews?.length === 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>
              No reviews yet. Be the first to share your experience!
            </p>
          )}

          <div className="pd-reviews-list">
            {product.reviews?.map((r, i) => (
              <div key={i} className="pd-review-card">
                <div className="pd-review-header">
                  <div className="pd-review-avatar">{r.name?.charAt(0)}</div>
                  <div>
                    <p className="pd-review-name">{r.name}</p>
                    <div className="pd-review-stars">
                      {[...Array(5)].map((_, j) => (
                        <i key={j} className={j < r.rating ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="pd-review-comment">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Write review */}
          <div className="pd-write-review">
            <h3 className="display" style={{ fontSize: 24, marginBottom: 24 }}>WRITE A REVIEW</h3>
            {!isAuth ? (
              <p style={{ color: 'var(--text-muted)' }}>
                <span onClick={() => navigate('/login')} style={{ color: 'var(--red)', cursor:'pointer', fontWeight:600 }}>
                  Sign in
                </span> to write a review.
              </p>
            ) : (
              <form onSubmit={handleReview} className="pd-review-form">
                <div className="field">
                  <label className="field-label">Your Rating</label>
                  <select value={review.rating}
                    onChange={e => setReview(r => ({ ...r, rating: Number(e.target.value) }))}
                    className="form-input" style={{ maxWidth: 200 }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's':''}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label className="field-label">Your Review</label>
                  <textarea value={review.comment}
                    onChange={e => setReview(r => ({ ...r, comment: e.target.value }))}
                    placeholder="Share your experience with this product..."
                    className="form-input" rows={4} required
                    style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : <>Submit Review <i className="fa-solid fa-paper-plane" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}