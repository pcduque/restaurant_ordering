import { ArrowLeft, Edit3, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { deleteProduct, getProduct, updateProduct, type ProductPayload } from '../api/menu.api'
import { getApiErrorMessage } from '../api/client'
import { ModifierGroup } from '../components/menu/ModifierGroup'
import { ProductForm } from '../components/menu/ProductForm'
import { Button } from '../components/ui/Button'
import { ErrorState } from '../components/ui/ErrorState'
import { Spinner } from '../components/ui/Spinner'
import { useCartStore } from '../store/cart.store'
import type { SelectedModifier } from '../types/cart.types'
import type { Product } from '../types/menu.types'
import { formatMoney } from '../utils/money'
import { getProductImage } from '../utils/productImages'

export function ProductDetailPage() {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const addItem = useCartStore((state) => state.addItem)
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selections, setSelections] = useState<Record<string, string[]>>({})
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')

  const loadProduct = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setProduct(await getProduct(productId))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [productId])

  useEffect(() => {
    void loadProduct()
  }, [loadProduct])

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

  if (loading) {
    return <Spinner />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadProduct} />
  }

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

  async function handleUpdate(payload: ProductPayload) {
    setSaving(true)
    setActionError('')
    try {
      const updated = await updateProduct(activeProduct.id, payload)
      setProduct(updated)
      setEditing(false)
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${activeProduct.name}?`)) {
      return
    }

    setDeleting(true)
    setActionError('')
    try {
      await deleteProduct(activeProduct.id)
      navigate('/')
    } catch (err) {
      setActionError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  function addToCart() {
    if (validationMessage) {
      return
    }

    addItem({ product: activeProduct, quantity, selectedModifiers })
    navigate('/cart')
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Menu
        </Button>
        <div className="flex gap-2">
          <Button variant={editing ? 'secondary' : 'ghost'} onClick={() => setEditing((value) => !value)}>
            {editing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            {editing ? 'Cancel' : 'Edit'}
          </Button>
          <Button variant="danger" disabled={deleting} onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
        <div>
          <div className="overflow-hidden rounded-[8px] bg-[#11140f] shadow-[0_22px_55px_rgba(69,48,27,0.16)]">
            <img src={getProductImage(activeProduct.id)} alt={activeProduct.name} className="aspect-[4/3] w-full object-cover" />
          </div>
          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b8320a]">Menu detail</p>
            <h1 className="mt-3 font-serif text-5xl font-black leading-tight text-[#17150f]">{activeProduct.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#746f66]">{activeProduct.description}</p>
            <p className="mt-5 text-2xl font-black text-[#17150f]">{formatMoney(activeProduct.basePriceCents)}</p>
          </div>
        </div>

        <aside className="self-start rounded-[8px] border border-[#eadfce] bg-white p-6 shadow-[0_18px_50px_rgba(69,48,27,0.08)]">
          {editing ? (
            <>
              <h2 className="mb-5 font-serif text-2xl font-black text-[#17150f]">Edit product</h2>
              <ProductForm product={activeProduct} submitLabel="Save changes" loading={saving} onSubmit={handleUpdate} />
            </>
          ) : (
            <>
              <h2 className="font-serif text-2xl font-black text-[#17150f]">Customize order</h2>
              <div className="mt-6 space-y-5">
                {activeProduct.modifierGroups.length > 0 ? (
                  activeProduct.modifierGroups.map((group) => (
                    <ModifierGroup
                      key={group.id}
                      group={group}
                      selectedOptionIds={selections[group.id] ?? []}
                      onChange={(optionIds) => setSelections((current) => ({ ...current, [group.id]: optionIds }))}
                    />
                  ))
                ) : (
                  <p className="rounded-[8px] border border-dashed border-[#eadfce] p-5 text-sm leading-6 text-[#746f66]">
                    This item is ready to add without modifiers.
                  </p>
                )}
              </div>

              <div className="mt-8 border-t border-[#eee6d8] pt-5">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#9d978b]">Total price</span>
                  <span className="text-2xl font-black text-[#17150f]">{formatMoney(estimatedTotal)}</span>
                </div>
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
                  <Button disabled={Boolean(validationMessage)} onClick={addToCart} className="sm:min-w-44">
                    <ShoppingBag className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {validationMessage ? <p className="mt-3 text-sm font-semibold text-red-600">{validationMessage}</p> : null}
              </div>
            </>
          )}
          {actionError ? <p className="mt-4 text-sm font-semibold text-red-600">{actionError}</p> : null}
        </aside>
      </div>
    </section>
  )
}
