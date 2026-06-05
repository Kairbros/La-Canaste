import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { API } from '../lib/api'
import LocationPicker from '../components/LocationPicker'
import type { Config } from '../types'
import { Bike, MapPin, Phone, Navigation } from 'lucide-react'

interface DeliveryOrder {
  id: number; clientName: string; address: string; phone: string
  status: string; total: number; latitude: number | null; longitude: number | null
  items: { id: number; quantity: number; product: { name: string } }[]
}

const STATUS_STYLE: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', bg: '#fff7e6', color: '#b26a00' },
  EN_PREPARACION: { label: 'En preparación', bg: '#e7f0ff', color: '#1c4ed8' },
  EN_CAMINO: { label: 'En camino', bg: '#e8f5e9', color: '#006e0a' },
  ENTREGADO: { label: 'Entregado', bg: '#eef2f6', color: '#5b6470' },
  CANCELADO: { label: 'Cancelado', bg: '#ffeceb', color: '#ba1a1a' },
}

export default function DeliveryPage() {
  const { user, token, logout } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<DeliveryOrder[]>([])
  const [config, setConfig] = useState<Config | null>(null)

  const load = () =>
    fetch(`${API}/orders/mine`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setOrders)

  useEffect(() => {
    load()
    fetch(`${API}/config`).then(r => r.json()).then(setConfig)
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const active = orders.filter(o => o.status !== 'ENTREGADO' && o.status !== 'CANCELADO')
  const done = orders.filter(o => o.status === 'ENTREGADO' || o.status === 'CANCELADO')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)' }}>
      <header style={{ background: 'var(--primary)', color: '#fff', position: 'sticky', top: 0, zIndex: 30, boxShadow: 'var(--shadow-level-1)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(12px, 3vw, 16px) clamp(14px, 3vw, 20px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 'clamp(17px, 4vw, 20px)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}><Bike size={22} /> Mis entregas</h1>
            <p style={{ fontSize: 12, opacity: 0.85 }}>{user?.name}</p>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.18)', border: 'none', color: '#fff', borderRadius: 'var(--rounded-full)', padding: '8px 16px', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
            Salir
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: 'clamp(14px, 3vw, 20px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--on-surface-variant)', padding: '64px 0' }}>No tienes pedidos asignados.</p>
        )}

        {active.map(order => (
          <OrderCard key={order.id} order={order} config={config} onStatus={updateStatus} />
        ))}

        {done.length > 0 && (
          <>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 8 }}>Historial</h2>
            {done.map(order => (
              <OrderCard key={order.id} order={order} config={config} onStatus={updateStatus} collapsed />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

function OrderCard({
  order, config, onStatus, collapsed,
}: {
  order: DeliveryOrder
  config: Config | null
  onStatus: (id: number, status: string) => void
  collapsed?: boolean
}) {
  const hasCoords = order.latitude != null && order.longitude != null
  const mapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.latitude},${order.longitude}`
    : null
  const st = STATUS_STYLE[order.status] ?? { label: order.status, bg: '#eee', color: '#333' }

  return (
    <div style={{
      background: 'var(--surface-container-lowest)', border: 'var(--border-level-1)',
      borderRadius: 'var(--rounded-lg)', boxShadow: 'var(--shadow-level-1)', overflow: 'hidden',
    }}>
      <div style={{ padding: 'clamp(14px, 2.5vw, 18px)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Cabecera */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: 'clamp(15px, 3vw, 17px)', color: 'var(--on-surface)', wordBreak: 'break-word' }}>
              {order.clientName} <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: 14 }}>#{order.id}</span>
            </p>
            <p style={{ fontSize: 'clamp(13px, 2.5vw, 14px)', color: 'var(--on-surface-variant)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, wordBreak: 'break-word' }}><MapPin size={15} /> {order.address}</p>
            <a href={`tel:${order.phone}`} style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}><Phone size={15} /> {order.phone}</a>
          </div>
          <span style={{ background: st.bg, color: st.color, fontSize: 12, fontWeight: 700, padding: '5px 12px', borderRadius: 'var(--rounded-full)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {st.label}
          </span>
        </div>

        {!collapsed && hasCoords && config && (
          <div style={{ borderRadius: 'var(--rounded-md)', overflow: 'hidden', border: 'var(--border-level-1)' }}>
            <LocationPicker
              value={{ lat: order.latitude!, lng: order.longitude! }}
              storeLat={config.storeLat}
              storeLng={config.storeLng}
              coverageRadius={config.coverageRadius}
              readOnly
            />
          </div>
        )}

        {!collapsed && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {order.items.map(item => (
              <span key={item.id} style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface)', fontSize: 13, fontWeight: 600, padding: '6px 12px', borderRadius: 'var(--rounded-full)' }}>
                {item.product.name} x{item.quantity}
              </span>
            ))}
          </div>
        )}

        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {mapsUrl && (
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                style={{ background: '#1c4ed8', color: '#fff', fontSize: 'clamp(13px, 2.5vw, 14px)', fontWeight: 700, padding: '10px 18px', borderRadius: 'var(--rounded-full)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Navigation size={16} /> Navegar
              </a>
            )}
            {order.status !== 'EN_CAMINO' && order.status !== 'ENTREGADO' && (
              <button onClick={() => onStatus(order.id, 'EN_CAMINO')}
                style={{ background: 'var(--inverse-surface)', color: '#fff', border: 'none', fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700, padding: '10px 18px', borderRadius: 'var(--rounded-full)', cursor: 'pointer' }}>
                Marcar en camino
              </button>
            )}
            {order.status !== 'ENTREGADO' && (
              <button onClick={() => onStatus(order.id, 'ENTREGADO')}
                style={{ background: 'var(--primary)', color: '#fff', border: 'none', fontSize: 'clamp(12px, 2.5vw, 14px)', fontWeight: 700, padding: '10px 18px', borderRadius: 'var(--rounded-full)', cursor: 'pointer' }}>
                Marcar entregado
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
