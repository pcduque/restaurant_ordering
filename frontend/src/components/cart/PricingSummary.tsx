import type { CartPricingResponse } from '../../types/cart.types'
import { formatMoney } from '../../utils/money'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'

interface PricingSummaryProps {
  pricing?: CartPricingResponse | null
  loading?: boolean
}

export function PricingSummary({ pricing, loading = false }: PricingSummaryProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <Spinner />
      </Card>
    )
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg font-black text-slate-950">Pricing summary</h2>
      <p className="mt-1 text-sm text-slate-500">Official totals are calculated by the backend.</p>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-900">{formatMoney(pricing?.subtotalCents ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tax</span>
          <span className="font-bold text-slate-900">{formatMoney(pricing?.taxCents ?? 0)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Service fee</span>
          <span className="font-bold text-slate-900">{formatMoney(pricing?.serviceFeeCents ?? 0)}</span>
        </div>
        <div className="border-t border-orange-100 pt-4">
          <div className="flex justify-between text-lg">
            <span className="font-black text-slate-950">Total</span>
            <span className="font-black text-orange-700">{formatMoney(pricing?.totalCents ?? 0)}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
