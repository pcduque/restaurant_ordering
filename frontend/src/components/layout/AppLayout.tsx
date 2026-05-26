import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f7f1e6] text-[#191814]">
      <Header />
      <main className="mx-auto min-h-[calc(100vh-144px)] max-w-[1440px] px-4 py-8 sm:px-8 lg:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
