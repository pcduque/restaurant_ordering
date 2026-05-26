import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { priceCart } from '../../api/cart.api'
import { useCartStore } from '../../store/cart.store'
import type { CartPricingResponse } from '../../types/cart.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

export function CartDrawer() {
  const items = useCartStore((state) => state.items)
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const toPricingRequest = useCartStore((state) => state.toPricingRequest)
  const [pricing, setPricing] = useState<CartPricingResponse | null>(null)

  const loadPricing = useCallback(async () => {
    if (items.length === 0) {
      setPricing(null)
      return
    }

    try {
      setPricing(await priceCart(toPricingRequest()))
    } catch {
      setPricing(null)
    }
  }, [items, toPricingRequest])

  useEffect(() => {
    void loadPricing()
  }, [loadPricing])

  return (
    <Card className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto rounded-[18px] border-0 bg-white p-7 shadow-[0_30px_70px_rgba(69,48,27,0.18)] xl:block">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-[#17150f]">Current Cart</h2>
        <span className="text-[10px] font-bold uppercase text-[#b8b0a2]">{items.length} selection</span>
      </div>
      <div className="mt-8 space-y-4">
        {items.slice(0, 3).map((item) => (
          <div key={item.localCartItemId} className="rounded-[10px] border border-[#eee6d8] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#17150f]">{item.productName}</h3>
                <p className="mt-1 text-xs text-[#8a8276]">{item.selectedModifiers[0]?.options.map((option) => option.name).join(', ') || 'Standard preparation'}</p>
              </div>
              <span className="text-xs font-bold text-[#17150f]">{formatMoney(item.basePriceCents)}</span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="inline-flex items-center rounded-full bg-[#f4eee4] px-3 py-2">
                <button className="px-3 text-lg font-black" type="button" onClick={() => decreaseQuantity(item.localCartItemId)} aria-label="Decrease quantity">
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-black">{item.quantity}</span>
                <button className="px-3 text-lg font-black" type="button" onClick={() => increaseQuantity(item.localCartItemId)} aria-label="Increase quantity">
                  +
                </button>
              </div>
              <button className="text-[10px] font-bold uppercase text-[#b8b0a2]" type="button" onClick={() => removeItem(item.localCartItemId)}>
                Remove
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 ? <p className="rounded-[10px] bg-[#f7f1e6] p-5 text-sm text-[#7b7264]">Add dishes to start an order.</p> : null}
      </div>
      <div className="mt-7 space-y-3 border-t border-[#eee6d8] pt-6 text-sm">
        <div className="flex justify-between text-[#82786b]">
          <span>Subtotal</span>
          <span>{formatMoney(pricing?.subtotalCents ?? 0)}</span>
        </div>
        <div className="flex justify-between text-[#82786b]">
          <span>Service Charge</span>
          <span>{formatMoney(pricing?.serviceFeeCents ?? 0)}</span>
        </div>
        <div className="flex justify-between pt-3 font-serif text-xl font-bold text-[#17150f]">
          <span>Total</span>
          <span>{formatMoney(pricing?.totalCents ?? 0)}</span>
        </div>
      </div>
      <Link to="/cart">
        <Button className="mt-7 w-full rounded-full bg-[#b8320a] py-4 text-[11px] uppercase hover:bg-[#8f2708]" disabled={items.length === 0}>
          Continue to checkout
        </Button>
      </Link>
      <p className="mt-4 text-center text-[10px] font-bold uppercase text-[#c9c0b1]">Secure encrypted checkout</p>
    </Card>
  )
}
