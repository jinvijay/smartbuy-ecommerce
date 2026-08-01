import { Link } from 'react-router-dom'
import ProductImage from './ProductImage'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <ProductImage product={product} />
        <div className="product-card__body">
          <span className="product-card__category">{product.category}</span>
          <h3 className="product-card__name">{product.name}</h3>
          <div className="product-card__rating">⭐ {product.rating}</div>
          <div className="product-card__price">${product.price.toFixed(2)}</div>
        </div>
      </Link>
      <button
        className="btn btn--primary product-card__add"
        onClick={() => addToCart(product.id, 1)}
        disabled={product.stock === 0}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  )
}
