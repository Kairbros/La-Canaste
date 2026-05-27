import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, total, clearCart } = useCart()

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800">Tu carrito</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {items.length === 0 && (
            <p className="text-center text-gray-400 mt-10">El carrito está vacío</p>
          )}
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-3 border rounded-xl p-3">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0">
                {product.image ? <img src={product.image} className="w-full h-full object-cover rounded-lg" /> : '🛒'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                <p className="text-green-600 text-sm font-bold">${(product.price * quantity).toLocaleString('es-CO')}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">−</button>
                <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 font-bold text-gray-700">+</button>
              </div>
              <button onClick={() => removeItem(product.id)} className="text-red-400 hover:text-red-600 text-lg ml-1">&times;</button>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t flex flex-col gap-3">
            <div className="flex justify-between font-bold text-gray-800 text-lg">
              <span>Total</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/checkout') }}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Hacer pedido
            </button>
            <button onClick={clearCart} className="text-sm text-gray-400 hover:text-gray-600 text-center">
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </>
  )
}
