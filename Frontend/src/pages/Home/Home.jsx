import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Home.css'

const SERIES = [
  { slug: 'naruto',         label: 'Naruto',          img: '/images/1733491332_7660478.jpg' },
  { slug: 'one-piece',      label: 'One Piece',        img: '/images/1734158281_2484950.jpg' },
  { slug: 'jujutsu-kaisen', label: 'Jujutsu Kaisen',  img: '/images/1733540863_3606730.jpg' },
  { slug: 'demon-slayer',   label: 'Demon Slayer',     img: '/images/1733540863_3606730.jpg' },
]

export default function Home() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    api.get('/products?limit=8&sort=rating')
      .then(r => setFeatured(r.data.products))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false))
  }, [])

  return (
    <div className="home page-enter">

      {/* ── HERO ─────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg">
          <div className="hero__noise" />
          <div className="hero__gradient" />
        </div>
        <div className="container hero__inner">
          <div className="hero__text">
            <p className="section-label">
              <span className="red-line" />
              Premium Anime Streetwear
            </p>
            <h1 className="hero__heading display">
              WEAR YOUR<br />
              <span className="hero__heading--accent">ANIME</span><br />
              SPIRIT
            </h1>
            <p className="hero__sub">
              Made for India. Designed for fans. 100% premium cotton drops that hit different.
            </p>
            <div className="hero__actions">
              <button onClick={() => navigate('/products')} className="btn-primary">
                Shop Now <i className="fa-solid fa-arrow-right" />
              </button>
              <button onClick={() => navigate('/customize')} className="btn-outline">
                3D Customize
              </button>
            </div>
            <div className="hero__stats">
              <div><span className="hero__stat-num mono">500+</span><span>Products</span></div>
              <div className="hero__stat-divider" />
              <div><span className="hero__stat-num mono">10K+</span><span>Happy Fans</span></div>
              <div className="hero__stat-divider" />
              <div><span className="hero__stat-num mono">15+</span><span>Anime Series</span></div>
            </div>
          </div>
          <div className="hero__visual">
            <div className="hero__img-ring" />
            <img
              src="/images/Warrior_of_Liberation_1_6780b2db-94ad-4440-8cf0-e034831d984b.png"
              alt="Hero product"
              className="hero__img"
            />
          </div>
        </div>
        <div className="hero__ticker">
          <div className="ticker__inner">
            {['NARUTO','ONE PIECE','DEMON SLAYER','JJK','ATTACK ON TITAN','DEATHNOTE',
              'NARUTO','ONE PIECE','DEMON SLAYER','JJK','ATTACK ON TITAN','DEATHNOTE'].map((s,i)=>(
              <span key={i} className="ticker__item">
                <span className="ticker__dot">◆</span> {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERIES GRID ──────────────────────── */}
      <section className="series-section">
        <div className="container">
          <div className="series-header">
            <p className="section-label"><span className="red-line" /> Shop by Series</p>
            <button onClick={() => navigate('/products')} className="btn-ghost" style={{ fontSize: 13 }}>
              View all <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
          <div className="series-grid">
            {SERIES.map(s => (
              <div key={s.slug} className="series-card" onClick={() => navigate(`/products?anime=${s.slug}`)}>
                <img src={s.img} alt={s.label} loading="lazy" />
                <div className="series-card__overlay">
                  <h3 className="display series-card__label">{s.label.toUpperCase()}</h3>
                  <span className="series-card__cta">Shop Now →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING ─────────────────────────── */}
      <section className="trending-section">
        <div className="container">
          <div className="trending-header">
            <p className="section-label"><span className="red-line" /> Trending Now</p>
            <h2 className="display trending-title">TOP PICKS</h2>
          </div>

          {loadingFeatured ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
              <div className="spinner" />
            </div>
          ) : (
            <div className="trending-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <button onClick={() => navigate('/products')} className="btn-outline">
              View All Products <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      </section>

      {/* ── CUSTOM CTA BAND ──────────────────── */}
      <section className="cta-band">
        <div className="cta-band__bg" />
        <div className="container cta-band__inner">
          <div className="cta-band__img-wrap">
            <img src="/images/black_aa7f3fe8-653a-4112-a1aa-520eef2c7c09.png" alt="Custom" />
          </div>
          <div className="cta-band__content">
            <p className="section-label"><span className="red-line" /> Exclusive Feature</p>
            <h2 className="display cta-band__title">
              DESIGN YOUR OWN<br />
              <span style={{ color: 'var(--red)' }}>CUSTOM</span> T-SHIRT
            </h2>
            <p className="cta-band__desc">
              Upload your art, preview it live on a 3D T-shirt model, pick your color and size — then order. No minimums.
            </p>
            <button onClick={() => navigate('/customize')} className="btn-primary">
              Open 3D Customizer <i className="fa-solid fa-wand-magic-sparkles" />
            </button>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────── */}
      <section className="trust-strip">
        <div className="container">
          <div className="trust-grid">
            {[
              { icon: 'fa-truck-fast',     title: 'Free Shipping', sub: 'On orders above ₹999' },
              { icon: 'fa-rotate-left',    title: 'Easy Returns',  sub: '7-day hassle-free returns' },
              { icon: 'fa-shield-halved',  title: 'Secure Payment', sub: '100% safe & encrypted' },
              { icon: 'fa-tshirt',         title: 'Premium Quality', sub: '100% cotton, pre-shrunk' },
            ].map(t => (
              <div key={t.title} className="trust-item">
                <i className={`fa-solid ${t.icon}`} style={{ fontSize: 24, color: 'var(--red)', marginBottom: 12 }} />
                <h4>{t.title}</h4>
                <p>{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}