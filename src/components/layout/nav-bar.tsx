'use client'

import Image from 'next/image'
import { useUIStore } from '@/stores/ui-store'
import { cn } from '@/lib/utils'

export function NavBar() {
  const { currentScene, toggleSettings, toggleSidebar } = useUIStore()

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 h-16 md:h-14',
        'flex items-center justify-between px-6 md:px-3',
        'nav-backdrop border-b border-[var(--color-border)]',
        'z-[300] transition-colors duration-200',
        'text-[#F3F3F3]'
      )}
    >
      {/* Logo and Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Image
          src="/logo.png"
          alt="Kolpingtheater Ramsen"
          width={36}
          height={36}
          className="flex-shrink-0 h-9 w-auto md:h-7"
          priority
        />
        <h1
          className={cn(
            'text-xl md:text-base font-extrabold',
            'whitespace-nowrap overflow-hidden text-ellipsis',
            'font-serif text-[#F3F3F3]'
          )}
        >
          {currentScene ? `Szene ${currentScene}` : 'Drehbuch Viewer'}
        </h1>
      </div>

      {/* Nav Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSettings}
          className={cn(
            'flex items-center justify-center w-10 h-10',
            'bg-transparent border-none rounded-lg cursor-pointer',
            'text-xl text-[#F3F3F3]',
            'hover:bg-white/10 hover:text-[var(--color-primary)]',
            'transition-all'
          )}
          title="Einstellungen"
          aria-label="Einstellungen öffnen"
        >
          ⚙️
        </button>
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex items-center justify-center w-10 h-10',
            'bg-transparent border-none rounded-lg cursor-pointer',
            'text-xl text-[#F3F3F3]',
            'hover:bg-white/10 hover:text-[var(--color-primary)]',
            'transition-all'
          )}
          title="Inhaltsverzeichnis"
          aria-label="Inhaltsverzeichnis öffnen"
        >
          ☰
        </button>
      </div>
    </nav>
  )
}
