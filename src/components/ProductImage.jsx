export default function ProductImage({ product, size = 'medium' }) {
  return (
    <div
      className={`product-image product-image--${size}`}
      style={{ background: product.color }}
      aria-hidden="true"
    >
      <span>{product.emoji}</span>
    </div>
  )
}
