import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { toast } from '../../components/ui/Toast'
import './AIShop.css'

const EXAMPLE_PROMPTS = [
  'Find me a black oversized anime hoodie under ₹1500',
  'I want a Naruto oversized t-shirt',
  'Show me posters between 500 and 1200',
  'Find something for Jujutsu Kaisen fans under 2000'
]

export default function AIShop() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [intent, setIntent] = useState(null)
  const [degraded, setDegraded] = useState(false)
  const [products, setProducts] = useState(null)
  const [correlationId, setCorrelationId] = useState(null)

  // Purchase-proposal / approval flow
  const [proposalFor, setProposalFor] = useState(null) // product being proposed
  const [proposal, setProposal] = useState(null)
  const [step, setStep] = useState('search') // search | proposal | paying

  const [address, setAddress] = useState({ fullName: '', address: '', city: '', state: '', pincode: '', phone: '' })
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)

  const runSearch = async (text) => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/ai/shop', { message: text, previousIntent: intent, correlationId })
      setIntent(data.intent)
      setDegraded(data.degraded)
      setProducts(data.products)
      setCorrelationId(data.correlationId)
    } catch (err) {
      toast(err.response?.data?.message || 'AI search failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => { e.preventDefault(); runSearch(message); setMessage('') }

  const requestProposal = async (product) => {
    setProposalFor(product)
    setStep('proposal')
    setProposal(null)
    try {
      const { data } = await api.post('/ai/purchase-proposal', {
        productId: product.productId, quantity: 1, correlationId
      })
      setProposal(data.proposal)
    } catch (err) {
      toast(err.response?.data?.message || 'Could not build purchase proposal', 'error')
      setStep('search')
    }
  }

  const approveAndPay = async (e) => {
    e.preventDefault()
    if (!address.fullName || !address.address || !address.city || !address.state || !address.pincode || !address.phone) {
      toast('Please fill in your shipping address', 'error'); return
    }
    try {
      const { data } = await api.post('/ai/approve', {
        productId: proposalFor.productId, quantity: 1, shippingAddress: address,
        paymentMethod: 'simulation', correlationId
      })
      setOrder(data.order)
      setPayment(data.payment)
      setStep('paying')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not place order', 'error')
    }
  }

  const handleOutcome = async (outcome) => {
    try {
      const { data } = await api.post(`/orders/${order._id}/verify-payment`, { outcome })
      if (data.order.status === 'paid') {
        toast('Payment successful!', 'success')
        navigate('/orders')
      } else {
        toast('Simulated payment failed — order saved as Payment Failed', 'error')
        navigate('/orders')
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Verification failed', 'error')
    }
  }

  return (
    <div className="aishop-page page-enter">
      <div className="container">
        <div className="aishop-header">
          <span className="aishop-badge">INDIANIME AI</span>
          <h1 className="display" style={{ fontSize: 40 }}>FIND YOUR FIT</h1>
          <p style={{ color: 'var(--text-muted)' }}>Describe what you're looking for — real catalog matches, policy-checked before anything is charged.</p>
        </div>

        {step === 'search' && (
          <>
            <form onSubmit={handleSubmit} className="aishop-searchbar">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. Find me a black oversized anime hoodie under ₹1500"
              />
              <button className="btn-primary" disabled={loading}>{loading ? '...' : 'Ask'}</button>
            </form>

            {!products && (
              <div className="aishop-examples">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button key={p} className="aishop-chip" onClick={() => { setMessage(p); runSearch(p) }}>{p}</button>
                ))}
              </div>
            )}

            {degraded && (
              <p className="aishop-degraded">AI provider unavailable — showing results from the deterministic fallback parser.</p>
            )}

            {products && (
              <div className="aishop-results">
                {products.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No matches in stock right now — try adjusting your request.</p>}
                {products.map((p) => (
                  <div key={p.productId} className="aishop-card">
                    <img src={p.images?.[0]} alt={p.name} />
                    <div className="aishop-card__body">
                      <h3>{p.name}</h3>
                      <p className="mono">₹{p.price}</p>
                      <p className="aishop-reason">{p.matchReason}</p>
                      <button className="btn-primary" onClick={() => requestProposal(p)}>Add to Purchase</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {step === 'proposal' && (
          <div className="aishop-proposal">
            <h2 className="display" style={{ fontSize: 26 }}>AI PURCHASE PROPOSAL</h2>
            {!proposal ? <p>Evaluating…</p> : (
              <>
                <div className="aishop-proposal__summary">
                  <h3>{proposalFor.name}</h3>
                  {proposal.items.map((i, idx) => (
                    <div key={idx} className="checkout-summary__row">
                      <span>{i.name} × {i.quantity}</span><span className="mono">₹{i.price * i.quantity}</span>
                    </div>
                  ))}
                  <div className="checkout-summary__row"><span>Shipping</span><span className="mono">{proposal.shippingPrice === 0 ? 'FREE' : `₹${proposal.shippingPrice}`}</span></div>
                  <div className="checkout-summary__row checkout-summary__total"><span>Total</span><span className="mono">₹{proposal.total}</span></div>
                </div>

                <ul className="aishop-policy-checklist">
                  {proposal.policy.checks
                    .filter((c) => !c.includes('confirmation')) // that one check is expected to read ✗ on a preview — see backend comment
                    .map((c, idx) => (
                      <li key={idx} className={c.startsWith('✓') ? 'ok' : 'fail'}>{c}</li>
                    ))}
                </ul>
                {proposal.policy.reasons.filter(r => !/confirmation/i.test(r)).length > 0 && (
                  <p className="checkout-error">{proposal.policy.reasons.filter(r => !/confirmation/i.test(r)).join(' ')}</p>
                )}

                <form onSubmit={approveAndPay} className="checkout-form" style={{ marginTop: 20 }}>
                  <label>Full Name<input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} required /></label>
                  <label>Address<input value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} required /></label>
                  <div className="checkout-form__row">
                    <label>City<input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required /></label>
                    <label>State<input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required /></label>
                    <label>Pincode<input value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} required /></label>
                  </div>
                  <label>Phone<input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} required /></label>

                  <div className="aishop-proposal__actions">
                    <button type="submit" className="btn-primary">APPROVE &amp; PAY</button>
                    <button type="button" className="btn-ghost" onClick={() => setStep('search')}>CANCEL</button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {step === 'paying' && payment && (
          <div className="aishop-proposal">
            <h2 className="display" style={{ fontSize: 26 }}>CONFIRM PAYMENT</h2>
            <p style={{ color: 'var(--text-muted)' }}>{payment.message || `Provider: ${payment.mode}`}</p>
            {payment.mode === 'simulation' ? (
              <div className="checkout-sim-buttons">
                <button className="btn-primary" onClick={() => handleOutcome('success')}>Simulate Successful Payment</button>
                <button className="btn-ghost" onClick={() => handleOutcome('failure')}>Simulate Failed Payment</button>
              </div>
            ) : (
              <p>Real gateway checkout ({payment.mode}) would open here.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
