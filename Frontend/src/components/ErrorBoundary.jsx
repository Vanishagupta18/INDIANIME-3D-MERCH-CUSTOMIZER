import { Component } from 'react'

/**
 * Secondary safety net — NOT a substitute for fixing root causes.
 *
 * The AIShop blank-screen bug was a real response-shape mismatch
 * (backend returned `policy` as a sibling of `proposal`; the frontend only
 * stored `data.proposal`, dropping it) and was fixed at the source in
 * aiController.js. This boundary exists so that IF an unexpected render
 * error still happens in the future — a genuinely unanticipated one, not
 * this one — the user sees a recoverable message instead of a silent blank
 * page with nothing but a console error.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught a render error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-primary, #f5f5f5)' }}>
          <h2 className="display" style={{ fontSize: 28, marginBottom: 12 }}>SOMETHING WENT WRONG</h2>
          <p style={{ color: 'var(--text-muted, #666)', marginBottom: 20 }}>
            This section hit an unexpected error. The rest of the site is unaffected.
          </p>
          <button className="btn-primary" onClick={() => this.setState({ hasError: false })}>
            Try Again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}