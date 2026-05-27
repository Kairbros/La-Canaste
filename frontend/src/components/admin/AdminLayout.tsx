import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/admin', label: '📊 Dashboard', end: true },
  { to: '/admin/products', label: '📦 Productos' },
  { to: '/admin/categories', label: '🗂 Categorías' },
  { to: '/admin/orders', label: '📋 Pedidos' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/admin/login') }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white shadow-md flex flex-col shrink-0">
        <div className="p-4 border-b">
          <p className="font-bold text-green-600 text-lg">🛒 Admin</p>
          <p className="text-xs text-gray-400 truncate">{user?.name}</p>
        </div>
        <nav className="flex flex-col p-3 gap-1 flex-1">
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to} end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="m-3 text-sm text-gray-400 hover:text-red-500 text-left px-3 py-2">
          Cerrar sesión
        </button>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
