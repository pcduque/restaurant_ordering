import { ChevronDown, Heart, History, RotateCcw, Settings, ShoppingBag, SlidersHorizontal, UserRound } from 'lucide-react'
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
import { getProductImage } from '../utils/productImages'

const statusLabels: Record<Order['status'], string> = {
  PLACED: 'Processing',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function orderSummary(order: Order) {
  return order.items
    .map((item) => item.productName ?? item.productId)
    .slice(0, 3)
    .join(', ')
}

function primaryImage(order: Order) {
  return getProductImage(order.items[0]?.productId ?? 'loaded-bowl')
}

export function MyOrdersPage() {
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
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
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-64px)] bg-[#f8f1e6] px-5 py-8 sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10">
          <h1 className="font-serif text-4xl font-black leading-tight text-[#11100d] sm:text-5xl">Your Gastronomic Journey</h1>
          <p className="mt-2 text-sm text-[#7b7268]">Revisit your favorite memories and upcoming experiences.</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[285px_1fr]">
          <aside className="h-fit rounded-lg bg-[#eee7dc] p-5 shadow-sm ring-1 ring-[#eadfce]">
            <div className="flex items-center gap-4 border-b border-[#ded1bf] pb-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f3430] text-white">
                <UserRound className="h-7 w-7" />
              </span>
              <div>
                <p className="text-sm font-black text-[#15130f]">{user?.username ?? 'Guest'}</p>
                <p className="mt-1 text-xs text-[#71685d]">Epicurean Member</p>
              </div>
            </div>

            <nav className="mt-3 space-y-1 text-sm font-semibold">
              <Link className="flex items-center justify-between rounded-md bg-[#ff5a00] px-4 py-4 text-[#23140b]" to="/orders">
                <span>Order History</span>
                <History className="h-4 w-4" />
              </Link>
              <Link className="flex items-center justify-between rounded-md px-4 py-4 text-[#4f463d] hover:bg-[#f7efe3]" to="/">
                <span>Saved Dishes</span>
                <Heart className="h-4 w-4" />
              </Link>
              <button className="flex w-full items-center justify-between rounded-md px-4 py-4 text-left text-[#4f463d] hover:bg-[#f7efe3]" type="button">
                <span>Settings</span>
                <Settings className="h-4 w-4" />
              </button>
            </nav>
          </aside>

          <section>
            {orders.length === 0 ? (
              <div className="rounded-lg border border-[#dfd3c5] bg-[#fbf6ec] p-12 text-center shadow-sm">
                <ShoppingBag className="mx-auto h-11 w-11 text-[#a42d08]" />
                <h2 className="mt-4 font-serif text-3xl font-black text-[#17150f]">No orders yet</h2>
                <Link className="mt-6 inline-flex rounded-md bg-[#ff5a00] px-6 py-3 text-sm font-bold text-[#23140b]" to="/">
                  Start ordering
                </Link>
              </div>
            ) : (
              <div className="space-y-7">
                {orders.map((order) => {
                  const shortOrderId = order.orderId.slice(0, 8).toUpperCase()
                  const isActive = !['COMPLETED', 'CANCELLED'].includes(order.status)

                  return (
                    <article
                      className="grid overflow-hidden rounded-lg border border-[#e5d9c9] bg-[#fbf6ec] shadow-[0_4px_16px_rgba(35,26,14,0.08)] md:h-[220px] md:grid-cols-[300px_1fr]"
                      key={order.orderId}
                    >
                      <img className="h-56 w-full object-cover md:h-[220px]" src={primaryImage(order)} alt={orderSummary(order) || 'Order'} />
                      <div className="flex min-h-56 flex-col justify-between p-5 md:h-[220px] md:min-h-0">
                        <div>
                          <div className="mb-2 flex items-start justify-between gap-4">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#ebe3d6] px-3 py-1 text-xs font-bold text-[#6d5942]">
                              <SlidersHorizontal className="h-3 w-3" />
                              {statusLabels[order.status]}
                            </span>
                            <span className="text-base font-black text-[#c13f08]">{formatMoney(order.pricing.totalCents)}</span>
                          </div>
                          <h2 className="font-serif text-xl font-black leading-none text-[#11100d] sm:text-2xl">
                            Order <span className="font-light">#{shortOrderId}</span>
                          </h2>
                          <p className="mt-1 text-sm text-[#635b52]">{formatDateTime(order.createdAt)}</p>
                          <p className="mt-5 text-sm text-[#4d463f]">{orderSummary(order) || 'Standard preparation'}</p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-[#e5d8c8] pt-4">
                          <Link className="text-sm font-bold text-[#c13f08] hover:text-[#8d2d04]" to={`/orders/${order.orderId}`}>
                            View Details
                          </Link>
                          {isActive ? (
                            <Link className="rounded-md bg-[#5a5b61] px-5 py-2 text-sm font-black text-white hover:bg-[#3f4045]" to={`/orders/${order.orderId}`}>
                              Track Status
                            </Link>
                          ) : (
                            <Link className="inline-flex items-center gap-2 rounded-md bg-[#ff5a00] px-5 py-2 text-sm font-black text-[#23140b] hover:bg-[#ef5200]" to="/">
                              <RotateCcw className="h-4 w-4" />
                              Reorder
                            </Link>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}

            <div className="mt-16 flex flex-col items-center text-sm text-[#4d463f]">
              <span>Discover more history</span>
              <ChevronDown className="mt-3 h-5 w-5 text-[#c13f08]" />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
