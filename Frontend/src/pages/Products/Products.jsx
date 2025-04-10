import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ProductCard from '../../components/ProductCard/ProductCard'
import { ProductGridSkeleton } from '../../components/ui/Skeleton'
import './Products.css'

const ANIME = ['naruto','one-piece','demon-slayer','jujutsu-kaisen','attack-on-titan','deathnote','dragon-ball','my-hero-academia','fullmetal-alchemist']
const CATS  = ['tshirt','hoodie','cap','poster','accessory']
const SORTS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'price-low',  label: 'Price ↑' },
  { value: 'price-high', label: 'Price ↓' },
  { value: 'rating',     label: 'Top Rated' },
]

export default function Products() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })

  const anime    = searchParams.get('anime')    || ''
  const category = searchParams.get('category') || ''
  const search   = searchParams.get('search')   || ''
  const sort     = searchParams.get('sort')     || 'newest'
  const page     = Number(searchParams.get('page')) || 1

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError('')
      try {
        const p = new URLSearchParams()
        if (anime)    p.set('anime', anime)
        if (category) p.set('category', category)
        if (search)   p.set('search', search)
        p.set('sort', sort); p.set('page', page); p.set('limit', 12)
        const res = await api.get(`/products?${p}`)
        setProducts(res.data.products)
        setPagination(res.data.pagination)
      } catch { setError('Failed to load products.') }
      finally { setLoading(false) }
    }
    load()
  }, [anime, category, search, sort, page])

  const set = (key, val) => {
    const n = new URLSearchParams(searchParams)
    val ? n.set(key, val) : n.delete(key)
    n.delete('page')
    setSearchParams(n)
  }

  const title = anime ? anime.replace(/-/g,' ').toUpperCase()
    : search ? `"${search}"`
    : category ? category.toUpperCase() + 'S'
    : 'ALL PRODUCTS'

  return (
    <div className="products-page page-enter">
      {/* Banner */}
      <div className="products-banner">
        <div className="container">
          <p className="section-label"><span className="red-line" />
            {category || anime || search ? 'Collection' : 'Store'}
          </p>
          <h1 className="display products-title">{title}</h1>
          {!loading && (
            <p className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
              {pagination.total} PRODUCTS
            </p>
          )}
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar */}
        <aside className="products-sidebar">
          <div className="filter-block">
            <h4 className="filter-heading">Anime Series</h4>
            {ANIME.map(a => (
              <button key={a}
                className={`filter-pill ${anime === a ? 'active' : ''}`}
                onClick={() => set('anime', anime === a ? '' : a)}>
                {a.replace(/-/g,' ').toUpperCase()}
              </button>
            ))}
          </div>

          <div className="filter-block">
            <h4 className="filter-heading">Category</h4>
            {CATS.map(c => (
              <button key={c}
                className={`filter-pill ${category === c ? 'active' : ''}`}
                onClick={() => set('category', category === c ? '' : c)}>
                {c.charAt(0).toUpperCase() + c.slice(1)}s
              </button>
            ))}
          </div>

          {(anime || category || search) && (
            <button onClick={() => setSearchParams({})} className="clear-filters-btn">
              ✕ Clear all filters
            </button>
          )}
        </aside>

        {/* Main */}
        <div className="products-main">
          {/* Toolbar */}
          <div className="products-toolbar">
            <div className="sort-tabs">
              {SORTS.map(s => (
                <button key={s.value}
                  className={`sort-tab ${sort === s.value ? 'active' : ''}`}
                  onClick={() => set('sort', s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? <ProductGridSkeleton count={12} /> : error ? (
            <div className="products-empty">
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 40, color: 'var(--red)', marginBottom: 16 }} />
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-primary" style={{ marginTop: 16 }}>
                Retry
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="products-empty">
              <i className="fa-solid fa-box-open" style={{ fontSize: 48, color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3>No products found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
                Try adjusting your filters
              </p>
              <button onClick={() => setSearchParams({})} className="btn-outline" style={{ marginTop: 20 }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(p => <ProductCard key={p._id} product={p} />)}
              </div>

              {pagination.pages > 1 && (
                <div className="pagination">
                  <button disabled={page <= 1} onClick={() => set('page', page - 1)} className="page-btn">
                    ← Prev
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button key={i+1}
                      className={`page-btn ${page === i+1 ? 'active' : ''}`}
                      onClick={() => set('page', i+1)}>
                      {i+1}
                    </button>
                  ))}
                  <button disabled={page >= pagination.pages} onClick={() => set('page', page + 1)} className="page-btn">
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}