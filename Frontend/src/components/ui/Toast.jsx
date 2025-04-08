import { useState, useCallback } from 'react'

let toastFn = null

export function Toast() {
  const [toasts, setToasts] = useState([])

  toastFn = useCallback((message, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, message, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])

  const icons = { success: 'fa-check', error: 'fa-xmark', info: 'fa-circle-info', warning: 'fa-triangle-exclamation' }
  const colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb', warning: '#d97706' }

  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28,
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--black-2)', border: '1px solid var(--border)',
          borderLeft: `3px solid ${colors[t.type] || colors.success}`,
          padding: '12px 16px', minWidth: 280, maxWidth: 360,
          animation: 'slideUp 0.2s ease',
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          <i className={`fa-solid ${icons[t.type] || icons.success}`}
            style={{ color: colors[t.type] || colors.success, fontSize: 14, flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-primary)', flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

export const toast = (message, type) => { if (toastFn) toastFn(message, type) }
export default Toast