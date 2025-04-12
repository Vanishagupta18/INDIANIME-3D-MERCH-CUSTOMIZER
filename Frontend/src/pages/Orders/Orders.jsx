import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import './Orders.css'

const STATUS = {
  pending:   { color:'#f59e0b', bg:'rgba(245,158,11,0.1)',   label:'Pending' },
  confirmed: { color:'#3b82f6', bg:'rgba(59,130,246,0.1)',   label:'Confirmed' },
  shipped:   { color:'#8b5cf6', bg:'rgba(139,92,246,0.1)',   label:'Shipped' },
  delivered: { color:'#22c55e', bg:'rgba(34,197,94,0.1)',    label:'Delivered' },
  cancelled: { color:'#ef4444', bg:'rgba(239,68,68,0.1)',    label:'Cancelled' },
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data.orders))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="orders-page page-enter">
      <div className="container">
        <div style={{ marginBottom:40 }}>
          <p className="section-label"><span className="red-line" /> Account</p>
          <h1 className="display" style={{ fontSize:'clamp(32px,5vw,56px)', color:'var(--text-primary)' }}>
            MY ORDERS
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="orders-empty">
            <i className="fa-solid fa-box-open" style={{ fontSize:56, color:'var(--grey)', marginBottom:20 }} />
            <h3 className="display" style={{ fontSize:28 }}>NO ORDERS YET</h3>
            <p style={{ color:'var(--text-muted)', margin:'10px 0 28px' }}>
              When you place an order, it will appear here.
            </p>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Start Shopping <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const st = STATUS[order.status] || STATUS.pending
              return (
                <div key={order._id} className="order-card">
                  <div className="order-card__header">
                    <div>
                      <p className="mono" style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:'0.1em' }}>
                        ORDER ID
                      </p>
                      <p className="mono" style={{ fontSize:14, color:'var(--text-primary)', marginTop:4 }}>
                        #{order._id.slice(-10).toUpperCase()}
                      </p>
                      <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:6 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}
                      </p>
                    </div>
                    <span className="order-status" style={{ background:st.bg, color:st.color }}>
                      {st.label}
                    </span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        {item.image && <img src={item.image} alt={item.name} />}
                        <div>
                          <p className="order-item__name">{item.name}</p>
                          <p className="mono" style={{ fontSize:11, color:'var(--text-muted)' }}>
                            SIZE: {item.size} · QTY: {item.quantity} · ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-card__footer">
                    <p style={{ fontSize:13, color:'var(--text-muted)' }}>
                      <i className="fa-solid fa-location-dot" style={{ color:'var(--red)', marginRight:6 }} />
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </p>
                    <p className="mono" style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>
                      ₹{order.totalPrice?.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}