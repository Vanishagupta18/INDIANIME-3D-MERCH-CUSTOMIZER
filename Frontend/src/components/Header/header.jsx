import { useState, useEffect } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Header.css'

const ANIME_LINKS = [
  { slug: 'naruto',           label: 'Naruto' },
  { slug: 'one-piece',        label: 'One Piece' },
  { slug: 'demon-slayer',     label: 'Demon Slayer' },
  { slug: 'jujutsu-kaisen',   label: 'Jujutsu Kaisen' },
  { slug: 'attack-on-titan',  label: 'Attack on Titan' },
  { slug: 'deathnote',        label: 'Deathnote' },
]

export default function Header() {
  const { isAuth, user, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    setSearchQuery('')
    setSearchOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      {/* Announcement bar */}
      <div className="announce-bar">
        <p>FREE SHIPPING ON ORDERS ABOVE ₹999 &nbsp;·&nbsp; MADE IN INDIA &nbsp;·&nbsp; 100% PREMIUM COTTON</p>
      </div>

      <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-inner">

          {/* Logo */}
          <Link to="/" className="header-logo">
            <img src="/LOGO/INDIANIME.png" alt="INDIANIME" height="36" />
          </Link>

          {/* Desktop nav */}
          <nav className="header-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Home
            </NavLink>

            <div className="nav-dropdown">
              <Link to="/products" className="nav-link">
                Shop <i className="fa-solid fa-chevron-down" style={{ fontSize: 10 }} />
              </Link>
              <div className="dropdown-panel">
                <div className="dropdown-grid">
                  <div>
                    <p className="dropdown-heading">By Series</p>
                    {ANIME_LINKS.map(a => (
                      <Link key={a.slug} to={`/products?anime=${a.slug}`} className="dropdown-item">
                        {a.label}
                      </Link>
                    ))}
                  </div>
                  <div>
                    <p className="dropdown-heading">By Type</p>
                    {['tshirt','hoodie','cap','poster','accessory'].map(c => (
                      <Link key={c} to={`/products?category=${c}`} className="dropdown-item">
                        {c.charAt(0).toUpperCase() + c.slice(1)}s
                      </Link>
                    ))}
                  </div>
                  <div className="dropdown-cta">
                    <Link to="/customize">
                      <p className="dropdown-heading" style={{ color: 'var(--red)' }}>3D Customizer</p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                        Design your own anime tee with live 3D preview
                      </p>
                      <span className="dropdown-cta-btn">Try it free →</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <NavLink to="/customize" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Customize
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="header-actions">
            {/* Search */}
            <button className="icon-btn" onClick={() => setSearchOpen(v => !v)} aria-label="Search">
              <i className="fa-solid fa-magnifying-glass" />
            </button>

            {/* User */}
            <div className="nav-dropdown">
              <button className="icon-btn" aria-label="Account">
                <i className="fa-solid fa-user" />
              </button>
              <div className="dropdown-panel" style={{ right: 0, minWidth: 180 }}>
                {isAuth ? (
                  <>
                    <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Signed in as</p>
                      <p style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginTop: 2 }}>
                        {user?.name}
                      </p>
                    </div>
                    <Link to="/profile" className="dropdown-item">My Profile</Link>
                    <Link to="/orders" className="dropdown-item">My Orders</Link>
                    <button onClick={handleLogout}
                      className="dropdown-item"
                      style={{ width: '100%', textAlign: 'left', color: '#ef4444' }}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item">Sign In</Link>
                    <Link to="/register" className="dropdown-item">Create Account</Link>
                  </>
                )}
              </div>
            </div>

            {/* Cart */}
            <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
              <i className="fa-solid fa-bag-shopping" />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>

            {/* Hamburger */}
            <button className="hamburger-btn" onClick={() => setMobileOpen(v => !v)} aria-label="Menu">
              <i className={`fa-solid ${mobileOpen ? 'fa-xmark' : 'fa-bars'}`} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="search-bar-wrap">
            <form onSubmit={handleSearch} className="search-form">
              <i className="fa-solid fa-magnifying-glass search-icon" />
              <input
                autoFocus
                type="text"
                placeholder="Search anime, products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="button" className="btn-ghost" onClick={() => setSearchOpen(false)}>
                <i className="fa-solid fa-xmark" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="mobile-nav">
            <Link to="/" className="mobile-link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/products" className="mobile-link" onClick={() => setMobileOpen(false)}>All Products</Link>
            {ANIME_LINKS.map(a => (
              <Link key={a.slug} to={`/products?anime=${a.slug}`}
                className="mobile-link mobile-sub"
                onClick={() => setMobileOpen(false)}>
                {a.label}
              </Link>
            ))}
            <Link to="/customize" className="mobile-link" onClick={() => setMobileOpen(false)}>3D Customize</Link>
            <div className="mobile-divider" />
            {isAuth ? (
              <>
                <Link to="/profile" className="mobile-link" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Link to="/orders" className="mobile-link" onClick={() => setMobileOpen(false)}>Orders</Link>
                <button onClick={handleLogout} className="mobile-link" style={{ color: '#ef4444', textAlign: 'left' }}>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
                <Link to="/register" className="mobile-link" onClick={() => setMobileOpen(false)}>Register</Link>
              </>
            )}
          </div>
        )}
      </header>
    </>
  )
}