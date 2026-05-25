import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div className={`rounded-[8px] border border-orange-100 bg-white shadow-sm shadow-orange-100/60 ${className}`} {...props}>
      {children}
    </div>
  )
}
