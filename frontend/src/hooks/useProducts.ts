import { useEffect, useState } from 'react'
import type { Category, Product } from '../types'
import { API } from '../lib/api'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .finally(() => setLoading(false))
  }, [])

  return { categories, loading }
}

export function useProducts(categoryId?: number) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const url = categoryId
      ? `${API}/products/category/${categoryId}`
      : `${API}/products`
    fetch(url)
      .then(r => r.json())
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [categoryId])

  return { products, loading }
}
