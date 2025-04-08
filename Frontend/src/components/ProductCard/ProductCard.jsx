import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { toast } from '../ui/Toast'
import './ProductCard.css'

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  const handleAdd = (e) => {
    e.stopPropagation()
    addToCart(product)
    toast(`${product.name} added to cart`, 'success')
  }

  return (
    <div
      className="pcard"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/product/${product._id}`)}
    >
      <div className="pcard__img">
        <img
          src={hovered && product.images?.[1] ? product.images[1] : product.images?.[0]}
          alt={product.name}
          loading="lazy"
        />
        {discount && <span className="pcard__discount">-{discount}%</span>}
        <button className="pcard__add" onClick={handleAdd}>
          <i className="fa-solid fa-bag-shopping" /> Add to Cart
        </button>
      </div>

      <div className="pcard__body">
        <p className="pcard__series">{product.anime?.replace(/-/g, ' ').toUpperCase()}</p>
        <h3 className="pcard__name">{product.name}</h3>
        <div className="pcard__footer">
          <div className="pcard__stars">
            {[...Array(5)].map((_, i) => (
              <i key={i} className={i < Math.round(product.rating || 0)
                ? 'fa-solid fa-star' : 'fa-regular fa-star'} />
            ))}
          </div>
          <div className="pcard__price">
            <span className="pcard__current">₹{product.price}</span>
            {product.originalPrice && (
              <span className="pcard__original">₹{product.originalPrice}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}