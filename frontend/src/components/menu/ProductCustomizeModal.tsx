import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCartStore } from '../../store/cart.store'
import type { SelectedModifier } from '../../types/cart.types'
import type { Product } from '../../types/menu.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'
import { Modal } from '../ui/Modal'
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

  if (!product) {
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
    <Modal title={activeProduct.name} open={open} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <p className="text-sm leading-6 text-slate-600">{activeProduct.description}</p>
          <p className="mt-2 text-lg font-black text-slate-950">{formatMoney(activeProduct.basePriceCents)}</p>
        </div>

        {activeProduct.modifierGroups.map((group) => (
          <ModifierGroup
            key={group.id}
            group={group}
            selectedOptionIds={selections[group.id] ?? []}
            onChange={(optionIds) => setSelections((current) => ({ ...current, [group.id]: optionIds }))}
          />
        ))}

        <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-orange-100 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button variant="secondary" className="h-10 w-10 p-0" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-lg font-black">{quantity}</span>
              <Button variant="secondary" className="h-10 w-10 p-0" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button disabled={Boolean(validationMessage)} onClick={addToCart} className="sm:min-w-56">
              <ShoppingBag className="h-4 w-4" />
              Add · {formatMoney(estimatedTotal)}
            </Button>
          </div>
          {validationMessage ? <p className="mt-3 text-sm font-semibold text-red-600">{validationMessage}</p> : null}
        </div>
      </div>
    </Modal>
  )
}
