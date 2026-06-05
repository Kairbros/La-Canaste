import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Package, Tags, ClipboardList, MapPin, Users, ShoppingCart, Menu, X } from 'lucide-react'

const links = [
  { to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Inventario', Icon: Package },
  { to: '/admin/categories', label: 'Categorías', Icon: Tags },
  { to: '/admin/orders', label: 'Pedidos', Icon: ClipboardList },
  { to: '/admin/coverage', label: 'Cobertura', Icon: MapPin },
  { to: '/admin/users', label: 'Usuarios', Icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/admin/login') }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-layout">
      {/* Overlay para mobile */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div className="brand" style={{ marginBottom: 0 }}>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={22} /> La Canasta</h1>
            <span>Administración Central</span>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={closeSidebar}
            aria-label="Cerrar menú"
          >
            <X size={22} />
          </button>
        </div>

        <nav style={{ flexGrow: 1 }}>
          <ul className="sidebar-menu">
            {links.map(l => (
              <li key={l.to} className="sidebar-menu-item">
                <NavLink
                  to={l.to} end={l.end}
                  onClick={closeSidebar}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                    borderRadius: 'var(--rounded-default)', fontWeight: isActive ? 600 : 500, fontSize: 15,
                    color: isActive ? 'var(--primary)' : 'var(--on-surface)',
                    backgroundColor: isActive ? 'var(--surface-container-low)' : 'transparent',
                    borderRight: isActive ? '4px solid var(--primary)' : '4px solid transparent',
                  })}
                >
                  <l.Icon size={18} />{l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div style={{ padding: '8px 4px' }}>
            <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--on-surface)' }}>{user?.name}</p>
            <p className="admin-user-role">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '12px 16px', color: 'var(--on-surface-variant)', fontSize: 15, fontWeight: 600 }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="admin-main">
        <div className="admin-mobile-header">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={22} />
          </button>
        </div>
        <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
