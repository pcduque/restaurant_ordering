import { ShoppingBag, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore } from '../../store/cart.store'
import { formatMoney } from '../../utils/money'

export function Header() {
  const items = useCartStore((state) => state.items)
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const estimate = items.reduce(
    (sum, item) =>
      sum +
      item.quantity *
        (item.basePriceCents +
          item.selectedModifiers.reduce(
            (modifierSum, modifier) => modifierSum + modifier.options.reduce((optionSum, option) => optionSum + option.priceCents, 0),
            0,
          )),
    0,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dfcf] bg-[#f7f1e6]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-8 lg:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#a42d08] font-serif text-lg font-black text-white shadow-sm">
            L
          </span>
          <span>
            <span className="block font-serif text-xl font-bold text-[#17150f]">Lumière Dining</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-[11px] font-bold uppercase text-[#1f1c16] md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${isActive ? 'text-[#a42d08]' : 'hover:text-[#a42d08]'}`
            }
          >
            Menu
          </NavLink>
          <span>Reservations</span>
          <span>About</span>
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-[11px] font-bold uppercase text-[#1f1c16] sm:inline">Find a table</span>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${isActive ? 'bg-[#a42d08] text-white' : 'bg-[#17150f] text-white hover:bg-[#2d2a22]'}`
            }
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{count}</span>
            <span className="hidden sm:inline">{formatMoney(estimate)}</span>
          </NavLink>
          <span className="hidden h-9 w-9 items-center justify-center rounded-full border border-[#d8cebc] text-[#6d665a] sm:flex">
            <UserRound className="h-4 w-4" />
          </span>
        </div>
      </div>
    </header>
  )
}
