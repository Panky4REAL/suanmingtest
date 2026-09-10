/* ============================================================
   Button 组件 - 扶桑东方雅致风格
   ============================================================ */

import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = `
    relative inline-flex items-center justify-center
    font-medium transition-all duration-200
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#176f63]/30
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    overflow-hidden
  `

  const variantStyles = {
    primary: `
      bg-gradient-to-r from-[#176f63] to-[#0f5249]
      text-white rounded-xl
      shadow-sm hover:shadow-md
      hover:from-[#1d8274] hover:to-[#176f63]
      active:scale-[0.98]
    `,
    secondary: `
      bg-white/90 backdrop-blur-sm
      border border-[#dcd3c1] rounded-xl
      text-[#1e2f34]
      hover:bg-white hover:border-[#176f63]/40 hover:text-[#176f63]
      active:scale-[0.98] shadow-2xs
    `,
    ghost: `
      text-[#52666a] rounded-lg
      hover:bg-[#176f63]/10 hover:text-[#176f63]
      active:scale-[0.98]
    `,
    gold: `
      bg-gradient-to-r from-[#c58a28] to-[#8a5b21]
      text-white font-semibold rounded-xl
      shadow-sm hover:shadow-md
      hover:from-[#d89c36] hover:to-[#c58a28]
      active:scale-[0.98]
    `,
  }

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  )
}
