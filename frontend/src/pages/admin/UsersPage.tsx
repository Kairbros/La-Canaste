import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { API } from '../../lib/api'

interface User {
  id: number; name: string; email: string; role: string; phone?: string | null
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  DOMICILIARIO: 'Domiciliario',
  CLIENTE: 'Cliente',
}

const empty = { name: '', email: '', password: '', role: 'DOMICILIARIO', phone: '' }

export default function UsersPage() {
  const { token, user: current } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const auth = { Authorization: `Bearer ${token}` }

  const load = () =>
    fetch(`${API}/users`, { headers: auth }).then(r => r.json()).then(setUsers)

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const res = await fetch(`${API}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...auth },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'No se pudo crear el usuario')
      return
    }
    setForm(empty)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este usuario?')) return
    await fetch(`${API}/users/${id}`, { method: 'DELETE', headers: auth })
    load()
  }

  return (
    <div>
      <h1 className="adm-title">Usuarios</h1>

      {/* Crear usuario */}
      <form onSubmit={handleSubmit} className="adm-card">
        <h2 className="adm-card-title">Nuevo usuario</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <input required placeholder="Nombre" className="adm-input"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input required type="email" placeholder="Correo" className="adm-input"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <input required type="password" placeholder="Contraseña" className="adm-input"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
          <input placeholder="Teléfono (opcional)" className="adm-input"
            value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <select className="adm-select"
            value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
            <option value="DOMICILIARIO">Domiciliario</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: 14, marginTop: 12 }}>{error}</p>}
        <button type="submit" className="adm-btn" style={{ marginTop: 16 }}>Crear usuario</button>
      </form>

      {/* Lista */}
      <div className="adm-card">
        {users.length === 0 && <p className="adm-empty">No hay usuarios.</p>}
        {users.map(u => (
          <div key={u.id} className="adm-row">
            <div>
              <p style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{u.name}</p>
              <p style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="adm-pill" style={{ background: 'var(--surface-container-low)', color: 'var(--on-surface-variant)' }}>
                {ROLE_LABEL[u.role] ?? u.role}
              </span>
              {u.id !== current?.id && (
                <button onClick={() => handleDelete(u.id)} className="adm-link danger">Eliminar</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
