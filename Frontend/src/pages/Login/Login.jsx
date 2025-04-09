import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/ui/Toast'
import './Auth.css'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await login(form.email, form.password)
      toast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/LOGO/INDIANIME.png" alt="INDIANIME" height="32" />
        </div>
        <h1 className="display auth-title">SIGN IN</h1>
        <p className="auth-sub">Welcome back, fan.</p>

        {error && <div className="auth-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input name="email" type="email" value={form.email}
              onChange={onChange} placeholder="you@example.com"
              className="form-input" required />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input name="password" type="password" value={form.password}
              onChange={onChange} placeholder="••••••••"
              className="form-input" required />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : <>Sign In <i className="fa-solid fa-arrow-right" /></>}
          </button>
        </form>

        <p className="auth-switch">
          New to INDIANIME? <Link to="/register">Create account</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="auth-visual__overlay" />
        <img src="/images/Warrior_of_Liberation_1_6780b2db-94ad-4440-8cf0-e034831d984b.png" alt="" />
        <div className="auth-visual__text">
          <p className="display" style={{ fontSize: 48, color: '#fff', lineHeight: 1 }}>
            WEAR YOUR<br /><span style={{ color: 'var(--red)' }}>FANDOM</span>
          </p>
        </div>
      </div>
    </div>
  )
}