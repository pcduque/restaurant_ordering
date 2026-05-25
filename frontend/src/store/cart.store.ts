import { create } from 'zustand'
import type { CartItem, CartPricingRequest, SelectedModifier } from '../types/cart.types'
import type { Product } from '../types/menu.types'

interface AddCartItemInput {
  product: Product
  quantity: number
  selectedModifiers: SelectedModifier[]
}

interface CartState {
  items: CartItem[]
  addItem: (input: AddCartItemInput) => void
  removeItem: (localCartItemId: string) => void
  increaseQuantity: (localCartItemId: string) => void
  decreaseQuantity: (localCartItemId: string) => void
  clearCart: () => void
  toPricingRequest: () => CartPricingRequest
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: ({ product, quantity, selectedModifiers }) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          localCartItemId: crypto.randomUUID(),
          productId: product.id,
          productName: product.name,
          quantity,
          selectedModifiers,
          basePriceCents: product.basePriceCents,
        },
      ],
    })),
  removeItem: (localCartItemId) =>
    set((state) => ({ items: state.items.filter((item) => item.localCartItemId !== localCartItemId) })),
  increaseQuantity: (localCartItemId) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.localCartItemId === localCartItemId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    })),
  decreaseQuantity: (localCartItemId) =>
    set((state) => ({
      items: state.items
        .map((item) => (item.localCartItemId === localCartItemId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0),
    })),
  clearCart: () => set({ items: [] }),
  toPricingRequest: () => ({
    items: get().items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      modifiers: item.selectedModifiers.map((modifier) => ({
        groupId: modifier.groupId,
        optionIds: modifier.optionIds,
      })),
    })),
  }),
}))
