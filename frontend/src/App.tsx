import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { CartPage } from './pages/CartPage'
import { AuthPage } from './pages/AuthPage'
import { MenuPage } from './pages/MenuPage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { OrderStatusPage } from './pages/OrderStatusPage'
import { ProductDetailPage } from './pages/ProductDetailPage'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<MenuPage />} />
        <Route path="login" element={<AuthPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="products/:productId" element={<ProductDetailPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="orders/:orderId" element={<OrderStatusPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
