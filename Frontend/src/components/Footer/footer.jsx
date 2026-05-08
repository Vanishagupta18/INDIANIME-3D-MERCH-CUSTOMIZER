import { Link } from 'react-router-dom'
import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <img src="/LOGO/INDIANIME.png" alt="INDIANIME" height="40" />
              <p>Premium anime streetwear, made for India. Wear your fandom with pride.</p>
              <div className="footer-socials">
                <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram" /></a>
                <a href="#" aria-label="Twitter"><i className="fa-brands fa-twitter" /></a>
                <a href="#" aria-label="YouTube"><i className="fa-brands fa-youtube" /></a>
              </div>
            </div>

            <div>
              <h4 className="footer-heading">Shop</h4>
              <ul className="footer-links">
                {['naruto','one-piece','demon-slayer','jujutsu-kaisen','attack-on-titan'].map(a => (
                  <li key={a}>
                    <Link to={`/products?anime=${a}`}>{a.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase())}</Link>
                  </li>
                ))}
                <li><Link to="/customize">Custom Design</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Account</h4>
              <ul className="footer-links">
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/orders">My Orders</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                <li><Link to="/cart">Cart</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-heading">Help</h4>
              <ul className="footer-links">
                <li><a href="#">Size Guide</a></li>
                <li><a href="#">Return Policy</a></li>
                <li><a href="#">Track Order</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p className="footer-copy">© 2025 INDIANIME. All rights reserved. Made with ❤️ in India.</p>
          <div className="footer-badges">
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>SECURE PAYMENTS</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>100% AUTHENTIC</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>FREE RETURNS</span>
          </div>
        </div>
      </div>
    </footer>
  )
}