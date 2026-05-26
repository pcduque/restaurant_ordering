import { Save } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { ProductPayload } from '../../api/menu.api'
import type { Product } from '../../types/menu.types'
import { Button } from '../ui/Button'

interface ProductFormProps {
  product?: Product | null
  submitLabel: string
  loading?: boolean
  onSubmit: (payload: ProductPayload) => void
}

export function ProductForm({ product, submitLabel, loading = false, onSubmit }: ProductFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [customId, setCustomId] = useState('')

  useEffect(() => {
    setName(product?.name ?? '')
    setDescription(product?.description ?? '')
    setPrice(product ? (product.basePriceCents / 100).toFixed(2) : '')
    setCustomId('')
  }, [product])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const basePriceCents = Math.round(Number(price) * 100)
    onSubmit({
      id: product ? undefined : customId.trim() || undefined,
      name: name.trim(),
      description: description.trim(),
      basePriceCents,
      modifierGroups: product?.modifierGroups ?? [],
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {!product ? (
        <label className="block text-sm font-bold text-[#17150f]">
          Product ID
          <input
            value={customId}
            onChange={(event) => setCustomId(event.target.value)}
            placeholder="auto-generated if blank"
            className="mt-2 w-full rounded-[8px] border border-[#e7dece] bg-white px-4 py-3 text-sm font-medium outline-none"
          />
        </label>
      ) : null}
      <label className="block text-sm font-bold text-[#17150f]">
        Name
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="mt-2 w-full rounded-[8px] border border-[#e7dece] bg-white px-4 py-3 text-sm font-medium outline-none"
        />
      </label>
      <label className="block text-sm font-bold text-[#17150f]">
        Description
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
          rows={4}
          className="mt-2 w-full resize-none rounded-[8px] border border-[#e7dece] bg-white px-4 py-3 text-sm font-medium leading-6 outline-none"
        />
      </label>
      <label className="block text-sm font-bold text-[#17150f]">
        Price
        <input
          value={price}
          onChange={(event) => setPrice(event.target.value)}
          required
          type="number"
          min="0"
          step="0.01"
          className="mt-2 w-full rounded-[8px] border border-[#e7dece] bg-white px-4 py-3 text-sm font-medium outline-none"
        />
      </label>
      <Button disabled={loading || !name.trim() || !description.trim() || Number(price) < 0} className="w-full">
        <Save className="h-4 w-4" />
        {submitLabel}
      </Button>
    </form>
  )
}
