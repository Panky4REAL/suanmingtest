/* ============================================================
   Select 组件 - 扶桑宣纸雅致风格
   ============================================================ */

import type { SelectHTMLAttributes } from 'react'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  label?: string
  options: SelectOption[]
  error?: string
}

export function Select({ label, options, error, className = '', id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-serif-sc font-medium text-[#52666a]"
        >
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          id={selectId}
          className={`
            w-full px-3.5 py-2.5 rounded-xl
            bg-white/90 backdrop-blur-sm
            border border-[#dcd3c1]
            text-sm text-[#1e2f34]
            transition-all duration-200
            focus:outline-none focus:bg-white
            focus:border-[#176f63] focus:ring-2 focus:ring-[#176f63]/15
            hover:border-[#176f63]/40
            appearance-none cursor-pointer
            pr-9 shadow-2xs
            ${error ? 'border-[#c0392b] focus:border-[#c0392b]' : ''}
            ${className}
          `}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-white text-[#1e2f34] py-1"
            >
              {opt.label}
            </option>
          ))}
        </select>
        {/* 下拉箭头 */}
        <div
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            pointer-events-none
            text-[#879397] transition-colors duration-200
            group-hover:text-[#176f63]
          "
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-[#c0392b] flex items-center gap-1">
          {error}
        </span>
      )}
    </div>
  )
}
