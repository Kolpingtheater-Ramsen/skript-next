import type { Metadata, Viewport } from 'next'
import { Inter, Cinzel } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/layout/theme-provider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  display: 'swap',
  weight: ['800'],
  variable: '--font-cinzel',
})

export const viewport: Viewport = {
  themeColor: '#FF6A00',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://skript.logge.top'),
  title: 'Kolpingtheater Ramsen - Drehbuch Viewer',
  description:
    'Interaktiver Drehbuch-Viewer für das Kolpingtheater Ramsen. Viele hilfreiche Funktionen für die Probe.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Drehbuch',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Kolpingtheater Ramsen - Drehbuch Viewer',
    description:
      'Interaktiver Drehbuch-Viewer für das Kolpingtheater Ramsen. Viele hilfreiche Funktionen für die Probe.',
    url: 'https://skript.logge.top',
    siteName: 'Kolpingtheater Ramsen',
    locale: 'de_DE',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        alt: 'Kolpingtheater Ramsen',
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} ${cinzel.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
