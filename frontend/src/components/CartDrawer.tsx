import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { ShoppingCart, Trash2 } from 'lucide-react'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  return (
    <>
      <div className={`cart-drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Mi Carrito</h2>
          <button className="btn-close-drawer" onClick={onClose}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 20, height: 20 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="cart-drawer-content">
          {items.length === 0 && (
            <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', marginTop: 40 }}>
              El carrito está vacío
            </p>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="cart-item">
              {product.image ? (
                <img src={product.image} alt={product.name} className="cart-item-img" />
              ) : (
                <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}><ShoppingCart size={28} /></div>
              )}
              <div className="cart-item-info">
                <div className="cart-item-title">{product.name}</div>
                <div className="cart-item-price">${(product.price * quantity).toLocaleString('es-CO')}</div>
                <div style={{ marginTop: 8 }}>
                  <div className="quantity-selector">
                    <button onClick={() => updateQuantity(product.id, quantity - 1)}>-</button>
                    <span>{quantity}</span>
                    <button onClick={() => updateQuantity(product.id, quantity + 1)}>+</button>
                  </div>
                </div>
              </div>
              <button className="category-card-btn" style={{ color: 'var(--error)', display: 'flex', alignItems: 'center' }} onClick={() => removeItem(product.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-totals">
              <div className="cart-total-row grand-total">
                <span>Total</span>
                <span>${total.toLocaleString('es-CO')}</span>
              </div>
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', borderRadius: 'var(--rounded-default)', padding: 14, boxShadow: 'none' }}
              onClick={() => { onClose(); navigate('/checkout') }}
            >
              Confirmar Compra
            </button>
            <button
              onClick={clearCart}
              style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', color: 'var(--on-surface-variant)', cursor: 'pointer', fontSize: 14 }}
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
