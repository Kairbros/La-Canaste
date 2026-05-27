import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const API = 'http://localhost:4000/api'

interface Stats {
  day: { total: number; count: number }
  week: { total: number; count: number }
  month: { total: number; count: number }
  totalOrders: number
  topProducts: { productId: number; _sum: { quantity: number }; product: { name: string } }[]
  recentOrders: { id: number; clientName: string; total: number; status: string; createdAt: string }[]
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: '🟡 Pendiente',
  EN_PREPARACION: '🔵 En preparación',
  EN_CAMINO: '🚴 En camino',
  ENTREGADO: '✅ Entregado',
  CANCELADO: '❌ Cancelado',
}

export default function DashboardPage() {
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setStats)
  }, [token])

  if (!stats) return <div className="text-gray-400">Cargando estadísticas...</div>

  const cards = [
    { label: 'Ventas hoy', value: stats.day.total, count: stats.day.count, color: 'bg-green-50 text-green-700' },
    { label: 'Esta semana', value: stats.week.total, count: stats.week.count, color: 'bg-blue-50 text-blue-700' },
    { label: 'Este mes', value: stats.month.total, count: stats.month.count, color: 'bg-purple-50 text-purple-700' },
    { label: 'Total pedidos', value: null, count: stats.totalOrders, color: 'bg-orange-50 text-orange-700' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className={`rounded-2xl p-4 ${card.color}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            {card.value !== null && (
              <p className="text-2xl font-bold mt-1">${card.value.toLocaleString('es-CO')}</p>
            )}
            <p className="text-sm mt-1">{card.count} pedidos</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3">Productos más vendidos</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin datos aún</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.topProducts.map((p, i) => (
                <div key={p.productId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600"><span className="font-bold text-gray-400 mr-2">#{i + 1}</span>{p.product?.name}</span>
                  <span className="font-semibold text-green-600">{p._sum.quantity} uds</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pedidos recientes */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h2 className="font-bold text-gray-800 mb-3">Pedidos recientes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">Sin pedidos aún</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.recentOrders.slice(0, 6).map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm border-b pb-2">
                  <div>
                    <p className="font-medium text-gray-800">{order.clientName}</p>
                    <p className="text-xs text-gray-400">{STATUS_LABEL[order.status]}</p>
                  </div>
                  <span className="font-bold text-gray-700">${order.total.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
