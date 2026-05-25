import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getOrder, getOrderTimeline } from '../api/orders.api'
import { PricingSummary } from '../components/cart/PricingSummary'
import { StatusBadge } from '../components/timeline/StatusBadge'
import { TimelineList } from '../components/timeline/TimelineList'
import { Card } from '../components/ui/Card'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import type { Order } from '../types/order.types'
import type { TimelineEvent } from '../types/timeline.types'
import { formatDateTime } from '../utils/date'

export function OrderStatusPage() {
  const { orderId = '' } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const loadOrder = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [orderResponse, timelineResponse] = await Promise.all([getOrder(orderId), getOrderTimeline(orderId)])
      setOrder(orderResponse)
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

  useEffect(() => {
    void loadOrder()
  }, [loadOrder])

  if (loading) {
    return <Spinner />
  }

  if (error || !order) {
    return <ErrorState message={error || 'Order was not found'} onRetry={loadOrder} />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-6">
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">Order accepted</p>
              <h1 className="mt-2 break-all text-2xl font-black text-slate-950 sm:text-4xl">{order.orderId}</h1>
              <p className="mt-2 text-sm text-slate-500">Created {formatDateTime(order.createdAt)}</p>
            </div>
            <StatusBadge status={order.status} />
          </div>
        </Card>

        <TimelineList events={events} nextCursor={nextCursor} loadingMore={loadingMore} onLoadMore={loadMore} />
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <h2 className="text-lg font-black text-slate-950">Order summary</h2>
          <p className="mt-1 text-sm text-slate-500">User: {order.userId}</p>
          <div className="mt-4 space-y-3">
            {order.items.map((item, index) => (
              <div key={`${item.productId}-${index}`} className="rounded-[8px] bg-orange-50 p-3">
                <p className="font-bold text-slate-950">{item.productName ?? item.productId}</p>
                <p className="text-sm text-slate-600">Quantity: {item.quantity}</p>
              </div>
            ))}
          </div>
        </Card>
        <PricingSummary pricing={order.pricing} />
      </aside>
    </div>
  )
}
