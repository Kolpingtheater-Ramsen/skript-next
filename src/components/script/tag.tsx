'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type TagType =
  | 'instruction'
  | 'technical'
  | 'lighting'
  | 'audio'
  | 'props'
  | 'microphone'
  | 'default'

interface TagProps {
  type?: TagType
  children: ReactNode
  className?: string
}

const typeStyles: Record<TagType, string> = {
  instruction: 'bg-instruction text-white',
  technical: 'bg-technical text-white',
  lighting: 'bg-lighting text-white',
  audio: 'bg-audio text-white',
  props: 'bg-props text-white',
  microphone: 'bg-microphone text-white',
  default: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200',
}

export function Tag({ type = 'default', children, className }: TagProps) {
  return (
    <span
      className={cn(
        'inline-block px-2 py-1 mb-2 text-xs font-semibold uppercase tracking-wide rounded-md',
        typeStyles[type],
        className
      )}
    >
      {children}
    </span>
  )
}
