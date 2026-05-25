import { Badge } from '../ui/Badge'

interface StatusBadgeProps {
  status: string
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const tone = status === 'CANCELLED' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  return <Badge className={tone}>{status}</Badge>
}
