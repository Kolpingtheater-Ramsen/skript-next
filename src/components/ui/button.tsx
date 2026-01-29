import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'danger-soft' | 'success-soft'
  size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          {
            'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]':
              variant === 'primary',
            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700':
              variant === 'secondary',
            'bg-transparent text-[var(--color-text)] hover:bg-gray-100 dark:hover:bg-gray-800':
              variant === 'ghost',
            'bg-[var(--color-error)] text-white hover:bg-red-600':
              variant === 'danger',
            'bg-[var(--color-success)] text-white hover:bg-emerald-600':
              variant === 'success',
            'bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error-light)] hover:brightness-95':
              variant === 'danger-soft',
            'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success-light)] hover:brightness-95':
              variant === 'success-soft',
          },
          // Sizes
          {
            'px-3 py-1 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-6 py-3 text-base': size === 'lg',
            'p-2 min-w-[40px] min-h-[40px]': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
