import { ChefHat, Plus } from 'lucide-react'
import type { Product } from '../../types/menu.types'
import { formatMoney } from '../../utils/money'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const customizable = product.modifierGroups.length > 0

  return (
    <Card className="group overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-orange-100 via-amber-50 to-emerald-50 p-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/85 text-orange-700 shadow-sm">
          <ChefHat className="h-8 w-8" />
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">{product.name}</h3>
            <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{product.description}</p>
          </div>
          <p className="shrink-0 text-base font-black text-slate-950">{formatMoney(product.basePriceCents)}</p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            {customizable ? `${product.modifierGroups.length} modifier groups` : 'Ready to add'}
          </span>
          <Button onClick={() => onAdd(product)} className="shrink-0">
            <Plus className="h-4 w-4" />
            {customizable ? 'Customize' : 'Add'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
