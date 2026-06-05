import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API } from '../../lib/api'
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { DollarSign, CalendarDays, TrendingUp, Package } from 'lucide-react'

interface Stats {
  day: { total: number; count: number }
  week: { total: number; count: number }
  month: { total: number; count: number }
  totalOrders: number
  salesByDay: { date: string; total: number; count: number }[]
  topProducts: { productId: number; _sum: { quantity: number }; product: { name: string } }[]
  recentOrders: { id: number; clientName: string; total: number; status: string; createdAt: string }[]
}

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  EN_CAMINO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
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

  const trendData = stats.salesByDay.map(d => ({
    label: new Date(d.date + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' }),
    total: d.total,
  }))
  const topData = stats.topProducts.map(p => ({
    name: p.product?.name ?? `#${p.productId}`,
    cantidad: p._sum.quantity,
  }))

  const cards = [
    { label: 'Ventas hoy', value: stats.day.total, count: stats.day.count, Icon: DollarSign },
    { label: 'Esta semana', value: stats.week.total, count: stats.week.count, Icon: CalendarDays },
    { label: 'Este mes', value: stats.month.total, count: stats.month.count, Icon: TrendingUp },
    { label: 'Total pedidos', value: null, count: stats.totalOrders, Icon: Package },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="adm-title" style={{ marginBottom: 0 }}>Dashboard</h1>

      {/* KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: 0 }}>
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-info">
              <h3>{card.label}</h3>
              <p className="value">
                {card.value !== null ? `$${card.value.toLocaleString('es-CO')}` : card.count}
              </p>
              <p className="change positive">{card.count} pedidos</p>
            </div>
            <div className="stat-icon"><card.Icon size={24} /></div>
          </div>
        ))}
      </div>

      {/* Gráfica de tendencia de ventas (últimos 14 días) */}
      <div className="adm-card">
        <h2 className="adm-card-title">Tendencia de ventas (últimos 14 días)</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={50} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString('es-CO')}`} />
            <Line type="monotone" dataKey="total" name="Ventas" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top productos */}
        <div className="adm-card">
          <h2 className="adm-card-title">Productos más vendidos</h2>
          {topData.length === 0 ? (
            <p className="adm-empty">Sin datos aún</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => `${Number(v)} uds`} />
                <Bar dataKey="cantidad" name="Unidades" fill="#16a34a" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pedidos recientes */}
        <div className="adm-card">
          <h2 className="adm-card-title">Pedidos recientes</h2>
          {stats.recentOrders.length === 0 ? (
            <p className="adm-empty">Sin pedidos aún</p>
          ) : (
            <div>
              {stats.recentOrders.slice(0, 6).map(order => (
                <div key={order.id} className="adm-row" style={{ padding: '12px 0' }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{order.clientName}</p>
                    <p style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{STATUS_LABEL[order.status]}</p>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--on-surface)' }}>${order.total.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
