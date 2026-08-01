import { Link } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useCart } from '../context/CartContext'

export default function Cart() {
  const { items, subtotal, updateQty, removeFromCart, clearCart } = useCart()

  if (items.length === 0) {
    return (
      <div className="page">
        <h1>Your Cart</h1>
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/" className="btn btn--primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, qty }) => (
            <div className="cart-item" key={product.id}>
              <ProductImage product={product} size="small" />
              <div className="cart-item__info">
                <Link to={`/product/${product.id}`} className="cart-item__name">
                  {product.name}
                </Link>
                <div className="cart-item__price">${product.price.toFixed(2)}</div>
              </div>
              <div className="qty-stepper">
                <button onClick={() => updateQty(product.id, qty - 1)}>-</button>
                <span>{qty}</span>
                <button
                  onClick={() => updateQty(product.id, qty + 1)}
                  disabled={qty >= product.stock}
                >
                  +
                </button>
              </div>
              <div className="cart-item__total">${(product.price * qty).toFixed(2)}</div>
              <button
                className="btn btn--link cart-item__remove"
                onClick={() => removeFromCart(product.id)}
              >
                Remove
              </button>
            </div>
          ))}
          <button className="btn btn--secondary" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="cart-summary__row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="cart-summary__row">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn--primary cart-summary__checkout">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
