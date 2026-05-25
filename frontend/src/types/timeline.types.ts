export type TimelineEventType =
  | 'CART_ITEM_ADDED'
  | 'CART_ITEM_UPDATED'
  | 'CART_ITEM_REMOVED'
  | 'PRICING_CALCULATED'
  | 'ORDER_PLACED'
  | 'ORDER_STATUS_CHANGED'
  | 'VALIDATION_FAILED'

export type TimelineEventSource = 'web' | 'api' | 'worker'

export interface TimelineEvent {
  eventId: string
  timestamp: string
  orderId: string
  userId: string
  type: TimelineEventType
  source: TimelineEventSource
  correlationId: string
  payload: Record<string, unknown>
}

export interface TimelinePage {
  items: TimelineEvent[]
  nextCursor: string | null
  pageSize: number
}
