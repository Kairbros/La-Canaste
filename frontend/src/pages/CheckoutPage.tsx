import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const WHATSAPP_NUMBER = '573000000000' // Cambia por el número real del negocio
const API = 'http://localhost:4000/api'

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ clientName: '', address: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (items.length === 0) {
    navigate('/')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      i => `• ${i.product.name} x${i.quantity} — $${(i.product.price * i.quantity).toLocaleString('es-CO')}`
    )
    return [
      '🛒 *Nuevo pedido*',
      '',
      `👤 *Cliente:* ${form.clientName}`,
      `📍 *Dirección:* ${form.address}`,
      `📞 *Teléfono:* ${form.phone}`,
      '',
      '*Productos:*',
      ...lines,
      '',
      `💰 *Total: $${total.toLocaleString('es-CO')}*`,
    ].join('\n')
  }

  const handleWhatsApp = async () => {
    if (!form.clientName || !form.address || !form.phone) {
      setError('Por favor completa todos los campos')
      return
    }
    setLoading(true)
    setError('')
    try {
      await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          address: form.address,
          phone: form.phone,
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        }),
      })
      const message = encodeURIComponent(buildWhatsAppMessage())
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
      clearCart()
      navigate('/')
    } catch {
      setError('Error al registrar el pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-green-500 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white text-2xl leading-none">&larr;</button>
          <h1 className="text-xl font-bold">Confirmar pedido</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        {/* Resumen del pedido */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <h2 className="font-bold text-gray-800">Resumen</h2>
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex justify-between text-sm text-gray-700">
              <span>{product.name} <span className="text-gray-400">x{quantity}</span></span>
              <span className="font-medium">${(product.price * quantity).toLocaleString('es-CO')}</span>
            </div>
          ))}
          <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toLocaleString('es-CO')}</span>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-4">
          <h2 className="font-bold text-gray-800">Tus datos</h2>
          {[
            { label: 'Nombre completo', name: 'clientName', placeholder: 'Ej: Juan Pérez' },
            { label: 'Dirección de entrega', name: 'address', placeholder: 'Ej: Calle 5 # 12-34, Barrio El Jardín' },
            { label: 'Teléfono de contacto', name: 'phone', placeholder: 'Ej: 3001234567' },
          ].map(field => (
            <div key={field.name} className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">{field.label}</label>
              <input
                name={field.name}
                value={form[field.name as keyof typeof form]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ))}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Botón WhatsApp */}
        <button
          onClick={handleWhatsApp}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-base flex items-center justify-center gap-2 transition-colors shadow-md"
        >
          <span className="text-xl">💬</span>
          {loading ? 'Registrando...' : 'Enviar pedido por WhatsApp'}
        </button>
      </div>
    </div>
  )
}
