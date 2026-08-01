import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProductImage from '../components/ProductImage'
import { useProducts } from '../context/ProductsContext'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { getProductById, loading } = useProducts()
  const product = getProductById(id)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading product…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="page">
        <p className="empty-state">Product not found.</p>
        <Link to="/" className="btn btn--secondary">
          Back to shop
        </Link>
      </div>
    )
  }

  function handleAdd() {
    addToCart(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="page product-detail">
      <button className="btn btn--link" onClick={() => navigate(-1)}>
        ← Back
      </button>
      <div className="product-detail__layout">
        <ProductImage product={product} size="large" />
        <div className="product-detail__info">
          <span className="product-card__category">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="product-card__rating">⭐ {product.rating} rating</div>
          <p className="product-detail__price">${product.price.toFixed(2)}</p>
          <p className="product-detail__description">{product.description}</p>
          <p className="product-detail__stock">
            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          </p>

          <div className="product-detail__actions">
            <div className="qty-stepper">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>
                +
              </button>
            </div>
            <button
              className="btn btn--primary"
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {added ? 'Added ✓' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
