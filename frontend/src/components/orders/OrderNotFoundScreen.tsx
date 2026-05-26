import { ConciergeBell, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

interface OrderNotFoundScreenProps {
  onRetry: () => void
}

export function OrderNotFoundScreen({ onRetry }: OrderNotFoundScreenProps) {
  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100vh-144px)] items-start justify-center bg-[#fbf6ec] px-6 py-16 text-center sm:-mx-8 lg:-mx-10">
      <section className="w-full max-w-lg">
        <div className="relative mx-auto h-44 w-44">
          <img
            src="/images/candle.png"
            alt="Dining table candle"
            className="h-full w-full rounded-full border border-[#efe3d2] object-cover shadow-[0_20px_55px_rgba(69,48,27,0.16)]"
          />
          <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-[8px] border border-[#efcbb6] bg-white px-4 py-3 text-left shadow-[0_12px_30px_rgba(69,48,27,0.12)]">
            <Search className="h-4 w-4 text-[#b8320a]" />
            <div>
              <p className="text-[9px] font-black uppercase text-[#87796c]">Error 404</p>
              <p className="whitespace-nowrap text-sm font-black text-[#17150f]">Order Void</p>
            </div>
          </div>
        </div>

        <h1 className="mt-12 font-serif text-4xl font-black text-[#17150f]">Order not found</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#7b4d3b]">
          We could not find an order with this ID. It may have been expired, canceled, or entered incorrectly.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button className="w-full bg-[#b8320a] px-7 hover:bg-[#8f2708] sm:w-auto">Back to Menu</Button>
          </Link>
          <Button variant="secondary" className="w-full px-7 sm:w-auto" onClick={onRetry}>
            Track Different Order
          </Button>
        </div>

        <p className="mt-12 text-[10px] text-[#7b4d3b]">
          Need assistance? <span className="font-black text-[#b8320a]">Contact Guest Services</span>
        </p>
        <ConciergeBell className="mx-auto mt-3 h-4 w-4 text-[#b8320a]" />
      </section>
    </div>
  )
}
