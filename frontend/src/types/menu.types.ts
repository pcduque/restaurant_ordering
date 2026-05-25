export interface ModifierOption {
  id: string
  name: string
  priceCents: number
}

export interface ModifierGroup {
  id: string
  name: string
  required: boolean
  minSelections: number
  maxSelections: number
  options: ModifierOption[]
}

export interface Product {
  id: string
  name: string
  description: string
  basePriceCents: number
  modifierGroups: ModifierGroup[]
}

interface BackendModifierOption {
  id?: string
  optionId?: string
  name: string
  priceCents?: number
  priceDeltaCents?: number
}

interface BackendModifierGroup {
  id?: string
  groupId?: string
  name: string
  required: boolean
  minSelections?: number
  maxSelections: number
  options: BackendModifierOption[]
}

export interface BackendProduct {
  _id?: string
  id?: string
  productId?: string
  name: string
  description: string
  basePriceCents: number
  modifierGroups?: BackendModifierGroup[]
}

export function adaptProduct(product: BackendProduct): Product {
  return {
    id: product._id ?? product.id ?? product.productId ?? '',
    name: product.name,
    description: product.description,
    basePriceCents: product.basePriceCents,
    modifierGroups: (product.modifierGroups ?? []).map((group) => ({
      id: group.id ?? group.groupId ?? '',
      name: group.name,
      required: group.required,
      minSelections: group.minSelections ?? (group.required ? 1 : 0),
      maxSelections: group.maxSelections,
      options: group.options.map((option) => ({
        id: option.id ?? option.optionId ?? '',
        name: option.name,
        priceCents: option.priceCents ?? option.priceDeltaCents ?? 0,
      })),
    })),
  }
}
