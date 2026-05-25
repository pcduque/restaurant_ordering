import type { TimelinePage } from '../types/timeline.types'
import { apiClient } from './client'

export async function getMyTimeline(pageSize = 6): Promise<TimelinePage> {
  const response = await apiClient.get<TimelinePage>('/timeline/me', {
    params: { pageSize },
  })
  return response.data
}
