import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useProducts } from './ProductsContext'

const CartContext = createContext(null)
const STORAGE_KEY = 'smartbuy_cart_v1'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const { getProductById } = useProducts()
  const [items, setItems] = useState(loadCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(productId, qty = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i
        )
      }
      return [...prev, { productId, qty }]
    })
  }

  function updateQty(productId, qty) {
    setItems((prev) => {
      if (qty <= 0) return prev.filter((i) => i.productId !== productId)
      return prev.map((i) => (i.productId === productId ? { ...i, qty } : i))
    })
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((i) => i.productId !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const detailedItems = useMemo(
    () =>
      items
        .map((i) => ({ ...i, product: getProductById(i.productId) }))
        .filter((i) => i.product),
    [items, getProductById]
  )

  const totalCount = useMemo(
    () => items.reduce((sum, i) => sum + i.qty, 0),
    [items]
  )

  const subtotal = useMemo(
    () =>
      detailedItems.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    [detailedItems]
  )

  const value = {
    items: detailedItems,
    totalCount,
    subtotal,
    addToCart,
    updateQty,
    removeFromCart,
    clearCart,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}
