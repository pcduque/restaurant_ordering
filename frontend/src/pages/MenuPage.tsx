import { useCallback, useEffect, useState } from 'react'
import { getApiErrorMessage } from '../api/client'
import { getMenu } from '../api/menu.api'
import { CartDrawer } from '../components/cart/CartDrawer'
import { ProductCustomizeModal } from '../components/menu/ProductCustomizeModal'
import { ProductGrid } from '../components/menu/ProductGrid'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useCartStore } from '../store/cart.store'
import type { Product } from '../types/menu.types'

export function MenuPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const addItem = useCartStore((state) => state.addItem)

  const loadMenu = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProducts(await getMenu())
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadMenu()
  }, [loadMenu])

  function handleAdd(product: Product) {
    if (product.modifierGroups.length > 0) {
      setSelectedProduct(product)
      return
    }

    addItem({ product, quantity: 1, selectedModifiers: [] })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section>
        <div className="mb-6 overflow-hidden rounded-[8px] bg-slate-950 p-6 text-white shadow-xl shadow-orange-100 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-300">Fresh service</p>
          <h1 className="mt-3 max-w-3xl text-3xl font-black sm:text-5xl">Build the order, verify the audit trail.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-orange-50/80 sm:text-base">
            Browse the menu, customize dishes, price the cart server-side, and inspect every order event after checkout.
          </p>
        </div>

        {loading ? <Spinner /> : null}
        {error ? <ErrorState message={error} onRetry={loadMenu} /> : null}
        {!loading && !error ? <ProductGrid products={products} onAdd={handleAdd} /> : null}
      </section>

      <CartDrawer />

      <ProductCustomizeModal product={selectedProduct} open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
