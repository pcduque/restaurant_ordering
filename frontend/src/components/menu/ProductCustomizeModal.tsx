import { Minus, Plus, ShoppingBag, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCartStore } from '../../store/cart.store'
import type { SelectedModifier } from '../../types/cart.types'
import type { Product } from '../../types/menu.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'
import { ModifierGroup } from './ModifierGroup'

interface ProductCustomizeModalProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function ProductCustomizeModal({ product, open, onClose }: ProductCustomizeModalProps) {
  const addItem = useCartStore((state) => state.addItem)
  const [quantity, setQuantity] = useState(1)
  const [selections, setSelections] = useState<Record<string, string[]>>({})

  const validationMessage = useMemo(() => {
    if (!product) {
      return ''
    }

    const invalid = product.modifierGroups.find((group) => {
      const count = selections[group.id]?.length ?? 0
      return count < group.minSelections || count > group.maxSelections
    })

    return invalid ? `${invalid.name} needs ${invalid.minSelections === invalid.maxSelections ? invalid.minSelections : `at least ${invalid.minSelections}`} selection(s).` : ''
  }, [product, selections])

  if (!product || !open) {
    return null
  }

  const activeProduct = product

  const selectedModifiers: SelectedModifier[] = activeProduct.modifierGroups
    .map((group) => {
      const optionIds = selections[group.id] ?? []
      const options = group.options
        .filter((option) => optionIds.includes(option.id))
        .map((option) => ({ optionId: option.id, name: option.name, priceCents: option.priceCents }))
      return { groupId: group.id, groupName: group.name, optionIds, options }
    })
    .filter((modifier) => modifier.optionIds.length > 0)

  const modifierTotal = selectedModifiers.reduce(
    (sum, modifier) => sum + modifier.options.reduce((optionSum, option) => optionSum + option.priceCents, 0),
    0,
  )
  const estimatedTotal = (activeProduct.basePriceCents + modifierTotal) * quantity

  function addToCart() {
    if (validationMessage) {
      return
    }

    addItem({ product: activeProduct, quantity, selectedModifiers })
    setQuantity(1)
    setSelections({})
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4">
      <section className="flex max-h-[94vh] w-full max-w-md flex-col overflow-hidden rounded-t-[8px] bg-white shadow-2xl sm:rounded-[8px]">
        <header className="flex items-start justify-between gap-4 px-5 py-5">
          <div>
            <h2 className="font-serif text-2xl font-black text-[#17150f]">{activeProduct.name}</h2>
            <p className="mt-5 text-sm leading-6 text-[#8a8178]">{activeProduct.description}</p>
            <p className="mt-4 text-xl font-black text-[#17150f]">{formatMoney(activeProduct.basePriceCents)}</p>
          </div>
          <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#a69b8f] hover:bg-[#f8f3ea]" type="button" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-4">
          {activeProduct.modifierGroups.map((group) => (
            <ModifierGroup
              key={group.id}
              group={group}
              selectedOptionIds={selections[group.id] ?? []}
              onChange={(optionIds) => setSelections((current) => ({ ...current, [group.id]: optionIds }))}
            />
          ))}
        </div>

        <footer className="border-t border-[#eee6dc] bg-white p-4 shadow-[0_-12px_28px_rgba(69,48,27,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-full border border-[#eee6dc]">
              <Button variant="ghost" className="h-12 w-12 rounded-none p-0" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                <Minus className="h-5 w-5" />
              </Button>
              <span className="w-8 text-center text-sm font-black">{quantity}</span>
              <Button variant="ghost" className="h-12 w-12 rounded-none p-0" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
            <Button disabled={Boolean(validationMessage)} onClick={addToCart} className="min-h-12 flex-1 rounded-[8px] bg-[#ff5a00] text-sm font-black shadow-[0_10px_24px_rgba(255,90,0,0.22)] hover:bg-[#e34f00]">
              <ShoppingBag className="h-4 w-4" />
              Add to Order · {formatMoney(estimatedTotal)}
            </Button>
          </div>
          {validationMessage ? <p className="mt-3 text-xs font-bold text-red-500">{validationMessage}</p> : null}
        </footer>
      </section>
    </div>
  )
}
