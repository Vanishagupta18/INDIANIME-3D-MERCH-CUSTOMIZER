import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute() {
  const { isAuth, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return isAuth
    ? <Outlet />
    : <Navigate to="/login" state={{ from: location }} replace />
}