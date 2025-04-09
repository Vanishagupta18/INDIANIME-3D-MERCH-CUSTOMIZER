import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from '../../components/ui/Toast'
import '../Login/Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault(); setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast('Welcome to INDIANIME! 🎉', 'success')
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-card">
        <div className="auth-brand">
          <img src="/LOGO/INDIANIME.png" alt="INDIANIME" height="32" />
        </div>
        <h1 className="display auth-title">JOIN US</h1>
        <p className="auth-sub">Create your INDIANIME account.</p>

        {error && <div className="auth-error"><i className="fa-solid fa-circle-exclamation" /> {error}</div>}

        <form onSubmit={onSubmit} className="auth-form">
          <div className="field">
            <label className="field-label">Full Name</label>
            <input name="name" type="text" value={form.name}
              onChange={onChange} placeholder="Vanisha Gupta"
              className="form-input" required />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input name="email" type="email" value={form.email}
              onChange={onChange} placeholder="you@example.com"
              className="form-input" required />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input name="password" type="password" value={form.password}
              onChange={onChange} placeholder="Min 6 characters"
              className="form-input" required />
          </div>
          <div className="field">
            <label className="field-label">Confirm Password</label>
            <input name="confirm" type="password" value={form.confirm}
              onChange={onChange} placeholder="Repeat password"
              className="form-input" required />
          </div>
          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : <>Create Account <i className="fa-solid fa-arrow-right" /></>}
          </button>
        </form>

        <p className="auth-switch">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="auth-visual__overlay" />
        <img src="/images/Warrior_of_Liberation_2_f141b788-07bd-47ca-9f75-24a31cc1c20b.png" alt="" />
        <div className="auth-visual__text">
          <p className="display" style={{ fontSize: 48, color: '#fff', lineHeight: 1 }}>
            JOIN THE<br /><span style={{ color: 'var(--red)' }}>COMMUNITY</span>
          </p>
        </div>
      </div>
    </div>
  )
}