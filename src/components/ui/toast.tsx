'use client'

import { cn } from '@/lib/utils'
import { Button } from './button'

export interface ToastProps {
  isVisible: boolean
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  onClose: () => void
}

export function Toast({ isVisible, message, action, onClose }: ToastProps) {
  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2',
        'flex items-center gap-3 px-4 py-3',
        'bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-900',
        'rounded-lg shadow-xl z-[700]',
        'transition-all duration-200',
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-5 pointer-events-none'
      )}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {action && (
        <Button
          size="sm"
          variant="success"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
      <button
        onClick={onClose}
        className="p-1 bg-transparent text-white dark:text-gray-900 border-none cursor-pointer text-lg opacity-70 hover:opacity-100"
        aria-label="Schließen"
      >
        ×
      </button>
    </div>
  )
}
