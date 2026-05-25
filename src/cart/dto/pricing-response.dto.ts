export interface PricedModifierOption {
  groupId: string;
  optionId: string;
  name: string;
  priceCents: number;
}

export interface PricedCartItem {
  productId: string;
  name: string;
  quantity: number;
  basePriceCents: number;
  modifiersTotalCents: number;
  unitPriceCents: number;
  lineTotalCents: number;
  selectedModifiers: PricedModifierOption[];
}

export interface PricingBreakdown {
  items: PricedCartItem[];
  subtotalCents: number;
  taxCents: number;
  serviceFeeCents: number;
  totalCents: number;
}
