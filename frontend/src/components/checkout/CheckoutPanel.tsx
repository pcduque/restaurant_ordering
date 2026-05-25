import { CreditCard } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../api/orders.api'
import { getApiErrorMessage } from '../../api/client'
import { useCartStore } from '../../store/cart.store'
import { createIdempotencyKey } from '../../utils/idempotency'
import { Button } from '../ui/Button'
import { ErrorState } from '../ui/ErrorState'

interface CheckoutPanelProps {
  disabled?: boolean
}

export function CheckoutPanel({ disabled = false }: CheckoutPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toPricingRequest = useCartStore((state) => state.toPricingRequest)
  const clearCart = useCartStore((state) => state.clearCart)
  const navigate = useNavigate()

  async function checkout() {
    setLoading(true)
    setError('')
    try {
      const order = await createOrder(toPricingRequest(), createIdempotencyKey())
      clearCart()
      navigate(`/orders/${order.orderId}`)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? <ErrorState title="Checkout failed" message={error} /> : null}
      <Button className="w-full" disabled={disabled || loading} onClick={checkout}>
        <CreditCard className="h-4 w-4" />
        {loading ? 'Creating order...' : 'Checkout'}
      </Button>
    </div>
  )
}
