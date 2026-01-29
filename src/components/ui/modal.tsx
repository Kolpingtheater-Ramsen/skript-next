'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[400]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'w-[90%] max-w-[600px] max-h-[85vh]',
          'bg-[var(--color-surface)] rounded-xl shadow-xl',
          'z-[500] overflow-hidden flex flex-col',
          'dark:border dark:border-[var(--color-border)]'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] flex-shrink-0">
          <h3 id="modal-title" className="text-xl font-semibold m-0">
            {title}
          </h3>
          <button
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-lg',
              'bg-transparent border-none cursor-pointer text-2xl',
              'text-[var(--color-text-secondary)]',
              'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[var(--color-text)]',
              'transition-all'
            )}
            aria-label="Schließen"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--color-border)] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}
