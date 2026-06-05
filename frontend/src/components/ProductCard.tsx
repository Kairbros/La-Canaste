import type { Product } from '../types'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Plus } from 'lucide-react'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <div className="product-card">
      {product.available ? (
        <span className="badge-organic product-card-badge">Disponible</span>
      ) : (
        <span className="badge-status product-card-badge" style={{ background: 'var(--error-container)', color: 'var(--on-error-container)' }}>
          Agotado
        </span>
      )}

      <div className="product-card-img-wrapper">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card-img" />
        ) : (
          <div className="product-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}><ShoppingCart size={48} /></div>
        )}
      </div>

      <div className="product-card-content">
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>{product.name}</h3>
        <div className="product-card-price-row">
          <div className="product-card-price-info">
            <span className="unit-price">Precio por unidad</span>
            <span className="price">${product.price.toLocaleString('es-CO')}</span>
          </div>
          <button
            className="btn-add-cart-circle"
            onClick={() => addItem(product)}
            disabled={!product.available}
            title="Agregar al carrito"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
