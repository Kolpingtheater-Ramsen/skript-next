'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type = 'text', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2)}`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-text)] mb-2"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3 py-2 text-base',
            'bg-[var(--color-surface)] text-[var(--color-text)]',
            'border border-[var(--color-border)] rounded-lg',
            'hover:border-[var(--color-border-hover)]',
            'focus:outline-none focus:border-[var(--color-primary)] focus:ring-[3px] focus:ring-[var(--color-primary-light)]',
            'transition-all',
            'placeholder:text-[var(--color-text-muted)]',
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
