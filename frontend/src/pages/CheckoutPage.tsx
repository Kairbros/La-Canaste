import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { API } from '../lib/api'
import LocationPicker, { type LatLng } from '../components/LocationPicker'
import type { Config } from '../types'
import { ArrowLeft, MapPin, Loader2, Check, X, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '573144063533' // Número del negocio

// Distancia en km (Haversine) para validar la cobertura en el cliente.
const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ clientName: '', address: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [config, setConfig] = useState<Config | null>(null)
  const [location, setLocation] = useState<LatLng | null>(null)

  useEffect(() => {
    fetch(`${API}/config`).then(r => r.json()).then(setConfig)
  }, [])

  if (items.length === 0) {
    navigate('/')
    return null
  }

  // Estado de cobertura de la ubicación seleccionada
  const coverage = (() => {
    if (!config || !location) return null
    const distance = distanceKm(config.storeLat, config.storeLng, location.lat, location.lng)
    return { distance, covered: distance <= config.coverageRadius }
  })()

  const [locating, setLocating] = useState(false)

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Tu navegador no permite geolocalización')
      return
    }
    setLocating(true)
    setError('')
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      () => {
        setError('No se pudo obtener tu ubicación. Tócala directamente en el mapa.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      i => `- ${i.product.name} x${i.quantity}: $${(i.product.price * i.quantity).toLocaleString('es-CO')}`
    )
    const ubicacion = location
      ? `Ubicacion: https://www.google.com/maps?q=${location.lat},${location.lng}`
      : ''
    return [
      'Nuevo pedido',
      '',
      `Cliente: ${form.clientName}`,
      `Direccion: ${form.address}`,
      `Telefono: ${form.phone}`,
      '',
      'Productos:',
      ...lines,
      '',
      `Total: $${total.toLocaleString('es-CO')}`,
      ubicacion,
    ].filter(Boolean).join('\n')
  }

  const handleWhatsApp = async () => {
    if (!form.clientName || !form.address || !form.phone) {
      setError('Por favor completa todos los campos')
      return
    }
    if (!location) {
      setError('Marca tu ubicación de entrega en el mapa')
      return
    }
    if (coverage && !coverage.covered) {
      setError('Tu ubicación está fuera del radio de cobertura del domicilio')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: form.clientName,
          address: form.address,
          phone: form.phone,
          latitude: location.lat,
          longitude: location.lng,
          items: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error ?? 'Error al registrar el pedido. Intenta de nuevo.')
        return
      }
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
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ background: 'var(--primary)', color: '#fff', position: 'sticky', top: 0, zIndex: 30, boxShadow: '0 2px 12px rgba(0,110,10,0.25)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/')}
            aria-label="Volver"
            style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ lineHeight: 1.2 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800 }}>Confirmar pedido</h1>
            <p style={{ fontSize: 12, opacity: 0.85 }}>La Canasta · Minimercado</p>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Resumen del pedido */}
        <div className="adm-card">
          <h2 className="adm-card-title">Resumen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {items.map(({ product, quantity }) => (
              <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--on-surface)' }}>
                <span>{product.name} <span style={{ color: 'var(--on-surface-variant)' }}>x{quantity}</span></span>
                <span style={{ fontWeight: 600 }}>${(product.price * quantity).toLocaleString('es-CO')}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #f0f0f5', paddingTop: 12, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 18 }}>
              <span>Total</span>
              <span>${total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="adm-card">
          <h2 className="adm-card-title">Tus datos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Nombre completo', name: 'clientName', placeholder: 'Ej: Juan Pérez' },
              { label: 'Dirección de entrega', name: 'address', placeholder: 'Ej: Calle 5 # 12-34, Barrio El Jardín' },
              { label: 'Teléfono de contacto', name: 'phone', placeholder: 'Ej: 3001234567' },
            ].map(field => (
              <div key={field.name}>
                <label className="adm-label">{field.label}</label>
                <input
                  name={field.name}
                  value={form[field.name as keyof typeof form]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className="adm-input"
                />
              </div>
            ))}
            {error && <p style={{ color: 'var(--error)', fontSize: 14 }}>{error}</p>}
          </div>
        </div>

        {/* Ubicación de entrega */}
        <div className="adm-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h2 className="adm-card-title" style={{ marginBottom: 0 }}>Ubicación de entrega</h2>
            <button
              type="button" onClick={useMyLocation} disabled={locating}
              style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 5 }}
            >
              {locating
                ? <><Loader2 size={15} className="spin" /> Ubicando...</>
                : <><MapPin size={15} /> Usar mi ubicación</>}
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginBottom: 12 }}>
            Toca el mapa para marcar dónde quieres recibir el pedido. Si "Usar mi ubicación" no acierta (común en computadores), ajústala tocando el mapa.
          </p>

          {config && (
            <div style={{ borderRadius: 'var(--rounded-md)', overflow: 'hidden', border: 'var(--border-level-1)' }}>
              <LocationPicker
                value={location}
                onChange={setLocation}
                storeLat={config.storeLat}
                storeLng={config.storeLng}
                coverageRadius={config.coverageRadius}
              />
            </div>
          )}

          {coverage && (
            <div style={{ marginTop: 12, borderRadius: 'var(--rounded-default)', padding: 12, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6,
              background: coverage.covered ? '#e8f5e9' : '#ffeceb', color: coverage.covered ? '#006e0a' : '#ba1a1a' }}>
              {coverage.covered
                ? <><Check size={16} /> Dentro de cobertura ({coverage.distance.toFixed(2)} km)</>
                : <><X size={16} /> Fuera de cobertura ({coverage.distance.toFixed(2)} km, máximo {config?.coverageRadius} km)</>}
            </div>
          )}
        </div>

        {/* Botón WhatsApp */}
        <button
          onClick={handleWhatsApp}
          disabled={loading || (coverage ? !coverage.covered : false)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: loading || (coverage && !coverage.covered) ? 'var(--surface-container-high)' : '#25D366',
            color: loading || (coverage && !coverage.covered) ? 'var(--on-surface-variant)' : '#fff',
            border: 'none', borderRadius: 'var(--rounded-lg)', padding: 16, fontSize: 16, fontWeight: 700,
            cursor: loading || (coverage && !coverage.covered) ? 'not-allowed' : 'pointer',
            boxShadow: 'var(--shadow-level-1)',
          }}
        >
          <MessageCircle size={20} />
          {loading ? 'Registrando...' : 'Enviar pedido por WhatsApp'}
        </button>
      </div>
    </div>
  )
}
