import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Category } from '../../types'
import { API } from '../../lib/api'

export default function CategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = () => fetch(`${API}/categories`).then(r => r.json()).then(setCategories)
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing !== null) {
      await fetch(`${API}/categories/${editing}`, { method: 'PUT', headers, body: JSON.stringify({ name }) })
    } else {
      await fetch(`${API}/categories`, { method: 'POST', headers, body: JSON.stringify({ name }) })
    }
    setName(''); setEditing(null); load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta categoría?')) return
    setError('')
    const res = await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error ?? 'No se pudo eliminar la categoría.')
      return
    }
    load()
  }

  return (
    <div>
      <h1 className="adm-title">Categorías</h1>

      {error && (
        <div style={{ background: '#ffeceb', color: '#ba1a1a', borderRadius: 'var(--rounded-default)', padding: '12px 16px', marginBottom: 16, fontSize: 14, fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div className="adm-card">
        <h2 className="adm-card-title">{editing !== null ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
          <input
            required value={name} onChange={e => setName(e.target.value)}
            placeholder="Nombre de la categoría"
            className="adm-input" style={{ flex: 1 }}
          />
          <button type="submit" className="adm-btn">
            {editing !== null ? 'Guardar' : 'Agregar'}
          </button>
          {editing !== null && (
            <button type="button" onClick={() => { setEditing(null); setName('') }} className="adm-btn-ghost">
              Cancelar
            </button>
          )}
        </form>
      </div>

      <div className="adm-card">
        {categories.length === 0 && <p className="adm-empty">No hay categorías aún.</p>}
        {categories.map(cat => (
          <div key={cat.id} className="adm-row">
            <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{cat.name}</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <button onClick={() => { setEditing(cat.id); setName(cat.name) }} className="adm-link edit">Editar</button>
              <button onClick={() => handleDelete(cat.id)} className="adm-link danger">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
