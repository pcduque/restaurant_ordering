import { CreditCard } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createOrder } from '../../api/orders.api'
import { getApiErrorMessage } from '../../api/client'
import { useAuthStore } from '../../store/auth.store'
import { useCartStore } from '../../store/cart.store'
import { createIdempotencyKey } from '../../utils/idempotency'
import { Button } from '../ui/Button'
import { ErrorState } from '../ui/ErrorState'

interface CheckoutPanelProps {
  disabled?: boolean
  variant?: 'default' | 'checkout'
}

export function CheckoutPanel({ disabled = false, variant = 'default' }: CheckoutPanelProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toPricingRequest = useCartStore((state) => state.toPricingRequest)
  const clearCart = useCartStore((state) => state.clearCart)
  const token = useAuthStore((state) => state.token)
  const navigate = useNavigate()

  async function checkout() {
    if (!token) {
      navigate('/login?redirectTo=/cart')
      return
    }

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
      <Button
        className={
          variant === 'checkout'
            ? 'w-full rounded-[16px] bg-[#171913] py-7 text-xl font-black hover:bg-[#282a22]'
            : 'w-full'
        }
        disabled={disabled || loading}
        onClick={checkout}
      >
        <CreditCard className="h-4 w-4" />
        {loading ? 'Creating order...' : variant === 'checkout' ? 'Complete Order' : 'Checkout'}
      </Button>
      {variant === 'checkout' ? (
        <p className="text-center text-sm text-[#b5aa9f]">
          By proceeding, you agree to our <span className="underline">Terms of Culinary Service</span>.
        </p>
      ) : null}
    </div>
  )
}
