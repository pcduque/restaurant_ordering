import { useCallback, useEffect, useState } from 'react'
import { priceCart } from '../api/cart.api'
import { getApiErrorMessage } from '../api/client'
import { CartItem } from '../components/cart/CartItem'
import { EmptyCart } from '../components/cart/EmptyCart'
import { PricingSummary } from '../components/cart/PricingSummary'
import { CheckoutPanel } from '../components/checkout/CheckoutPanel'
import { ErrorState } from '../components/ui/ErrorState'
import { useCartStore } from '../store/cart.store'
import type { CartPricingResponse } from '../types/cart.types'

export function CartPage() {
  const items = useCartStore((state) => state.items)
  const toPricingRequest = useCartStore((state) => state.toPricingRequest)
  const [pricing, setPricing] = useState<CartPricingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPricing = useCallback(async () => {
    if (items.length === 0) {
      setPricing(null)
      return
    }

    setLoading(true)
    setError('')
    try {
      setPricing(await priceCart(toPricingRequest()))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPricing(null)
    } finally {
      setLoading(false)
    }
  }, [items, toPricingRequest])

  useEffect(() => {
    void loadPricing()
  }, [loadPricing])

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section>
        <div className="mb-5">
          <h1 className="text-3xl font-black text-slate-950">Review cart</h1>
          <p className="mt-2 text-sm text-slate-500">Quantities are local. Final totals come from the NestJS pricing endpoint.</p>
        </div>
        <div className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.localCartItemId} item={item} />
          ))}
        </div>
      </section>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {error ? <ErrorState title="Pricing rejected" message={error} onRetry={loadPricing} /> : null}
        <PricingSummary pricing={pricing} loading={loading} />
        <CheckoutPanel disabled={!pricing || loading || Boolean(error)} />
      </aside>
    </div>
  )
}
