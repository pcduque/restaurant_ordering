import { createProduct } from '../../api/menu.api'
import { getApiErrorMessage } from '../../api/client'
import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { ProductForm } from './ProductForm'
import type { Product } from '../../types/menu.types'
import type { ProductPayload } from '../../api/menu.api'

interface ProductCreateModalProps {
  open: boolean
  onClose: () => void
  onCreated: (product: Product) => void
}

export function ProductCreateModal({ open, onClose, onCreated }: ProductCreateModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(payload: ProductPayload) {
    setLoading(true)
    setError('')
    try {
      const product = await createProduct(payload)
      onCreated(product)
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Add Product" open={open} onClose={onClose}>
      <ProductForm submitLabel="Create product" loading={loading} onSubmit={handleSubmit} />
      {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
    </Modal>
  )
}
