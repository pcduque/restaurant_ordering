import type { CartItem, CartPricingResponse } from './cart.types'

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'COMPLETED'
  | 'CANCELLED'

export interface CreateOrderResponse {
  orderId: string
  status: OrderStatus
  correlationId: string
}

export interface Order {
  orderId: string
  userId: string
  status: OrderStatus
  items: CartItem[]
  pricing: CartPricingResponse
  createdAt: string
  updatedAt: string
}
