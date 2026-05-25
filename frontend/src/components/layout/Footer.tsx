export function Footer() {
  return (
    <footer className="border-t border-orange-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Restaurant Ordering + Order Timeline</p>
        <p>Backend: {import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000'}</p>
      </div>
    </footer>
  )
}
