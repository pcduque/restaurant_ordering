import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  children: ReactNode
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-orange-600 text-white shadow-sm shadow-orange-200 hover:bg-orange-700 disabled:bg-orange-300',
  secondary: 'bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-orange-50',
  ghost: 'bg-transparent text-slate-700 hover:bg-orange-50',
  danger: 'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100',
}

export function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
