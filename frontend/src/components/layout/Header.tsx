import { ShoppingBag } from 'lucide-react'
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
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-600 text-lg font-black text-white shadow-sm">
            R
          </span>
          <span>
            <span className="block text-base font-black text-slate-950">Resto Order</span>
            <span className="hidden text-xs font-medium text-slate-500 sm:block">Kitchen-ready ordering audit</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-orange-50'}`
            }
          >
            Menu
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${isActive ? 'bg-orange-600 text-white' : 'bg-slate-950 text-white hover:bg-slate-800'}`
            }
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{count}</span>
            <span className="hidden sm:inline">{formatMoney(estimate)}</span>
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
