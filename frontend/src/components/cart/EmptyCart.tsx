import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function EmptyCart() {
  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100vh-144px)] items-start justify-center bg-[#fbf6ec] px-6 py-12 text-center sm:-mx-8 lg:-mx-10">
      <div className="w-full max-w-xl">
        <div className="relative mx-auto h-48 w-48 rounded-full border border-[#efe3d2] bg-[#f8efe4] p-4 shadow-[0_18px_45px_rgba(69,48,27,0.08)]">
          <img src="/images/plate.png" alt="Empty plate" className="h-full w-full rounded-full object-cover" />
          <span className="absolute bottom-4 right-4 h-12 w-12 rounded-full bg-[#b8320a] shadow-[0_8px_22px_rgba(184,50,10,0.24)]" />
        </div>

        <h1 className="mt-8 font-serif text-4xl font-black text-[#17150f]">Your cart is empty</h1>
        <p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-[#6d665f]">
          Start by adding your favorite dishes from the menu. Experience the fine art of gastronomy delivered to your doorstep.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button className="w-full bg-[#ff5a00] px-7 shadow-[0_10px_24px_rgba(255,90,0,0.24)] hover:bg-[#e34f00] sm:w-auto">
              Browse Menu
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Button variant="secondary" className="w-full px-7 sm:w-auto">
            View Favorites
          </Button>
        </div>

        <div className="mt-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b8320a]">Popular right now</p>
          <div className="mx-auto mt-5 grid max-w-md gap-3 sm:grid-cols-2">
            <Link to="/" className="flex items-center gap-3 rounded-[8px] bg-[#f1ede4] p-3 text-left transition hover:bg-[#ece5da]">
              <img src="/images/Ensalada-Cesar.jpg" alt="Heirloom salad" className="h-11 w-14 rounded-[4px] object-cover" />
              <span>
                <span className="block font-serif text-sm font-black text-[#17150f]">Heirloom Salad</span>
                <span className="text-[10px] font-bold text-[#b8320a]">$8.00</span>
              </span>
            </Link>
            <Link to="/" className="flex items-center gap-3 rounded-[8px] bg-[#f1ede4] p-3 text-left transition hover:bg-[#ece5da]">
              <img src="/images/hamburguesa.jpg" alt="Artisanal burger" className="h-11 w-14 rounded-[4px] object-cover" />
              <span>
                <span className="block font-serif text-sm font-black text-[#17150f]">Artisanal Burger</span>
                <span className="text-[10px] font-bold text-[#b8320a]">$9.00</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
