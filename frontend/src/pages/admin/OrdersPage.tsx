import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:4000/api'

const STATUSES = ['PENDIENTE', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']
const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: '🟡 Pendiente',
  EN_PREPARACION: '🔵 En preparación',
  EN_CAMINO: '🚴 En camino',
  ENTREGADO: '✅ Entregado',
  CANCELADO: '❌ Cancelado',
}

interface Order {
  id: number; clientName: string; address: string; phone: string
  status: string; total: number; createdAt: string
  items: { id: number; quantity: number; unitPrice: number; product: { name: string } }[]
}

export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = () =>
    fetch(`${API}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setOrders)

  useEffect(() => { load() }, [])

  const updateStatus = async (id: number, status: string) => {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
      {orders.length === 0 && <p className="text-gray-400">No hay pedidos aún.</p>}
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-bold text-gray-800">{order.clientName} <span className="text-gray-400 font-normal text-sm">#{order.id}</span></p>
              <p className="text-sm text-gray-500">{order.address} · {order.phone}</p>
              <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString('es-CO')}</p>
            </div>
            <p className="font-bold text-green-600 shrink-0">${order.total.toLocaleString('es-CO')}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={order.status}
              onChange={e => updateStatus(order.id, e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="text-sm text-green-600 hover:underline"
            >
              {expanded === order.id ? 'Ocultar' : 'Ver productos'}
            </button>
          </div>

          {expanded === order.id && (
            <div className="border-t pt-3 flex flex-col gap-1">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.product.name} x{item.quantity}</span>
                  <span>${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
