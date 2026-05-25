export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12" aria-label="Loading">
      <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" />
    </div>
  )
}
