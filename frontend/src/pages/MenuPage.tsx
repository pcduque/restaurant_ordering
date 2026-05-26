import { Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '../api/client'
import { getMenu } from '../api/menu.api'
import { getMyTimeline } from '../api/timeline.api'
import { CartDrawer } from '../components/cart/CartDrawer'
import { ProductCreateModal } from '../components/menu/ProductCreateModal'
import { ProductCustomizeModal } from '../components/menu/ProductCustomizeModal'
import { ProductGrid } from '../components/menu/ProductGrid'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useAuthStore } from '../store/auth.store'
import { useCartStore } from '../store/cart.store'
import type { Product } from '../types/menu.types'
import type { TimelineEvent, TimelineEventType } from '../types/timeline.types'

const eventAliases: Record<TimelineEventType, string> = {
  CART_ITEM_ADDED: 'cart.item_added',
  CART_ITEM_UPDATED: 'cart.item_updated',
  CART_ITEM_REMOVED: 'cart.item_removed',
  PRICING_CALCULATED: 'server.recalculate',
  ORDER_PLACED: 'order.placed',
  ORDER_STATUS_CHANGED: 'order.status_changed',
  VALIDATION_FAILED: 'validation.failed',
}

const eventPrefixes: Record<TimelineEventType, string> = {
  CART_ITEM_ADDED: 'EVENT',
  CART_ITEM_UPDATED: 'EVENT',
  CART_ITEM_REMOVED: 'EVENT',
  PRICING_CALCULATED: 'PRICE',
  ORDER_PLACED: 'ORDER',
  ORDER_STATUS_CHANGED: 'STATUS',
  VALIDATION_FAILED: 'ERROR',
}

function formatEventTime(timestamp: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(timestamp))
}

function formatEventPayload(event: TimelineEvent) {
  const payload: Record<string, unknown> = { order_id: event.orderId.slice(0, 8) }

  if (event.type === 'PRICING_CALCULATED' && typeof event.payload.pricing === 'object' && event.payload.pricing !== null) {
    const pricing = event.payload.pricing as Record<string, unknown>
    payload.subtotal = pricing.subtotalCents
    payload.tax = pricing.taxCents
    payload.service_fee = pricing.serviceFeeCents
    payload.total = pricing.totalCents
  } else {
    Object.assign(payload, event.payload)
  }

  return JSON.stringify(payload).replace(/"([^"]+)":/g, '$1:')
}

export function MenuPage() {
  const navigate = useNavigate()
  const token = useAuthStore((state) => state.token)
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [creatingProduct, setCreatingProduct] = useState(false)
  const [auditEvents, setAuditEvents] = useState<TimelineEvent[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditError, setAuditError] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  const loadMenu = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await getMenu())
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const loadAuditEvents = useCallback(async () => {
    if (!token) {
      setAuditEvents([])
      setAuditError('')
      return
    }

    setAuditLoading(true)
    setAuditError('')
    try {
      const page = await getMyTimeline(6)
      setAuditEvents(page.items)
    } catch (err) {
      setAuditError(getApiErrorMessage(err))
      setAuditEvents([])
    } finally {
      setAuditLoading(false)
    }
  }, [token])

  useEffect(() => {
    void loadMenu()
  }, [loadMenu])

  useEffect(() => {
    void loadAuditEvents()
  }, [loadAuditEvents])

  function handleAdd(product: Product) {
    if (product.modifierGroups.length > 0) {
      setSelectedProduct(product)
      return
    }

    addItem({ product, quantity: 1, selectedModifiers: [] })
  }

  const signatureProducts = products.slice(0, 4)
  const smallPlates = products.slice(4)

  return (
    <div className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="min-w-0">
        <div
          className="relative mb-14 min-h-[420px] overflow-hidden rounded-[18px] bg-[#11140f] shadow-[0_28px_70px_rgba(69,48,27,0.22)] sm:mb-20 sm:min-h-[500px] sm:rounded-[24px]"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(5,7,6,0.96), rgba(5,7,6,0.64), rgba(5,7,6,0.96)), url(/images/loaded_bowl.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(177,80,30,0.24),transparent_34rem)]" />
          <div className="relative flex min-h-[420px] flex-col items-center justify-center px-5 py-12 text-center text-white sm:min-h-[500px] sm:px-8 sm:py-16">
            <p className="text-xs font-black uppercase text-[#c84a18] sm:text-sm">The modern epicurean experience</p>
            <h1 className="mt-5 max-w-4xl font-serif text-4xl font-black leading-none sm:mt-6 sm:text-6xl lg:text-7xl">
              Build the order,
              <br />
              <span className="italic">verify the audit trail.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-[#fff4e0] sm:mt-7 sm:text-lg sm:leading-8">
              Browse the menu, customize dishes, price the cart server-side, and inspect every order event after checkout.
            </p>
          </div>
        </div>

        {loading ? <Spinner /> : null}
        {error ? <ErrorState message={error} onRetry={loadMenu} /> : null}
        {!loading && !error ? (
          <>
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <h2 className="font-serif text-3xl font-black text-[#17150f] sm:text-4xl">Signature Dishes</h2>
              <div className="hidden h-px flex-1 bg-[#e7dece] sm:block" />
              <Button onClick={() => setCreatingProduct(true)} className="w-full shrink-0 bg-[#b8320a] text-base hover:bg-[#8f2708] sm:w-auto">
                <Plus className="h-5 w-5" />
                Add product
              </Button>
            </div>
            <ProductGrid products={signatureProducts} onAdd={handleAdd} onOpen={(product) => navigate(`/products/${product.id}`)} />

            {token ? (
              <section className="mt-28">
                <div className="mb-8 flex items-center gap-5">
                  <h2 className="font-serif text-2xl font-black text-[#17150f]">Event Audit Trail</h2>
                  <div className="h-px flex-1 bg-[#e7dece]" />
                  <span className="hidden text-xs font-bold uppercase text-[#b8b0a2] sm:inline">Live server stream</span>
                </div>
                <div className="overflow-x-auto rounded-[8px] border border-[#eadfce] bg-white p-6 font-mono text-sm shadow-sm">
                  <div className="mb-5 flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-red-200" />
                    <span className="h-2 w-2 rounded-full bg-yellow-200" />
                    <span className="h-2 w-2 rounded-full bg-green-200" />
                  </div>

                  {auditLoading ? <p className="text-[#9d978b]">loading authenticated events ...</p> : null}
                  {auditError ? <p className="text-[#c84a18]">{auditError}</p> : null}
                  {!auditLoading && !auditError && auditEvents.length === 0 ? <p className="text-[#9d978b]">no events recorded for this user yet ...</p> : null}
                  {!auditLoading && !auditError
                    ? auditEvents.map((event) => (
                        <p className="mt-3 whitespace-nowrap first:mt-0" key={event.eventId}>
                          <span className="text-[#c84a18]">{eventPrefixes[event.type]}</span> {formatEventTime(event.timestamp)}{' '}
                          <span className="text-blue-600">{eventAliases[event.type]}</span> {formatEventPayload(event)}
                        </p>
                      ))
                    : null}
                  {!auditLoading && !auditError && auditEvents.length > 0 ? <p className="mt-3 pl-10 text-[#9d978b]">listening for interactions ...</p> : null}
                </div>
              </section>
            ) : null}

            <section className="mt-28">
              <div className="mb-8 flex items-center gap-5">
                <h2 className="font-serif text-3xl font-black text-[#17150f] sm:text-4xl">Small Plates</h2>
                <div className="h-px flex-1 bg-[#e7dece]" />
              </div>
              {smallPlates.length > 0 ? (
                <ProductGrid products={smallPlates} onAdd={handleAdd} onOpen={(product) => navigate(`/products/${product.id}`)} />
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#d8cebc] p-20 text-center font-serif italic text-[#9d978b]">
                  Chef's seasonal selections arriving shortly...
                </div>
              )}
            </section>
          </>
        ) : null}
      </section>

      <CartDrawer />

      <ProductCustomizeModal product={selectedProduct} open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} />
      <ProductCreateModal
        open={creatingProduct}
        onClose={() => setCreatingProduct(false)}
        onCreated={(product) => {
          setProducts((current) => [...current, product])
          navigate(`/products/${product.id}`)
        }}
      />
    </div>
  )
}
