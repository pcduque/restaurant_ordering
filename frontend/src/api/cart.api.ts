import { apiClient } from './client'
import type { CartPricingRequest, CartPricingResponse } from '../types/cart.types'

export async function priceCart(payload: CartPricingRequest): Promise<CartPricingResponse> {
  const response = await apiClient.post<CartPricingResponse>('/cart/pricing', payload)
  return response.data
}
