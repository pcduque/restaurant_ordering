import { Sparkle } from 'lucide-react'
import type { Product } from '../../types/menu.types'
import { formatMoney } from '../../utils/money'
import { getProductImage } from '../../utils/productImages'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface ProductCardProps {
  product: Product
  onAdd: (product: Product) => void
  onOpen: (product: Product) => void
}

export function ProductCard({ product, onAdd, onOpen }: ProductCardProps) {
  const customizable = product.modifierGroups.length > 0
  const imageUrl = getProductImage(product.id)

  return (
    <Card
      className="group cursor-pointer overflow-hidden border-[#eadfce] bg-white shadow-[0_18px_50px_rgba(69,48,27,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(69,48,27,0.14)]"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(product)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(product)
        }
      }}
    >
      <div className="relative h-56 overflow-hidden bg-[#f3efe7]">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute left-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#a42d08] shadow-sm">
          <Sparkle className="h-4 w-4" />
        </div>
      </div>
      <div className="bg-white p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#17150f]">{product.name}</h3>
            <p className="mt-3 min-h-12 max-w-[19rem] text-sm leading-6 text-[#746f66]">{product.description}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-[#17150f]">{formatMoney(product.basePriceCents)}</p>
        </div>
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-[#eee6d8] pt-5">
          <span className={`text-[10px] font-black uppercase ${customizable ? 'text-[#a42d08]' : 'text-[#9d978b]'}`}>
            {customizable ? `${product.modifierGroups.length} modifier groups` : 'Ready to add'}
          </span>
          <Button
            onClick={(event) => {
              event.stopPropagation()
              onAdd(product)
            }}
            className={`min-h-9 shrink-0 px-5 py-2 text-[11px] ${customizable ? 'bg-[#17150f] hover:bg-[#2c2922]' : 'bg-[#b8320a] hover:bg-[#8f2708]'}`}
          >
            {customizable ? 'Customize' : 'Add to Order'}
          </Button>
        </div>
      </div>
    </Card>
  )
}
