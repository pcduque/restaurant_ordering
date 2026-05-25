import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '../../store/cart.store'
import type { CartItem as CartItemType } from '../../types/cart.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'

interface CartItemProps {
  item: CartItemType
}

export function CartItem({ item }: CartItemProps) {
  const increaseQuantity = useCartStore((state) => state.increaseQuantity)
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const modifierTotal = item.selectedModifiers.reduce(
    (sum, modifier) => sum + modifier.options.reduce((optionSum, option) => optionSum + option.priceCents, 0),
    0,
  )

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
          <Button variant="secondary" className="h-9 w-9 p-0" onClick={() => decreaseQuantity(item.localCartItemId)} aria-label="Decrease quantity">
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-8 text-center font-black">{item.quantity}</span>
          <Button variant="secondary" className="h-9 w-9 p-0" onClick={() => increaseQuantity(item.localCartItemId)} aria-label="Increase quantity">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="font-black text-slate-950">{formatMoney((item.basePriceCents + modifierTotal) * item.quantity)}</p>
      </div>
    </div>
  )
}
