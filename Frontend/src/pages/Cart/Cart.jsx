import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { toast } from '../../components/ui/Toast'
import './Cart.css'

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()
  const shipping   = totalPrice > 999 ? 0 : 99
  const grandTotal = totalPrice + shipping

  if (cartItems.length === 0) return (
    <div className="cart-empty page-enter">
      <i className="fa-solid fa-bag-shopping" style={{ fontSize:64, color:'var(--grey)', marginBottom:24 }} />
      <h2 className="display" style={{ fontSize:40, marginBottom:12 }}>YOUR CART IS EMPTY</h2>
      <p style={{ color:'var(--text-muted)', marginBottom:32 }}>Add some anime merch to get started</p>
      <button onClick={() => navigate('/products')} className="btn-primary">
        Shop Now <i className="fa-solid fa-arrow-right" />
      </button>
    </div>
  )

  return (
    <div className="cart-page page-enter">
      <div className="container">
        <div className="cart-heading">
          <h1 className="display cart-title">YOUR CART</h1>
          <span className="mono" style={{ fontSize:13, color:'var(--text-muted)' }}>
            {cartItems.length} ITEM{cartItems.length !== 1 ? 'S' : ''}
          </span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={`${item._id}-${item.size}`} className="cart-item">
                <div className="cart-item__img" onClick={() => navigate(`/product/${item._id}`)}>
                  <img src={item.images?.[0]} alt={item.name} loading="lazy" />
                </div>
                <div className="cart-item__info">
                  <p className="cart-item__series">{item.anime?.replace(/-/g,' ').toUpperCase()}</p>
                  <h3 className="cart-item__name" onClick={() => navigate(`/product/${item._id}`)}>
                    {item.name}
                  </h3>
                  <p className="cart-item__size mono">SIZE: {item.size}</p>
                  <p className="cart-item__price mono">₹{item.price}</p>
                </div>
                <div className="cart-item__right">
                  <div className="cart-qty">
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity - 1)}>−</button>
                    <span className="mono">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}>+</button>
                  </div>
                  <p className="cart-item__subtotal mono">₹{(item.price * item.quantity).toLocaleString()}</p>
                  <button className="cart-remove" onClick={() => {
                    removeFromCart(item._id, item.size)
                    toast('Item removed', 'info')
                  }}>
                    <i className="fa-solid fa-trash" />
                  </button>
                </div>
              </div>
            ))}

            <button onClick={clearCart} className="btn-ghost" style={{ fontSize:13, marginTop:8 }}>
              <i className="fa-solid fa-trash" /> Clear entire cart
            </button>
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h2 className="display" style={{ fontSize:28, marginBottom:28 }}>ORDER SUMMARY</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span className="mono">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className="mono" style={{ color: shipping===0 ? '#22c55e' : 'inherit' }}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            {shipping > 0 && (
              <p style={{ fontSize:12, color:'#22c55e', marginTop:-12, marginBottom:16 }}>
                Add ₹{999 - totalPrice} more for free shipping
              </p>
            )}

            <div className="divider" style={{ margin:'20px 0' }} />

            <div className="summary-row summary-total">
              <span>Total</span>
              <span className="mono">₹{grandTotal.toLocaleString()}</span>
            </div>

            <button className="btn-primary summary-checkout" onClick={() => navigate('/orders')}>
              Proceed to Checkout <i className="fa-solid fa-arrow-right" />
            </button>
            <button className="btn-ghost summary-continue" onClick={() => navigate('/products')}>
              ← Continue Shopping
            </button>

            <div className="summary-trust">
              <div className="summary-trust-item">
                <i className="fa-solid fa-shield-halved" />
                <span>Secure checkout</span>
              </div>
              <div className="summary-trust-item">
                <i className="fa-solid fa-rotate-left" />
                <span>Easy returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}