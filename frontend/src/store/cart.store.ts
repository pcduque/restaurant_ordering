import { create } from 'zustand'
import type { CartItem, CartPricingRequest, CartTimelineEvent, CreateOrderRequest, SelectedModifier } from '../types/cart.types'
import type { Product } from '../types/menu.types'

interface AddCartItemInput {
  product: Product
  quantity: number
  selectedModifiers: SelectedModifier[]
}

interface CartState {
  items: CartItem[]
  cartEvents: CartTimelineEvent[]
  addItem: (input: AddCartItemInput) => void
  removeItem: (localCartItemId: string) => void
  increaseQuantity: (localCartItemId: string) => void
  decreaseQuantity: (localCartItemId: string) => void
  clearCart: () => void
  toPricingRequest: () => CartPricingRequest
  toOrderRequest: () => CreateOrderRequest
}

function createCartEvent(type: CartTimelineEvent['type'], payload: Record<string, unknown>): CartTimelineEvent {
  return {
    eventId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    type,
    payload,
  }
}

function itemPayload(item: CartItem) {
  return {
    localCartItemId: item.localCartItemId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    modifiers: item.selectedModifiers.map((modifier) => ({
      groupId: modifier.groupId,
      groupName: modifier.groupName,
      optionIds: modifier.optionIds,
      optionNames: modifier.options.map((option) => option.name),
    })),
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  cartEvents: [],
  addItem: ({ product, quantity, selectedModifiers }) =>
    set((state) => {
      const item = {
        localCartItemId: crypto.randomUUID(),
        productId: product.id,
        productName: product.name,
        quantity,
        selectedModifiers,
        basePriceCents: product.basePriceCents,
      }

      return {
        items: [...state.items, item],
        cartEvents: [...state.cartEvents, createCartEvent('CART_ITEM_ADDED', itemPayload(item))],
      }
    }),
  removeItem: (localCartItemId) =>
    set((state) => {
      const item = state.items.find((current) => current.localCartItemId === localCartItemId)
      return {
        items: state.items.filter((current) => current.localCartItemId !== localCartItemId),
        cartEvents: item
          ? [...state.cartEvents, createCartEvent('CART_ITEM_REMOVED', itemPayload(item))]
          : state.cartEvents,
      }
    }),
  increaseQuantity: (localCartItemId) =>
    set((state) => {
      let updatedItem: CartItem | undefined
      const items = state.items.map((item) => {
        if (item.localCartItemId !== localCartItemId) {
          return item
        }
        updatedItem = { ...item, quantity: item.quantity + 1 }
        return updatedItem
      })

      return {
        items,
        cartEvents: updatedItem
          ? [...state.cartEvents, createCartEvent('CART_ITEM_UPDATED', itemPayload(updatedItem))]
          : state.cartEvents,
      }
    }),
  decreaseQuantity: (localCartItemId) =>
    set((state) => {
      const item = state.items.find((current) => current.localCartItemId === localCartItemId)
      if (!item) {
        return state
      }

      const updatedItem = { ...item, quantity: item.quantity - 1 }
      const removed = updatedItem.quantity <= 0

      return {
        items: state.items
          .map((current) => (current.localCartItemId === localCartItemId ? updatedItem : current))
          .filter((current) => current.quantity > 0),
        cartEvents: [
          ...state.cartEvents,
          createCartEvent(removed ? 'CART_ITEM_REMOVED' : 'CART_ITEM_UPDATED', itemPayload(removed ? item : updatedItem)),
        ],
      }
    }),
  clearCart: () => set({ items: [], cartEvents: [] }),
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
  toOrderRequest: () => ({
    items: get().toPricingRequest().items,
    cartEvents: get().cartEvents,
  }),
}))
