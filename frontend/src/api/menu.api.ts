import { apiClient } from './client'
import { adaptProduct, type BackendProduct, type Product } from '../types/menu.types'

export interface ProductPayload {
  id?: string
  name: string
  description: string
  basePriceCents: number
  modifierGroups?: Product['modifierGroups']
}

export async function getMenu(): Promise<Product[]> {
  const response = await apiClient.get<BackendProduct[]>('/menu')
  return response.data.map(adaptProduct)
}

export async function getProduct(productId: string): Promise<Product> {
  const response = await apiClient.get<BackendProduct>(`/menu/${productId}`)
  return adaptProduct(response.data)
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const response = await apiClient.post<BackendProduct>('/menu', payload)
  return adaptProduct(response.data)
}

export async function updateProduct(productId: string, payload: ProductPayload): Promise<Product> {
  const response = await apiClient.patch<BackendProduct>(`/menu/${productId}`, payload)
  return adaptProduct(response.data)
}

export async function deleteProduct(productId: string): Promise<void> {
  await apiClient.delete(`/menu/${productId}`)
}
