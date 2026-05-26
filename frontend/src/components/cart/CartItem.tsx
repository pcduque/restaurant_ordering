import { Minus, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cart.store'
import type { CartItem as CartItemType } from '../../types/cart.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'

interface CartItemProps {
  item: CartItemType
  variant?: 'default' | 'checkout'
}

export function CartItem({ item, variant = 'default' }: CartItemProps) {
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const modifierTotal = item.selectedModifiers.reduce(
    (sum, modifier) => sum + modifier.options.reduce((optionSum, option) => optionSum + option.priceCents, 0),
    0,
  )

  if (variant === 'checkout') {
    return (
      <div className="rounded-[28px] bg-white p-8 shadow-sm sm:p-12">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="font-serif text-4xl font-black text-[#17150f]">{item.productName}</h3>
            <p className="mt-3 text-xl text-[#9a8e82]">{formatMoney(item.basePriceCents + modifierTotal)} per serving</p>
            {item.selectedModifiers.length > 0 ? (
              <div className="mt-5 space-y-1 text-sm text-[#7d7468]">
                {item.selectedModifiers.map((modifier) => (
                  <p key={modifier.groupId}>
                    <span className="font-bold">{modifier.groupName}:</span> {modifier.options.map((option) => option.name).join(', ')}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
          <button className="text-[#c7beb3]" type="button" onClick={() => removeItem(item.localCartItemId)} aria-label={`Remove ${item.productName}`}>
            <MoreHorizontal className="h-7 w-7" />
          </button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div className="inline-flex items-center rounded-full bg-[#f3eee6] px-5 py-3">
            <button className="px-4 text-2xl font-black text-[#17150f]" type="button" onClick={() => decreaseQuantity(item.localCartItemId)} aria-label="Decrease quantity">
              -
            </button>
            <span className="min-w-12 text-center text-2xl font-black text-[#17150f]">{item.quantity}</span>
            <button className="px-4 text-2xl font-black text-[#17150f]" type="button" onClick={() => increaseQuantity(item.localCartItemId)} aria-label="Increase quantity">
              +
            </button>
          </div>
          <p className="font-serif text-4xl font-black text-[#17150f]">{formatMoney((item.basePriceCents + modifierTotal) * item.quantity)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-[8px] border border-orange-100 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-950">{item.productName}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{formatMoney(item.basePriceCents + modifierTotal)} each</p>
        </div>
        <Button variant="ghost" className="h-9 w-9 p-0 text-red-600" onClick={() => removeItem(item.localCartItemId)} aria-label={`Remove ${item.productName}`}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {item.selectedModifiers.length > 0 ? (
        <div className="mt-3 space-y-1 text-sm text-slate-600">
          {item.selectedModifiers.map((modifier) => (
            <p key={modifier.groupId}>
              <span className="font-semibold text-slate-800">{modifier.groupName}:</span>{' '}
              {modifier.options.map((option) => option.name).join(', ')}
            </p>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-11 w-11 p-0" onClick={() => decreaseQuantity(item.localCartItemId)} aria-label="Decrease quantity">
            <Minus className="h-5 w-5" />
          </Button>
          <span className="w-10 text-center text-lg font-black">{item.quantity}</span>
          <Button variant="secondary" className="h-11 w-11 p-0" onClick={() => increaseQuantity(item.localCartItemId)} aria-label="Increase quantity">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <p className="font-black text-slate-950">{formatMoney((item.basePriceCents + modifierTotal) * item.quantity)}</p>
      </div>
    </div>
  )
}
