import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { Category } from '../../types'

const API = 'http://localhost:4000/api'

export default function CategoriesPage() {
  const { token } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [editing, setEditing] = useState<number | null>(null)

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
    await fetch(`${API}/categories/${id}`, { method: 'DELETE', headers })
    load()
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800">Categorías</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-4 flex gap-3">
        <input
          required value={name} onChange={e => setName(e.target.value)}
          placeholder="Nombre de la categoría"
          className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button type="submit" className="bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl">
          {editing !== null ? 'Guardar' : 'Agregar'}
        </button>
        {editing !== null && (
          <button type="button" onClick={() => { setEditing(null); setName('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2">Cancelar</button>
        )}
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {categories.length === 0 && <p className="text-gray-400 text-sm p-4">No hay categorías aún.</p>}
        <ul className="divide-y divide-gray-50">
          {categories.map(cat => (
            <li key={cat.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-gray-800">{cat.name}</span>
              <div className="flex gap-3">
                <button onClick={() => { setEditing(cat.id); setName(cat.name) }}
                  className="text-sm text-blue-500 hover:text-blue-700 font-medium">Editar</button>
                <button onClick={() => handleDelete(cat.id)}
                  className="text-sm text-red-400 hover:text-red-600 font-medium">Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
