import type { Metadata, Viewport } from 'next'
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google'
import { AppShell } from '@/components/shell/app-shell'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-dm-serif',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono-face',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'DAYBREAK — A world of news, shaped around you',
    template: '%s · DAYBREAK',
  },
  description:
    'DAYBREAK is a personalized morning newspaper: a daily edition on the web and as a PDF, shaped by your interests.',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#F7F4ED',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${dmSerif.variable} ${mono.variable}`}
    >
      <body className="antialiased bg-paper text-ink min-h-dvh">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
