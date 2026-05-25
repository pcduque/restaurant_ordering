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

  const signatureProducts = products.slice(0, 4)
  const smallPlates = products.slice(4)

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_450px]">
      <section>
        <div
          className="relative mb-20 min-h-[540px] overflow-hidden rounded-[24px] bg-[#11140f] shadow-[0_28px_70px_rgba(69,48,27,0.22)]"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgba(5,7,6,0.96), rgba(5,7,6,0.64), rgba(5,7,6,0.96)), url(/images/loaded_bowl.jpg)',
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(177,80,30,0.24),transparent_34rem)]" />
          <div className="relative flex min-h-[540px] flex-col items-center justify-center px-8 py-16 text-center text-white">
            <p className="text-[11px] font-black uppercase text-[#c84a18]">The modern epicurean experience</p>
            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-black leading-none sm:text-7xl lg:text-8xl">
              Build the order,
              <br />
              <span className="italic">verify the audit trail.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#fff4e0]">
              Browse the menu, customize dishes, price the cart server-side, and inspect every order event after checkout.
            </p>
          </div>
        </div>

        {loading ? <Spinner /> : null}
        {error ? <ErrorState message={error} onRetry={loadMenu} /> : null}
        {!loading && !error ? (
          <>
            <div className="mb-10 flex items-center gap-5">
              <h2 className="font-serif text-4xl font-black text-[#17150f]">Signature Dishes</h2>
              <div className="h-px flex-1 bg-[#e7dece]" />
            </div>
            <ProductGrid products={signatureProducts} onAdd={handleAdd} />

            <section className="mt-28">
              <div className="mb-8 flex items-center gap-5">
                <h2 className="font-serif text-2xl font-black text-[#17150f]">Event Audit Trail</h2>
                <div className="h-px flex-1 bg-[#e7dece]" />
                <span className="hidden text-[10px] font-bold uppercase text-[#b8b0a2] sm:inline">Live server stream</span>
              </div>
              <div className="rounded-[8px] border border-[#eadfce] bg-white p-6 font-mono text-xs shadow-sm">
                <div className="mb-5 flex gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-200" />
                  <span className="h-2 w-2 rounded-full bg-yellow-200" />
                  <span className="h-2 w-2 rounded-full bg-green-200" />
                </div>
                <p>
                  <span className="text-[#c84a18]">INIT</span> 14:02:11 <span className="text-blue-600">session.start</span> {'{'} user_id: "anon_912" {'}'}
                </p>
                <p className="mt-3">
                  <span className="text-[#c84a18]">EVENT</span> 14:05:43 <span className="text-blue-600">cart.item_added</span> {'{'} id: "caesar_01", qty: 1 {'}'}
                </p>
                <p className="mt-3">
                  <span className="text-[#c84a18]">PRICE</span> 14:05:44 <span className="text-blue-600">server.recalculate</span> {'{'} subtotal: 8.50, tax: 0.72 {'}'}
                </p>
                <p className="mt-3 pl-10 text-[#9d978b]">listening for interactions ...</p>
              </div>
            </section>

            <section className="mt-28">
              <div className="mb-8 flex items-center gap-5">
                <h2 className="font-serif text-4xl font-black text-[#17150f]">Small Plates</h2>
                <div className="h-px flex-1 bg-[#e7dece]" />
              </div>
              {smallPlates.length > 0 ? (
                <ProductGrid products={smallPlates} onAdd={handleAdd} />
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#d8cebc] p-20 text-center font-serif italic text-[#9d978b]">
                  Chef's seasonal selections arriving shortly...
                </div>
              )}
            </section>
          </>
        ) : null}
      </section>

      <CartDrawer />

      <ProductCustomizeModal product={selectedProduct} open={Boolean(selectedProduct)} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}
