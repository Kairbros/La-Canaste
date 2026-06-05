export interface Category {
  id: number
  name: string
  products?: Product[]
}

export interface Product {
  id: number
  name: string
  price: number
  image?: string
  available: boolean
  categoryId: number
  category?: Category
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Config {
  id: number
  coverageRadius: number
  storeLat: number
  storeLng: number
}
