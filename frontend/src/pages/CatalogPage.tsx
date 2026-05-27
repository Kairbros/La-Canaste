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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-500 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold leading-tight">Canasta Minimercado</h1>
            <p className="text-green-100 text-xs">Domicilios al barrio</p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <span className="text-2xl">🛒</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col gap-4">
        {/* Buscador */}
        <input
          type="text"
          placeholder="Buscar productos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${!selectedCategory ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === cat.id ? 'bg-green-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Productos */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Cargando productos...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No se encontraron productos</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  )
}
