'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface RangeSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  showValue?: boolean
}

const RangeSlider = forwardRef<HTMLInputElement, RangeSliderProps>(
  ({ className, label, showValue = true, value, ...props }, ref) => {
    return (
      <div
        className={cn(
          'flex items-center gap-3 ml-8 mt-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md',
          className
        )}
      >
        {label && (
          <label className="text-xs text-[var(--color-text-secondary)] whitespace-nowrap">
            {label}
          </label>
        )}
        <input
          type="range"
          ref={ref}
          value={value}
          className={cn(
            'flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer',
            '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[18px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:bg-[var(--color-primary)] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110'
          )}
          {...props}
        />
        {showValue && (
          <span className="min-w-[24px] text-center text-sm font-medium text-[var(--color-primary)]">
            {value}
          </span>
        )}
      </div>
    )
  }
)

RangeSlider.displayName = 'RangeSlider'

export { RangeSlider }
