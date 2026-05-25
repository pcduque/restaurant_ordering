import type { TimelineEvent } from '../../types/timeline.types'
import { Button } from '../ui/Button'
import { TimelineEventCard } from './TimelineEventCard'

interface TimelineListProps {
  events: TimelineEvent[]
  nextCursor: string | null
  loadingMore: boolean
  onLoadMore: () => void
}

export function TimelineList({ events, nextCursor, loadingMore, onLoadMore }: TimelineListProps) {
  return (
    <section className="rounded-[8px] border border-orange-100 bg-orange-50/40 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-slate-950">Order timeline</h2>
        <span className="text-sm font-semibold text-slate-500">{events.length} events</span>
      </div>
      <div className="relative mt-5 space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-orange-200">
        {events.map((event) => (
          <TimelineEventCard key={event.eventId} event={event} />
        ))}
      </div>
      {nextCursor ? (
        <Button variant="secondary" className="mt-5 w-full" onClick={onLoadMore} disabled={loadingMore}>
          {loadingMore ? 'Loading events...' : 'Load more events'}
        </Button>
      ) : null}
    </section>
  )
}
