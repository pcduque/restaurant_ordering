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
    <div className="pb-16">
      <div className="-mx-4 -mt-8 border-b border-[#e7ded2] bg-[#f3eee6] px-4 py-3 text-center text-sm font-bold uppercase text-[#8d7c70] sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        Protected checkout: duplicate clicks won't create duplicate orders
      </div>

      <div className="mt-24 grid gap-14 lg:grid-cols-[1fr_520px] xl:gap-20">
        <section>
          <div className="mb-14 max-w-3xl">
            <h1 className="font-serif text-6xl font-black text-[#17150f] sm:text-7xl">Review cart</h1>
            <p className="mt-5 max-w-2xl text-2xl italic leading-relaxed text-[#9a8e82]">
              Quantities are local. Final totals are refined by our culinary operations engine.
            </p>
          </div>
          <div className="space-y-8">
            {items.map((item) => (
              <CartItem key={item.localCartItemId} item={item} variant="checkout" />
            ))}
          </div>
        </section>

        <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
          {error ? <ErrorState title="Pricing rejected" message={error} onRetry={loadPricing} /> : null}
          <PricingSummary pricing={pricing} loading={loading} variant="checkout" />
          <CheckoutPanel disabled={!pricing || loading || Boolean(error)} variant="checkout" />
        </aside>
      </div>

      <div className="mt-28 border-t border-[#e7ded2] pt-10">
        <div className="flex flex-col gap-6 text-sm text-[#a79c91] sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#171913] font-serif font-black text-white">L</span>
            <span className="font-serif text-2xl font-black text-[#17150f]">Lumière Dining</span>
          </div>
          <div className="flex flex-wrap gap-8 font-bold uppercase">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Sustainability</span>
            <span>Support</span>
          </div>
          <span>© 2026 Lumière Dining Group. All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}
