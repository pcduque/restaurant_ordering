import { Bike, Check, ConciergeBell, Home, Search, ShoppingBag, UserRound, Utensils } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getOrder, getOrderTimeline, updateOrderStatus } from '../api/orders.api'
import { OrderNotFoundScreen } from '../components/orders/OrderNotFoundScreen'
import { TimelineList } from '../components/timeline/TimelineList'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/auth.store'
import type { Order, OrderStatus } from '../types/order.types'
import type { TimelineEvent } from '../types/timeline.types'
import { formatDateTime } from '../utils/date'
import { formatMoney } from '../utils/money'
import { getProductImage } from '../utils/productImages'

const orderStatuses: OrderStatus[] = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']

const statusLabels: Record<OrderStatus, string> = {
  PLACED: 'Placed',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const stepOrder: OrderStatus[] = ['PLACED', 'PREPARING', 'READY', 'COMPLETED']

function getStepState(stepStatus: OrderStatus, currentStatus: OrderStatus) {
  if (currentStatus === 'CANCELLED') {
    return stepStatus === 'PLACED' ? 'done' : 'pending'
  }

  const currentIndex = stepOrder.indexOf(currentStatus === 'CONFIRMED' ? 'PLACED' : currentStatus)
  const stepIndex = stepOrder.indexOf(stepStatus)
  if (stepIndex < currentIndex) {
    return 'done'
  }
  if (stepIndex === currentIndex) {
    return currentStatus === 'COMPLETED' ? 'done' : 'active'
  }
  return 'pending'
}

function getTrackingSteps(currentStatus: OrderStatus) {
  return [
  {
    title: 'Order Received',
    description: 'Confirmed and sent to the kitchen.',
    state: getStepState('PLACED', currentStatus),
    Icon: Check,
  },
  {
    title: 'Kitchen Preparing',
    description: 'Chef Antoine is crafting your signature dishes.',
    state: getStepState('PREPARING', currentStatus),
    Icon: Utensils,
  },
  {
    title: 'Out for Delivery',
    description: currentStatus === 'READY' ? 'Ready for pickup or delivery.' : 'Waiting for pickup...',
    state: getStepState('READY', currentStatus),
    Icon: Bike,
  },
  {
    title: 'Delivered',
    description: 'Enjoy your gastronomic experience.',
    state: getStepState('COMPLETED', currentStatus),
    Icon: Home,
  },
]
}

export function OrderStatusPage() {
  const { orderId = '' } = useParams()
  const token = useAuthStore((state) => state.token)
  const [order, setOrder] = useState<Order | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('PLACED')
  const [error, setError] = useState('')

  const loadOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [orderResponse, timelineResponse] = await Promise.all([getOrder(orderId), getOrderTimeline(orderId)])
      setOrder(orderResponse)
      setSelectedStatus(orderResponse.status)
      setEvents(timelineResponse.items)
      setNextCursor(timelineResponse.nextCursor)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [orderId])

  async function loadMore() {
    if (!nextCursor) {
      return
    }

    setLoadingMore(true)
    try {
      const page = await getOrderTimeline(orderId, nextCursor)
      setEvents((current) => [...current, ...page.items])
      setNextCursor(page.nextCursor)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  async function saveStatus() {
    if (!order || selectedStatus === order.status) {
      return
    }

    setSavingStatus(true)
    setError('')
    try {
      const updatedOrder = await updateOrderStatus(order.orderId, selectedStatus)
      const timelineResponse = await getOrderTimeline(order.orderId)
      setOrder(updatedOrder)
      setSelectedStatus(updatedOrder.status)
      setEvents(timelineResponse.items)
      setNextCursor(timelineResponse.nextCursor)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSavingStatus(false)
    }
  }

  useEffect(() => {
    if (token) {
      void loadOrder()
    }
  }, [loadOrder, token])

  if (!token) {
    return <Navigate to={`/login?redirectTo=/orders/${orderId}`} replace />
  }

  if (loading) {
    return <Spinner />
  }

  if (error || !order) {
    return <OrderNotFoundScreen onRetry={() => void loadOrder()} />
  }

  const shortOrderId = order.orderId.slice(0, 5).toUpperCase()
  const trackingSteps = getTrackingSteps(order.status)
  return (
    <div className="-mx-4 -mt-8 bg-[#f7f1e6] sm:-mx-8 lg:-mx-10">
      <header className="border-b border-[#e6ddd0] bg-[#f7f1e6]/95 px-6 py-8 shadow-sm sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
          <Link to="/" className="font-serif text-3xl font-black text-[#a42d08]">
            SunDevs Restaurant Ordering
          </Link>
          <nav className="hidden items-center gap-10 text-xl text-[#4f4a45] md:flex">
            <Link to="/">Menu</Link>
            <Link to="/orders">Orders</Link>
            <span>About</span>
          </nav>
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-3 rounded-full border border-[#ddb9a7] px-6 py-4 text-lg text-[#687086] lg:flex">
              <Search className="h-5 w-5 text-[#4f4a45]" />
              Search orders...
            </div>
            <ShoppingBag className="h-6 w-6 text-[#4f4a45]" />
            <UserRound className="h-6 w-6 text-[#4f4a45]" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 sm:px-10">
        <div className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-6xl font-black text-[#17150f]">
              Order <span className="font-light">#{shortOrderId}</span>
            </h1>
            <p className="mt-4 text-2xl text-[#5f5a54]">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="self-start rounded-full bg-[#ff5a00] px-8 py-4 text-sm font-black uppercase tracking-wide text-[#17150f] lg:self-auto">
            Estimated delivery: 8:25 PM
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <section className="space-y-8">
            <div className="rounded-[28px] bg-[#f1ede4] p-10 sm:p-14">
              <h2 className="font-serif text-3xl font-black text-[#17150f]">Live Tracking</h2>
              <div className="relative mt-12 space-y-14 before:absolute before:left-[29px] before:top-12 before:h-[calc(100%-6rem)] before:w-px before:bg-[#ded7cd]">
                {trackingSteps.map((step, index) => {
                  const Icon = step.Icon
                  const active = step.state === 'active'
                  const done = step.state === 'done'
                  return (
                    <div key={step.title} className="relative flex gap-8">
                      <div
                        className={`z-10 flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-full ${
                          done ? 'bg-[#a42d08] text-white' : active ? 'bg-[#ff5a00] text-[#5f1c00]' : 'border border-[#d9b5a5] bg-[#f7f1e6] text-[#7c6256]'
                        }`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className={step.state === 'pending' ? 'text-[#a99b91]' : ''}>
                        <h3 className={`font-serif text-3xl ${active ? 'text-[#a42d08]' : 'text-[#17150f]'}`}>{step.title}</h3>
                        <p className="mt-3 max-w-xs text-xl leading-8 text-[#5f5a54]">{step.description}</p>
                        {index === 0 ? <p className="mt-3 text-sm text-[#4f4a45]">{formatDateTime(order.createdAt)}</p> : null}
                        {active ? (
                          <div className="mt-6 flex gap-3">
                            <span className="h-1 w-10 rounded-full bg-[#a42d08]" />
                            <span className="h-1 w-10 rounded-full bg-[#dfc6b7]" />
                            <span className="h-1 w-10 rounded-full bg-[#dfc6b7]" />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <TimelineList events={events} nextCursor={nextCursor} loadingMore={loadingMore} onLoadMore={loadMore} variant="audit" />
          </section>

          <aside className="space-y-8">
            <div className="rounded-[24px] border border-[#dfd3c5] bg-[#eeeadf] p-9">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="font-serif text-3xl font-black text-[#17150f]">Order Details</h2>
                  <p className="mt-2 text-sm font-bold uppercase text-[#a42d08]">Current status: {statusLabels[order.status]}</p>
                </div>
                <div className="flex flex-col gap-3">
                  <select
                    className="rounded-md border border-[#d7b9a8] bg-[#fbf6ec] px-3 py-2 text-sm font-bold text-[#17150f]"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    className="rounded-md bg-[#ff5a00] px-4 py-2 text-sm font-black text-[#23140b] transition hover:bg-[#ef5200] disabled:cursor-not-allowed disabled:opacity-60"
                    type="button"
                    disabled={savingStatus || selectedStatus === order.status}
                    onClick={saveStatus}
                  >
                    {savingStatus ? 'Updating...' : 'Change status'}
                  </button>
                </div>
              </div>
              <div className="mt-8 space-y-8">
                {order.items.map((item, index) => {
                  const line = order.pricing.items?.[index]
                  return (
                    <div key={`${item.productId}-${index}`} className="flex gap-5">
                      <img className="h-24 w-24 rounded-[18px] object-cover" src={getProductImage(item.productId)} alt={item.productName ?? item.productId} />
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-serif text-2xl text-[#17150f]">{item.productName ?? line?.name ?? item.productId}</h3>
                          <span className="text-2xl font-bold text-[#a42d08]">{formatMoney(line?.lineTotalCents ?? 0)}</span>
                        </div>
                        <p className="mt-2 text-sm text-[#6d665f]">
                          {item.selectedModifiers?.flatMap((modifier) => modifier.options.map((option) => option.name)).join(', ') || 'Standard preparation'}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-9 border-t border-[#d7b9a8] pt-8 text-xl">
                <div className="flex justify-between text-[#5f5a54]">
                  <span>Subtotal</span>
                  <span>{formatMoney(order.pricing.subtotalCents)}</span>
                </div>
                <div className="mt-5 flex justify-between text-[#5f5a54]">
                  <span>Service Fee</span>
                  <span>{formatMoney(order.pricing.serviceFeeCents)}</span>
                </div>
                <div className="mt-7 flex justify-between font-serif text-3xl text-[#17150f]">
                  <span>Total</span>
                  <span className="text-[#a42d08]">{formatMoney(order.pricing.totalCents)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-[#dfd3c5] bg-[#eeeadf] p-9">
              <div className="flex gap-7">
                <div className="flex h-20 w-12 shrink-0 items-center justify-center rounded-[18px] bg-[#dedbd5] text-[#6d665f]">
                  <ConciergeBell className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl text-[#17150f]">Need Assistance?</h3>
                  <p className="mt-2 text-xl leading-8 text-[#5f5a54]">Contact our concierge for help with your order.</p>
                  <button className="mt-5 text-lg font-bold uppercase text-[#a42d08]" type="button">
                    Chat now →
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="mt-20 border-t border-[#dfd3c5] bg-[#e7e1d7] px-6 py-14 sm:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_180px_180px]">
          <div>
            <h2 className="font-serif text-3xl font-black text-[#a42d08]">SunDevs Restaurant Ordering</h2>
            <p className="mt-4 max-w-sm text-xl leading-8 text-[#5f5a54]">Refining the art of digital dining with precision, warmth, and flavor.</p>
          </div>
          <div className="space-y-4 text-xl text-[#5f5a54]">
            <h3 className="font-bold text-[#17150f]">Navigation</h3>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
          <div className="space-y-4 text-xl text-[#5f5a54]">
            <h3 className="font-bold text-[#17150f]">Connect</h3>
            <p>Contact Us</p>
            <p>Locations</p>
          </div>
        </div>
        <p className="mt-12 text-center text-sm text-[#6d665f]">© 2026 SunDevs Restaurant Ordering. All rights reserved.</p>
      </footer>
    </div>
  )
}
