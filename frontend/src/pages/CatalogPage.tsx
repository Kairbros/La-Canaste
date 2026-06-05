import { useState } from 'react'
import { useCategories, useProducts } from '../hooks/useProducts'
import ProductCard from '../components/ProductCard'
import CartDrawer from '../components/CartDrawer'
import { useCart } from '../context/CartContext'

export default function CatalogPage() {
  const { categories } = useCategories()
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>()
  const [search, setSearch] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const { products, loading } = useProducts(selectedCategory)
  const { count } = useCart()

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="client-header">
        <div className="client-header-container">
          <a className="client-brand">La Canasta</a>

          <div className="client-search">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              className="client-search-input"
              placeholder="Buscar productos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="client-header-actions">
            <div className="cart-icon-wrapper" onClick={() => setCartOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} style={{ width: 26, height: 26, stroke: 'var(--on-surface)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ background: 'linear-gradient(180deg, #f0f3ff 0%, var(--background) 100%)', padding: '48px 16px', textAlign: 'center', marginBottom: 32 }}>
        <h1 className="display-xl" style={{ fontSize: 'clamp(24px, 5vw, 38px)', fontWeight: 800, color: 'var(--on-surface)', marginBottom: 12, letterSpacing: '-0.02em' }}>
          Frescura del barrio a tu mesa
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2.5vw, 16px)', color: 'var(--on-surface-variant)', maxWidth: 550, margin: '0 auto' }}>
          Productos de tu minimercado de confianza, con domicilio rápido en tu zona de cobertura.
        </p>
      </section>

      <div style={{ maxWidth: 'var(--container-max-width)', margin: '0 auto', padding: '0 clamp(12px, 3vw, 24px) clamp(48px, 8vw, 80px) clamp(12px, 3vw, 24px)' }}>
        {/* Chips de categorías */}
        <div className="category-chips" style={{ justifyContent: 'center', marginBottom: 40 }}>
          <button className={`chip ${!selectedCategory ? 'active' : ''}`} onClick={() => setSelectedCategory(undefined)}>
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`chip ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--on-surface-variant)' }}>Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--on-surface-variant)' }}>No se encontraron productos</div>
        ) : (
          <section className="product-grid">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </section>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
