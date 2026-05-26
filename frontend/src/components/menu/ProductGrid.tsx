import type { Product } from '../../types/menu.types'
import { ProductCard } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  onAdd: (product: Product) => void
  onOpen: (product: Product) => void
}

export function ProductGrid({ products, onAdd, onOpen }: ProductGridProps) {
  return (
    <div className="grid gap-10 md:grid-cols-2">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} onOpen={onOpen} />
      ))}
    </div>
  )
}
