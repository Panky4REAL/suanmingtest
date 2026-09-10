/* ============================================================
   Input 组件 - 扶桑宣纸雅致风格
   ============================================================ */

import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-serif-sc font-medium text-[#52666a]"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`
            w-full px-3.5 py-2.5 rounded-xl
            bg-white/90 backdrop-blur-sm
            border border-[#dcd3c1]
            text-sm text-[#1e2f34] placeholder:text-[#879397]
            transition-all duration-200
            focus:outline-none focus:bg-white
            focus:border-[#176f63] focus:ring-2 focus:ring-[#176f63]/15
            hover:border-[#176f63]/40 shadow-2xs
            ${error ? 'border-[#c0392b] focus:border-[#c0392b]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {hint && !error && (
        <span className="text-[11px] text-[#879397]">{hint}</span>
      )}
      {error && (
        <span className="text-xs text-[#c0392b] flex items-center gap-1">
          {error}
        </span>
      )}
    </div>
  )
}
