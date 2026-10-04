import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { toast } from '../../components/ui/Toast'
import api from '../../api/axios'
import { usePricingRules, computeShipping } from '../../hooks/usePricingRules'
import './Checkout.css'

function estimateTotal(cartItems, rules) {
  const itemsPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const shipping = computeShipping(itemsPrice, rules)
  return { itemsPrice, shipping, total: itemsPrice + shipping }
}

export default function Checkout() {
  const { cartItems, clearCart } = useCart()
  const navigate = useNavigate()
  const rules = usePricingRules()
  const estimate = estimateTotal(cartItems, rules)

  const [address, setAddress] = useState({ fullName: '', address: '', city: '', state: '', pincode: '', phone: '' })
  const [step, setStep] = useState('address') // address | paying | failed
  const [submitting, setSubmitting] = useState(false)
  const [order, setOrder] = useState(null)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')

  // One idempotency key per checkout session — survives re-renders and a
  // double-click, so a network retry can never create two orders.
  const [idempotencyKey] = useState(() => crypto.randomUUID())

  if (cartItems.length === 0 && step === 'address') {
    return (
      <div className="checkout-empty page-enter">
        <h2 className="display">YOUR CART IS EMPTY</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">Shop Now</button>
      </div>
    )
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!address.fullName || !address.address || !address.city || !address.state || !address.pincode || !address.phone) {
      toast('Please fill in your full shipping address', 'error')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const { data } = await api.post('/orders', {
        items: cartItems.map(i => i.isCustom
          ? { isCustom: true, customConfig: i.customConfig, quantity: i.quantity }
          : { productId: i._id, quantity: i.quantity, size: i.size }
        ),
        shippingAddress: address,
        paymentMethod: 'simulation',
        confirmed: true, // explicit user confirmation, checked by the policy engine
        idempotencyKey
      })
      setOrder(data.order)
      setPayment(data.payment)
      setStep('paying')
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not place order'
      setError(msg)
      toast(msg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSimulatedOutcome = async (outcome) => {
    setSubmitting(true)
    try {
      const { data } = await api.post(`/orders/${order._id}/verify-payment`, { outcome })
      if (data.order.status === 'paid') {
        clearCart()
        toast('Payment successful!', 'success')
        navigate('/orders')
      } else {
        setOrder(data.order)
        setStep('failed')
      }
    } catch (err) {
      toast(err.response?.data?.message || 'Payment verification failed', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRetry = async () => {
    setSubmitting(true)
    try {
      const { data } = await api.post(`/orders/${order._id}/retry-payment`)
      setOrder(data.order)
      setPayment(data.payment)
      setStep('paying')
    } catch (err) {
      toast(err.response?.data?.message || 'Could not retry payment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="checkout-page page-enter">
      <div className="container checkout-layout">
        <div className="checkout-main">
          <h1 className="display" style={{ fontSize: 32, marginBottom: 24 }}>CHECKOUT</h1>

          {step === 'address' && (
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <label>Full Name
                <input value={address.fullName} onChange={e => setAddress({ ...address, fullName: e.target.value })} required />
              </label>
              <label>Address
                <input value={address.address} onChange={e => setAddress({ ...address, address: e.target.value })} required />
              </label>
              <div className="checkout-form__row">
                <label>City
                  <input value={address.city} onChange={e => setAddress({ ...address, city: e.target.value })} required />
                </label>
                <label>State
                  <input value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} required />
                </label>
                <label>Pincode
                  <input value={address.pincode} onChange={e => setAddress({ ...address, pincode: e.target.value })} required />
                </label>
              </div>
              <label>Phone
                <input value={address.phone} onChange={e => setAddress({ ...address, phone: e.target.value })} required />
              </label>
              {error && <p className="checkout-error">{error}</p>}
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Placing order…' : 'Place Order'}
              </button>
            </form>
          )}

          {step === 'paying' && payment && (
            <div className="checkout-payment">
              <p className="mono" style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                {payment.message || `Provider: ${payment.mode}`}
              </p>
              {payment.mode === 'simulation' ? (
                <div className="checkout-sim-buttons">
                  <button className="btn-primary" disabled={submitting} onClick={() => handleSimulatedOutcome('success')}>
                    Simulate Successful Payment
                  </button>
                  <button className="btn-ghost" disabled={submitting} onClick={() => handleSimulatedOutcome('failure')}>
                    Simulate Failed Payment
                  </button>
                </div>
              ) : (
                <p>Real gateway checkout ({payment.mode}) would open here — session: {payment.paymentSessionId}</p>
              )}
            </div>
          )}

          {step === 'failed' && (
            <div className="checkout-payment">
              <p className="checkout-error">Payment failed. No charge was made — your order is saved as "Payment Failed" and you can try again.</p>
              <button className="btn-primary" disabled={submitting} onClick={handleRetry}>
                {submitting ? 'Retrying…' : 'Try Payment Again'}
              </button>
            </div>
          )}
        </div>

        <div className="checkout-summary">
          <h2 className="display" style={{ fontSize: 24, marginBottom: 20 }}>ORDER SUMMARY</h2>
          {cartItems.map(item => (
            <div key={`${item._id}-${item.size}`} className="checkout-summary__row">
              <span>{item.name} × {item.quantity}</span>
              <span className="mono">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <div className="checkout-summary__row">
            <span>Shipping (estimate)</span>
            <span className="mono">{estimate.shipping === 0 ? 'FREE' : `₹${estimate.shipping}`}</span>
          </div>
          <div className="checkout-summary__row checkout-summary__total">
            <span>Estimated Total</span>
            <span className="mono">₹{estimate.total.toLocaleString()}</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Final total is recalculated and confirmed by the server — this is an estimate only.
          </p>
        </div>
      </div>
    </div>
  )
}
