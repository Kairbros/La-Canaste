import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API } from '../../lib/api'

const STATUSES = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']
const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}
const STATUS_PILL: Record<string, { label: string; bg: string; color: string }> = {
  PENDIENTE: { label: 'Pendiente', bg: '#fff7e6', color: '#b26a00' },
  EN_PREPARACION: { label: 'En preparación', bg: '#e7f0ff', color: '#1c4ed8' },
  EN_CAMINO: { label: 'En camino', bg: '#e8f5e9', color: '#006e0a' },
  ENTREGADO: { label: 'Entregado', bg: '#eef2f6', color: '#5b6470' },
  CANCELADO: { label: 'Cancelado', bg: '#ffeceb', color: '#ba1a1a' },
}

interface Order {
  id: number; clientName: string; address: string; phone: string
  status: string; total: number; createdAt: string; deliveryId: number | null
  items: { id: number; quantity: number; unitPrice: number; product: { name: string } }[]
}

interface DeliveryUser { id: number; name: string }

export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [deliveries, setDeliveries] = useState<DeliveryUser[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  const auth = { Authorization: `Bearer ${token}` }

  const load = () =>
    fetch(`${API}/orders`, { headers: auth })
      .then(r => r.json()).then(setOrders)

  useEffect(() => {
    load()
    fetch(`${API}/users?role=DOMICILIARIO`, { headers: auth })
      .then(r => r.json()).then(setDeliveries)
  }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ status }),
    })
    load()
  }

  const assignDelivery = async (id: number, deliveryId: number | null) => {
    await fetch(`${API}/orders/${id}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify({ deliveryId }),
    })
    load()
  }

  return (
    <div>
      <h1 className="adm-title">Pedidos</h1>
      {orders.length === 0 && <p className="adm-empty">No hay pedidos aún.</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {orders.map(order => {
          const pill = STATUS_PILL[order.status] ?? { label: order.status, bg: '#eee', color: '#333' }
          return (
            <div key={order.id} className="adm-card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ fontWeight: 800, color: 'var(--on-surface)', fontSize: 16 }}>
                    {order.clientName} <span style={{ color: 'var(--on-surface-variant)', fontWeight: 500, fontSize: 14 }}>#{order.id}</span>
                  </p>
                  <p style={{ fontSize: 14, color: 'var(--on-surface-variant)' }}>{order.address} · {order.phone}</p>
                  <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', opacity: 0.7 }}>{new Date(order.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                  <span className="adm-pill" style={{ background: pill.bg, color: pill.color }}>{pill.label}</span>
                  <p style={{ fontWeight: 800, color: 'var(--primary)' }}>${order.total.toLocaleString('es-CO')}</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                <select value={order.status} onChange={e => updateStatus(order.id, e.target.value)} className="adm-select" style={{ width: 'auto' }}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
                <select value={order.deliveryId ?? ''} onChange={e => assignDelivery(order.id, e.target.value ? Number(e.target.value) : null)} className="adm-select" style={{ width: 'auto' }}>
                  <option value="">Sin asignar</option>
                  {deliveries.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} className="adm-link edit" style={{ marginLeft: 'auto' }}>
                  {expanded === order.id ? 'Ocultar' : 'Ver productos'}
                </button>
              </div>

              {expanded === order.id && (
                <div style={{ borderTop: '1px solid #f0f0f5', paddingTop: 12, marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'var(--on-surface)' }}>
                      <span>{item.product.name} x{item.quantity}</span>
                      <span>${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
