import type { CartPricingResponse } from '../../types/cart.types'
import { formatMoney } from '../../utils/money'
import { Card } from '../ui/Card'
import { Spinner } from '../ui/Spinner'

interface PricingSummaryProps {
  pricing?: CartPricingResponse | null
  loading?: boolean
  variant?: 'default' | 'checkout'
}

export function PricingSummary({ pricing, loading = false, variant = 'default' }: PricingSummaryProps) {
  if (loading) {
    return (
      <Card className="p-5">
        <Spinner />
      </Card>
    )
  }

  if (variant === 'checkout') {
    return (
      <Card className="rounded-[28px] border-[#e7ded2] bg-white p-8 shadow-sm sm:p-12">
        <h2 className="font-serif text-3xl font-black text-[#17150f]">Pricing summary</h2>
        <p className="mt-2 text-sm font-bold uppercase text-[#a79c91]">Kitchen-ready audit</p>
        <div className="mt-12 space-y-7 text-xl">
          <div className="flex justify-between text-[#5f5149]">
            <span>Subtotal</span>
            <span className="font-bold text-[#17150f]">{formatMoney(pricing?.subtotalCents ?? 0)}</span>
          </div>
          <div className="flex justify-between text-[#5f5149]">
            <span>Tax (8%)</span>
            <span className="font-bold text-[#17150f]">{formatMoney(pricing?.taxCents ?? 0)}</span>
          </div>
          <div className="flex justify-between text-[#5f5149]">
            <span>Service fee</span>
            <span className="font-bold text-[#17150f]">{formatMoney(pricing?.serviceFeeCents ?? 0)}</span>
          </div>
          <div className="border-t border-dashed border-[#e6ddd0] pt-10">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-lg font-bold uppercase text-[#b7aca4]">Total</p>
                <p className="mt-2 text-sm font-semibold text-[#b8320a]">Gratuity not included</p>
              </div>
              <p className="font-serif text-6xl font-black text-[#b8320a]">{formatMoney(pricing?.totalCents ?? 0)}</p>
            </div>
          </div>
        </div>
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
