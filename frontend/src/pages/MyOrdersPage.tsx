import { History, ShoppingBag } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { listOrders } from '../api/orders.api'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/auth.store'
import type { Order } from '../types/order.types'
import { formatDateTime } from '../utils/date'
import { formatMoney } from '../utils/money'

export function MyOrdersPage() {
  const token = useAuthStore((state) => state.token)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setOrders(await listOrders())
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      void loadOrders()
    }
  }, [loadOrders, token])

  if (!token) {
    return <Navigate to="/login?redirectTo=/orders" replace />
  }

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadOrders} />
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-[#a42d08]">Account</p>
          <h1 className="mt-2 font-serif text-5xl font-black text-[#17150f]">My orders</h1>
        </div>
        <History className="hidden h-10 w-10 text-[#a42d08] sm:block" />
      </div>

      {orders.length === 0 ? (
        <div className="rounded-[24px] border border-[#dfd3c5] bg-[#eeeadf] p-10 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-[#a42d08]" />
          <h2 className="mt-4 font-serif text-3xl font-black text-[#17150f]">No orders yet</h2>
          <Link className="mt-6 inline-flex rounded-full bg-[#17150f] px-6 py-3 text-sm font-bold text-white" to="/">
            Start ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              className="grid gap-4 rounded-[18px] border border-[#dfd3c5] bg-[#eeeadf] p-6 transition hover:border-[#a42d08] sm:grid-cols-[1fr_auto]"
              key={order.orderId}
              to={`/orders/${order.orderId}`}
            >
              <div>
                <p className="text-sm font-black uppercase text-[#a42d08]">#{order.orderId.slice(0, 8).toUpperCase()}</p>
                <h2 className="mt-2 font-serif text-2xl font-black text-[#17150f]">{order.status}</h2>
                <p className="mt-2 text-[#5f5a54]">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold uppercase text-[#5f5a54]">{order.items.length} item(s)</p>
                <p className="mt-2 text-2xl font-black text-[#17150f]">{formatMoney(order.pricing.totalCents)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
