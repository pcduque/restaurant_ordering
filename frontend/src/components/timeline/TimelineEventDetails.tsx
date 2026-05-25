interface TimelineEventDetailsProps {
  payload: Record<string, unknown>
}

export function TimelineEventDetails({ payload }: TimelineEventDetailsProps) {
  return (
    <pre className="mt-4 max-h-80 overflow-auto rounded-[8px] bg-slate-950 p-4 text-xs leading-6 text-slate-100">
      {JSON.stringify(payload, null, 2)}
    </pre>
  )
}
