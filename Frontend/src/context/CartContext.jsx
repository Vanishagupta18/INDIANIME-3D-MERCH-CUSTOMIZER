import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || [] }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = useCallback((product, size = 'M', quantity = 1) => {
    setCartItems(prev => {
      const exists = prev.find(i => i._id === product._id && i.size === size)
      if (exists) {
        return prev.map(i =>
          i._id === product._id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...product, size, quantity }]
    })
  }, [])

  const removeFromCart = useCallback((productId, size) => {
    setCartItems(prev => prev.filter(i => !(i._id === productId && i.size === size)))
  }, [])

  const updateQuantity = useCallback((productId, size, quantity) => {
    if (quantity <= 0) { removeFromCart(productId, size); return }
    setCartItems(prev =>
      prev.map(i => i._id === productId && i.size === size ? { ...i, quantity } : i)
    )
  }, [removeFromCart])

  const clearCart = useCallback(() => {
    setCartItems([])
    localStorage.removeItem('cart')
  }, [])

  const totalItems = cartItems.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart,
      updateQuantity, clearCart, totalItems, totalPrice
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}