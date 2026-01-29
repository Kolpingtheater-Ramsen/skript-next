'use client'

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: string
  colorClass?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, colorClass, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2)}`

    return (
      <div className="flex items-start gap-3 py-2 cursor-pointer">
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={cn(
            'appearance-none w-5 h-5 min-w-[20px] border-2 rounded-md cursor-pointer relative transition-all mt-0.5',
            'border-[var(--color-border)] hover:border-[var(--color-primary)]',
            'checked:border-[var(--color-primary)] checked:bg-[var(--color-primary)]',
            "checked:after:content-['✓'] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:text-white checked:after:text-xs checked:after:font-bold",
            colorClass,
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div>
            {label && (
              <label
                htmlFor={inputId}
                className="text-sm text-[var(--color-text)] cursor-pointer select-none leading-normal"
              >
                {label}
              </label>
            )}
            {description && (
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                {description}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
