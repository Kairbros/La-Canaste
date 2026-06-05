import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Category, Product } from '../../types'
import { API } from '../../lib/api'
import { ShoppingCart } from 'lucide-react'

const empty = { name: '', price: '', categoryId: '', image: '', available: true }

export default function ProductsPage() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const load = () => Promise.all([
    fetch(`${API}/products`).then(r => r.json()).then(setProducts),
    fetch(`${API}/categories`).then(r => r.json()).then(setCategories),
  ])

  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...form, price: Number(form.price), categoryId: Number(form.categoryId) }
    if (editing !== null) {
      await fetch(`${API}/products/${editing}`, { method: 'PUT', headers, body: JSON.stringify(body) })
    } else {
      await fetch(`${API}/products`, { method: 'POST', headers, body: JSON.stringify(body) })
    }
    setForm(empty); setEditing(null); setShowForm(false); load()
  }

  const handleEdit = (p: Product) => {
    setForm({ name: p.name, price: String(p.price), categoryId: String(p.categoryId), image: p.image ?? '', available: p.available })
    setEditing(p.id); setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`${API}/products/${id}`, { method: 'DELETE', headers })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="adm-title" style={{ marginBottom: 0 }}>Inventario</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true) }} className="adm-btn">
          + Nuevo producto
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="adm-card" style={{ marginBottom: 24 }}>
          <h2 className="adm-card-title">{editing !== null ? 'Editar producto' : 'Nuevo producto'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="adm-label">Nombre</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="adm-input" />
            </div>
            <div>
              <label className="adm-label">Precio</label>
              <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="adm-input" />
            </div>
            <div>
              <label className="adm-label">Categoría</label>
              <select required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} className="adm-select">
                <option value="">Seleccionar</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="adm-label">URL imagen (opcional)</label>
              <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} className="adm-input" />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 14, color: 'var(--on-surface)' }}>
            <input type="checkbox" checked={form.available} onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
            Disponible
          </label>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
            <button type="button" onClick={() => setShowForm(false)} className="adm-btn-ghost">Cancelar</button>
            <button type="submit" className="adm-btn">{editing !== null ? 'Guardar cambios' : 'Crear producto'}</button>
          </div>
        </form>
      )}

      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th style={{ textAlign: 'right' }}>Precio</th>
              <th style={{ textAlign: 'center' }}>Estado</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr><td colSpan={5} className="adm-empty" style={{ textAlign: 'center' }}>No hay productos aún.</td></tr>
            )}
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="table-product-cell">
                    {p.image
                      ? <img src={p.image} alt={p.name} className="table-product-img" />
                      : <div className="table-product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)' }}><ShoppingCart size={20} /></div>}
                    <span className="table-product-name">{p.name}</span>
                  </div>
                </td>
                <td style={{ color: 'var(--on-surface-variant)' }}>{p.category?.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>${p.price.toLocaleString('es-CO')}</td>
                <td style={{ textAlign: 'center' }}>
                  <span className="adm-pill" style={p.available
                    ? { background: '#e8f5e9', color: '#006e0a' }
                    : { background: '#ffeceb', color: '#ba1a1a' }}>
                    {p.available ? 'Disponible' : 'Agotado'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 14 }}>
                    <button onClick={() => handleEdit(p)} className="adm-link edit">Editar</button>
                    <button onClick={() => handleDelete(p.id)} className="adm-link danger">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
