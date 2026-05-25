import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MinusCircle,
  PlusCircle,
  ReceiptText,
  RefreshCcw,
  ShoppingBag,
  type LucideIcon,
} from 'lucide-react'
import type { TimelineEventType } from '../types/timeline.types'

interface EventMeta {
  label: string
  tone: string
  Icon: LucideIcon
}

export function getEventMeta(type: TimelineEventType): EventMeta {
  const map: Record<TimelineEventType, EventMeta> = {
    CART_ITEM_ADDED: { label: 'Cart item added', tone: 'text-emerald-700 bg-emerald-50 ring-emerald-200', Icon: PlusCircle },
    CART_ITEM_UPDATED: { label: 'Cart item updated', tone: 'text-sky-700 bg-sky-50 ring-sky-200', Icon: RefreshCcw },
    CART_ITEM_REMOVED: { label: 'Cart item removed', tone: 'text-rose-700 bg-rose-50 ring-rose-200', Icon: MinusCircle },
    PRICING_CALCULATED: { label: 'Pricing calculated', tone: 'text-amber-700 bg-amber-50 ring-amber-200', Icon: ReceiptText },
    ORDER_PLACED: { label: 'Order placed', tone: 'text-orange-700 bg-orange-50 ring-orange-200', Icon: ShoppingBag },
    ORDER_STATUS_CHANGED: { label: 'Status changed', tone: 'text-emerald-700 bg-emerald-50 ring-emerald-200', Icon: CheckCircle2 },
    VALIDATION_FAILED: { label: 'Validation failed', tone: 'text-red-700 bg-red-50 ring-red-200', Icon: AlertTriangle },
  }

  return map[type] ?? { label: type, tone: 'text-slate-700 bg-slate-50 ring-slate-200', Icon: Clock3 }
}
