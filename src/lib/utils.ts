import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Escape special regex characters
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Generate a unique ID for a script line
 */
export function getLineId(
  scene: string,
  character: string,
  index: number,
  textLength: number
): string {
  return `${scene}-${character}-${index}-${textLength}`
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: Parameters<T>) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Check if we're in a browser environment
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * Safe localStorage getter
 */
export function getFromStorage<T>(key: string, defaultValue: T): T {
  if (!isBrowser) return defaultValue
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Safe localStorage setter
 */
export function setToStorage<T>(key: string, value: T): void {
  if (!isBrowser) return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn('Failed to save to localStorage:', e)
  }
}

/**
 * Format date for German locale
 */
export function formatDateDE(date: Date): string {
  return date.toLocaleDateString('de-DE')
}

/**
 * Format time for German locale
 */
export function formatTimeDE(date: Date): string {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format date and time for German locale
 */
export function formatDateTimeDE(date: Date): string {
  return `${formatDateDE(date)} ${formatTimeDE(date)}`
}

/**
 * Scroll to a script line by index with a flash highlight effect
 * Uses requestAnimationFrame to ensure DOM is ready before scrolling
 */
export function scrollToLineWithFlash(index: number): void {
  if (!isBrowser) return

  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    const element = document.querySelector(`[data-line-index="${index}"]`)
    if (element) {
      // Scroll to the element
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })

      // Add flash highlight effect
      element.classList.add('flash-highlight')

      // Remove the class after animation completes
      setTimeout(() => {
        element.classList.remove('flash-highlight')
      }, 1000) // Match the animation duration in globals.css
    }
  })
}
