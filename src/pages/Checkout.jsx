import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useSession } from '../lib/authClient'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { data: session, isPending: sessionLoading } = useSession()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', address: '', city: '', zip: '' })
  const [orderId, setOrderId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (session?.user) {
      setForm((f) => ({
        ...f,
        name: f.name || session.user.name || '',
        email: f.email || session.user.email || '',
      }))
    }
  }, [session])

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ product, qty }) => ({ productId: product.id, qty })),
          shippingInfo: form,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to place order')
      setOrderId(data.id)
      clearCart()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sessionLoading) {
    return (
      <div className="page">
        <p className="empty-state">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (orderId) {
    return (
      <div className="page">
        <div className="order-confirmation">
          <h1>🎉 Order Confirmed!</h1>
          <p>
            Thank you, {form.name || 'valued customer'}! Your order{' '}
            <strong>{orderId}</strong> has been placed.
          </p>
          <p>A confirmation would normally be emailed to {form.email || 'you'}.</p>
          <Link to="/" className="btn btn--primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return <Navigate to="/cart" replace />
  }

  return (
    <div className="page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Address
            <input name="address" value={form.address} onChange={handleChange} required />
          </label>
          <div className="checkout-form__row">
            <label>
              City
              <input name="city" value={form.city} onChange={handleChange} required />
            </label>
            <label>
              ZIP Code
              <input name="zip" value={form.zip} onChange={handleChange} required />
            </label>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Placing Order…' : `Place Order ($${subtotal.toFixed(2)})`}
          </button>
        </form>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          {items.map(({ product, qty }) => (
            <div className="cart-summary__row" key={product.id}>
              <span>
                {product.name} × {qty}
              </span>
              <span>${(product.price * qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
