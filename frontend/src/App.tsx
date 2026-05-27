import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import CatalogPage from './pages/CatalogPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/admin/LoginPage'
import AdminLayout from './components/admin/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import ProductsPage from './pages/admin/ProductsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import OrdersPage from './pages/admin/OrdersPage'

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Tienda */}
            <Route path="/" element={<CatalogPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Admin */}
            <Route path="/admin/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
              <Route index element={<DashboardPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<OrdersPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
