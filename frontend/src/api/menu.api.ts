import { apiClient } from './client'
import { adaptProduct, type BackendProduct, type Product } from '../types/menu.types'

export async function getMenu(): Promise<Product[]> {
  const response = await apiClient.get<BackendProduct[]>('/menu')
  return response.data.map(adaptProduct)
}
