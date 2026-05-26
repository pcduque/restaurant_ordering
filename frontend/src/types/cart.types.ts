import type { TimelineEventType } from './timeline.types'

export interface SelectedModifier {
  groupId: string
  groupName: string
  optionIds: string[]
  options: {
    optionId: string
    name: string
    priceCents: number
  }[]
}

export interface CartItem {
  localCartItemId: string
  productId: string
  productName: string
  quantity: number
  selectedModifiers: SelectedModifier[]
  basePriceCents: number
}

export interface CartPricingRequest {
  items: {
    productId: string
    quantity: number
    modifiers: {
      groupId: string
      optionIds: string[]
    }[]
  }[]
}

export interface CartTimelineEvent {
  eventId: string
  timestamp: string
  type: Extract<TimelineEventType, 'CART_ITEM_ADDED' | 'CART_ITEM_UPDATED' | 'CART_ITEM_REMOVED'>
  payload: Record<string, unknown>
}

export interface CreateOrderRequest extends CartPricingRequest {
  cartEvents: CartTimelineEvent[]
}

export interface PricedCartItem {
  productId: string
  name: string
  quantity: number
  basePriceCents: number
  modifiersTotalCents: number
  unitPriceCents: number
  lineTotalCents: number
  selectedModifiers: {
    groupId: string
    optionId: string
    name: string
    priceCents: number
  }[]
}

export interface CartPricingResponse {
  items: PricedCartItem[]
  subtotalCents: number
  taxCents: number
  serviceFeeCents: number
  totalCents: number
}
