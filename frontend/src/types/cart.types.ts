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
