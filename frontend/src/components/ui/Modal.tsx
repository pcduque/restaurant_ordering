import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './Button'

interface ModalProps {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
}

export function Modal({ title, open, onClose, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[8px] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-orange-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal" className="h-10 w-10 rounded-full p-0">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[calc(92vh-73px)] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
