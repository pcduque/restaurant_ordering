import { apiClient } from './client'
import type { CreateOrderRequest } from '../types/cart.types'
import type { CreateOrderResponse, Order, OrderStatus } from '../types/order.types'
import type { TimelinePage } from '../types/timeline.types'

export async function createOrder(payload: CreateOrderRequest, idempotencyKey: string): Promise<CreateOrderResponse> {
  const response = await apiClient.post<CreateOrderResponse>('/orders', payload, {
    headers: { 'Idempotency-Key': idempotencyKey },
  })
  return response.data
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await apiClient.get<Order>(`/orders/${orderId}`)
  return response.data
}

export async function listOrders(): Promise<Order[]> {
  const response = await apiClient.get<Order[]>('/orders')
  return response.data
}

export async function getOrderTimeline(orderId: string, cursor?: string): Promise<TimelinePage> {
  const response = await apiClient.get<TimelinePage>(`/orders/${orderId}/timeline`, {
    params: { pageSize: 20, cursor },
  })
  return response.data
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await apiClient.patch<Order>(`/orders/${orderId}/status`, { status })
  return response.data
}
