import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cart.store'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { CartItem } from './CartItem'

export function CartDrawer() {
  const items = useCartStore((state) => state.items)

  return (
    <Card className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto p-4 lg:block">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-slate-950">Current cart</h2>
        <span className="text-sm font-semibold text-slate-500">{items.length} item types</span>
      </div>
      <div className="mt-4 space-y-3">
        {items.slice(0, 3).map((item) => (
          <CartItem key={item.localCartItemId} item={item} />
        ))}
        {items.length === 0 ? <p className="rounded-[8px] bg-orange-50 p-4 text-sm text-orange-800">Add dishes to start an order.</p> : null}
      </div>
      <Link to="/cart">
        <Button className="mt-4 w-full" disabled={items.length === 0}>
          Review cart
        </Button>
      </Link>
    </Card>
  )
}
