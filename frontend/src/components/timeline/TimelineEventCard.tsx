import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { TimelineEvent } from '../../types/timeline.types'
import { formatDateTime } from '../../utils/date'
import { getEventMeta } from '../../utils/eventLabels'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { TimelineEventDetails } from './TimelineEventDetails'

interface TimelineEventCardProps {
  event: TimelineEvent
}

export function TimelineEventCard({ event }: TimelineEventCardProps) {
  const [expanded, setExpanded] = useState(false)
  const meta = getEventMeta(event.type)
  const Icon = meta.Icon

  return (
    <div className="relative pl-9">
      <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-white ring-4 ring-orange-100">
        <Icon className="h-4 w-4 text-orange-700" />
      </div>
      <div className="rounded-[8px] border border-orange-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={meta.tone}>{meta.label}</Badge>
              <Badge className="bg-slate-50 text-slate-600 ring-slate-200">{event.source}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-950">{formatDateTime(event.timestamp)}</p>
            <p className="mt-1 break-all text-xs text-slate-500">Correlation: {event.correlationId}</p>
          </div>
          <Button variant="ghost" onClick={() => setExpanded((value) => !value)} className="self-start">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Payload
          </Button>
        </div>
        {expanded ? <TimelineEventDetails payload={event.payload} /> : null}
      </div>
    </div>
  )
}
