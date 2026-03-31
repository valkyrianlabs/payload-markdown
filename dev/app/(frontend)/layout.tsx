import '../globals.css'

import type { Metadata } from 'next'

import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  description: 'Self-hosted encrypted cloud storage platform',
  title: {
    default: 'payload-markdown',
    template: '%s | payload-markdown',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          inter.variable,
          'font-sans antialiased',
          'bg-background text-foreground',
          'min-h-screen',
        ].join(' ')}
      >
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
