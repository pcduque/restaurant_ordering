import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export function EmptyCart() {
  return (
    <div className="rounded-[8px] border border-dashed border-orange-200 bg-white p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-700">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h2 className="mt-4 text-xl font-black text-slate-950">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-500">Add a favorite from the menu and checkout in a few clicks.</p>
      <Link to="/">
        <Button className="mt-5">Browse menu</Button>
      </Link>
    </div>
  )
}
