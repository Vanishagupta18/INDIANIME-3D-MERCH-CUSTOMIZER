import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import { toast } from '../../components/ui/Toast'
import './Profile.css'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: user?.name || '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    if (form.password && form.password !== form.confirm) {
      toast('Passwords do not match', 'error'); return
    }
    setLoading(true)
    try {
      const payload = { name: form.name }
      if (form.password) payload.password = form.password
      await api.put('/auth/profile', payload)
      toast('Profile updated!', 'success')
      setForm(f => ({ ...f, password: '', confirm: '' }))
    } catch (err) {
      toast(err.response?.data?.message || 'Update failed', 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="profile-page page-enter">
      <div className="container">
        <div style={{ marginBottom:40 }}>
          <p className="section-label"><span className="red-line" /> Account</p>
          <h1 className="display" style={{ fontSize:'clamp(32px,5vw,56px)', color:'var(--text-primary)' }}>
            MY PROFILE
          </h1>
        </div>

        <div className="profile-layout">
          {/* Sidebar card */}
          <div className="profile-card">
            <div className="profile-avatar display">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="profile-name">{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <span className="mono profile-role">{user?.role?.toUpperCase()}</span>

            <div className="profile-nav">
              <button onClick={() => navigate('/orders')} className="profile-nav-btn">
                <i className="fa-solid fa-box" /> My Orders
              </button>
              <button onClick={() => navigate('/cart')} className="profile-nav-btn">
                <i className="fa-solid fa-bag-shopping" /> My Cart
              </button>
              <button onClick={() => navigate('/customize')} className="profile-nav-btn">
                <i className="fa-solid fa-wand-magic-sparkles" /> 3D Customizer
              </button>
              <button onClick={() => { logout(); navigate('/') }} className="profile-nav-btn danger">
                <i className="fa-solid fa-right-from-bracket" /> Sign Out
              </button>
            </div>
          </div>

          {/* Edit form */}
          <div className="profile-form-card">
            <h2 className="display" style={{ fontSize:28, marginBottom:32 }}>EDIT PROFILE</h2>
            <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:24 }}>
              <div className="field">
                <label className="field-label">Full Name</label>
                <input name="name" value={form.name} onChange={onChange}
                  className="form-input" required />
              </div>
              <div className="field">
                <label className="field-label">Email (read-only)</label>
                <input value={user?.email} className="form-input" disabled
                  style={{ opacity:0.5, cursor:'not-allowed' }} />
              </div>

              <div className="divider" />

              <h3 className="display" style={{ fontSize:20 }}>CHANGE PASSWORD</h3>

              <div className="field">
                <label className="field-label">New Password</label>
                <input name="password" type="password" value={form.password}
                  onChange={onChange} placeholder="Leave blank to keep current"
                  className="form-input" />
              </div>
              <div className="field">
                <label className="field-label">Confirm Password</label>
                <input name="confirm" type="password" value={form.confirm}
                  onChange={onChange} placeholder="Repeat new password"
                  className="form-input" />
              </div>

              <div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : <>Save Changes <i className="fa-solid fa-floppy-disk" /></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}