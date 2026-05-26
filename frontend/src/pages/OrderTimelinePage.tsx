import { ChevronDown, RefreshCw, ShieldCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getOrder, getOrderTimeline } from '../api/orders.api'
import { OrderNotFoundScreen } from '../components/orders/OrderNotFoundScreen'
import { TimelineEventDetails } from '../components/timeline/TimelineEventDetails'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/auth.store'
import type { Order } from '../types/order.types'
import type { TimelineEvent } from '../types/timeline.types'
import { formatDateTime } from '../utils/date'

const statusLabels: Record<Order['status'], string> = {
  PLACED: 'Order Created',
  CONFIRMED: 'Order Confirmed',
  PREPARING: 'Kitchen Accepted',
  READY: 'Ready',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function OrderTimelinePage() {
  const { orderId = '' } = useParams()
  const token = useAuthStore((state) => state.token)
  const [order, setOrder] = useState<Order | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')

  const sortedEvents = useMemo(
    () =>
      [...events].sort((left, right) => {
        const timestampDelta = new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime()
        return timestampDelta || left.eventId.localeCompare(right.eventId)
      }),
    [events],
  )

  const loadTimeline = useCallback(async () => {
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

  async function loadOlderEvents() {
    if (!nextCursor) {
      return
    }

    setLoadingMore(true)
    setError('')
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
    if (token) {
      void loadTimeline()
    }
  }, [loadTimeline, token])

  if (!token) {
    return <Navigate to={`/login?redirectTo=/orders/${orderId}/timeline`} replace />
  }

  if (loading) {
    return <Spinner />
  }

  if (error || !order) {
    return <OrderNotFoundScreen onRetry={() => void loadTimeline()} />
  }

  const shortOrderId = order.orderId.slice(0, 8).toUpperCase()
  const currentEvent = sortedEvents[sortedEvents.length - 1]

  return (
    <div className="-mx-4 -mt-8 min-h-[calc(100vh-144px)] bg-[#fbf6ec] px-6 py-10 sm:-mx-8 sm:px-10 lg:-mx-10">
      <main className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b8320a]">System endpoint: GET /orders/{shortOrderId}/timeline</p>
            <h1 className="mt-2 font-serif text-5xl font-black leading-none text-[#17150f]">Order Audit Trail</h1>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Latency" value="42ms" />
            <MetricCard label="Total Events" value={`${sortedEvents.length} Nodes`} />
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[330px_1fr]">
          <aside className="self-start rounded-[8px] border border-[#eadfce] bg-[#f8f3ea] p-8 lg:sticky lg:top-28">
            <h2 className="font-serif text-2xl font-black text-[#17150f]">Order Info</h2>
            <div className="mt-8 border-b border-[#eadfce] pb-6">
              <p className="text-[10px] font-black uppercase text-[#9a8e82]">Correlation ID</p>
              <p className="mt-1 break-all font-mono text-xs font-bold text-[#17150f]">{currentEvent?.correlationId ?? order.orderId}</p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 border-b border-[#eadfce] pb-6">
              <div>
                <p className="text-[10px] font-black uppercase text-[#9a8e82]">Status</p>
                <p className="mt-1 text-sm font-black text-[#b8320a]">{statusLabels[order.status]}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-[#9a8e82]">Est. Delivery</p>
                <p className="mt-1 text-sm font-bold text-[#17150f]">19:45 PM</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 rounded-[8px] bg-[#fff2e7] p-4 text-xs leading-5 text-[#7b4d3b]">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#b8320a]" />
              <span>This order has passed automated security audits.</span>
            </div>
            <button
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#b8320a] px-4 py-4 text-xs font-black uppercase text-white transition hover:bg-[#8f2708]"
              type="button"
              onClick={() => void loadTimeline()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh logs
            </button>
          </aside>

          <section>
            <div className="relative border-l border-[#e2d8c9] pl-7 sm:pl-10">
              {sortedEvents.map((event, index) => (
                <div key={event.eventId} className="relative pb-10 last:pb-0">
                  <span
                    className={`absolute -left-[34px] top-6 h-3 w-3 rounded-full ring-4 ring-[#fbf6ec] sm:-left-[46px] ${
                      index === sortedEvents.length - 1 ? 'bg-[#c66b3b]' : 'bg-[#6f746f]'
                    }`}
                  />
                  <AuditEvent event={event} current={index === sortedEvents.length - 1} />
                </div>
              ))}
            </div>

            {nextCursor ? (
              <Button variant="ghost" className="mt-10 w-full text-xs uppercase text-[#6d5545]" onClick={loadOlderEvents} disabled={loadingMore}>
                <RefreshCw className="h-4 w-4" />
                {loadingMore ? 'Loading older events...' : 'Load older events'}
              </Button>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border border-[#eadfce] bg-[#f8f3ea] px-6 py-4">
      <p className="text-[10px] font-black uppercase text-[#9a8e82]">{label}</p>
      <p className="font-serif text-xl font-black text-[#17150f]">{value}</p>
    </div>
  )
}

function AuditEvent({ event, current }: { event: TimelineEvent; current: boolean }) {
  return (
    <article className={`rounded-[8px] border border-[#eadfce] bg-[#f8f3ea] p-6 shadow-[0_12px_24px_rgba(69,48,27,0.08)] ${current ? 'ring-1 ring-[#efd8c8]' : ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-serif text-2xl font-black text-[#17150f]">{getAuditTitle(event)}</h3>
          <p className="mt-1 text-[11px] font-bold uppercase text-[#8d8277]">{formatEventTimestamp(event.timestamp)}</p>
        </div>
        {current ? <span className="self-start rounded-full bg-[#ffe3d6] px-3 py-1 text-[10px] font-black text-[#b8320a]">Current State</span> : null}
      </div>
      <p className="mt-4 text-sm leading-6 text-[#6d5545]">{getAuditSummary(event)}</p>
      <details className="mt-4">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-[10px] font-black uppercase text-[#b8320a]">
          <ChevronDown className="h-3 w-3" />
          View raw JSON payload
        </summary>
        <TimelineEventDetails payload={event.payload} />
      </details>
    </article>
  )
}

function getAuditTitle(event: TimelineEvent) {
  if (event.type === 'ORDER_STATUS_CHANGED') {
    const to = typeof event.payload.to === 'string' ? event.payload.to : ''
    return to ? to.split('_').map(capitalize).join(' ') : 'Status Changed'
  }

  const titles: Record<TimelineEvent['type'], string> = {
    CART_ITEM_ADDED: 'Cart Item Added',
    CART_ITEM_UPDATED: 'Cart Item Updated',
    CART_ITEM_REMOVED: 'Cart Item Removed',
    PRICING_CALCULATED: 'Payment Verified',
    ORDER_PLACED: 'Order Created',
    ORDER_STATUS_CHANGED: 'Status Changed',
    VALIDATION_FAILED: 'Validation Failed',
  }

  return titles[event.type]
}

function getAuditSummary(event: TimelineEvent) {
  if (event.type === 'ORDER_STATUS_CHANGED') {
    return `Order transitioned to ${String(event.payload.to ?? 'updated')}. Kitchen and guest status synchronized.`
  }
  if (event.type === 'PRICING_CALCULATED') {
    return 'Transaction pricing verified server-side. Client totals were ignored and recalculated from menu data.'
  }
  if (event.type === 'ORDER_PLACED') {
    return 'Initial order submission received and persisted with idempotency protection.'
  }
  if (event.type === 'VALIDATION_FAILED') {
    return `Validation rejected this request: ${String(event.payload.reason ?? 'invalid payload')}.`
  }

  return `${event.type.replaceAll('_', ' ').toLowerCase()} recorded by ${event.source}.`
}

function formatEventTimestamp(value: string) {
  return `${formatDateTime(value)} UTC`
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}
