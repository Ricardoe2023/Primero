import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: { default: 'Gestai', template: '%s | Gestai' },
  description: 'Gestiona tu negocio de servicios con IA: agenda, clientes, pagos y reportes en un solo lugar.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Gestai' },
}

export const viewport: Viewport = {
  themeColor: '#060f1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#060f1a] text-[#fafaf9] font-sans">{children}</body>
    </html>
  )
}
