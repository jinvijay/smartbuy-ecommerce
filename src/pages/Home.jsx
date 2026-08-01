import { useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { useProducts } from '../context/ProductsContext'

export default function Home() {
  const { search } = useOutletContext()
  const { products, loading, error } = useProducts()
  const [category, setCategory] = useState('All')

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category))].sort()
    return ['All', ...unique]
  }, [products])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory = category === 'All' || p.category === category
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      return matchesCategory && matchesSearch
    })
  }, [products, search, category])

  if (loading) {
    return (
      <div className="page">
        <p className="empty-state">Loading products…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page">
        <p className="empty-state">Couldn&apos;t load products: {error}</p>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="category-filter">
        {categories.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'chip--active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="empty-state">No products match your search.</p>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
