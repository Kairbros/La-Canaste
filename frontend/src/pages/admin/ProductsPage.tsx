import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Category, Product } from '../../types'

const API = 'http://localhost:4000/api'

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button onClick={() => { setForm(empty); setEditing(null); setShowForm(true) }}
          className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          + Nuevo
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Nombre</label>
            <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Precio</label>
            <input required type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Categoría</label>
            <select required value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
              <option value="">Seleccionar</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-span-2 flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">URL imagen (opcional)</label>
            <input value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))}
              className="border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" id="available" checked={form.available}
              onChange={e => setForm(p => ({ ...p, available: e.target.checked }))} />
            <label htmlFor="available" className="text-sm text-gray-700">Disponible</label>
          </div>
          <div className="col-span-2 flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancelar</button>
            <button type="submit"
              className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              {editing !== null ? 'Guardar cambios' : 'Crear producto'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-right">Precio</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                <td className="px-4 py-3 text-gray-500">{p.category?.name}</td>
                <td className="px-4 py-3 text-right font-semibold">${p.price.toLocaleString('es-CO')}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${p.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {p.available ? 'Disponible' : 'Agotado'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right flex justify-end gap-2">
                  <button onClick={() => handleEdit(p)} className="text-blue-500 hover:text-blue-700 font-medium">Editar</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600 font-medium">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
