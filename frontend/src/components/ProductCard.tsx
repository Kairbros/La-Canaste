import type { Product } from '../types'
import { useCart } from '../context/CartContext'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl">🛒</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight">{product.name}</h3>
        <p className="text-green-600 font-bold text-lg">
          ${product.price.toLocaleString('es-CO')}
        </p>
        <span className={`text-xs font-medium ${product.available ? 'text-green-500' : 'text-red-400'}`}>
          {product.available ? 'Disponible' : 'Agotado'}
        </span>
        <button
          onClick={() => addItem(product)}
          disabled={!product.available}
          className="mt-auto bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white text-sm font-semibold py-2 rounded-xl transition-colors"
        >
          Agregar
        </button>
      </div>
    </div>
  )
}
