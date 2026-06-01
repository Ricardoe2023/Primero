'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/dashboard/configuracion/horarios', label: 'Horarios' },
  { href: '/dashboard/configuracion/personal', label: 'Personal' },
  { href: '/dashboard/configuracion/servicios', label: 'Servicios' },
  { href: '/dashboard/configuracion/mi-pagina', label: 'Mi página' },
  { href: '/dashboard/configuracion/consentimiento', label: 'Consentimiento' },
]

export default function ConfigShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl">
      <div className="mb-5">
        <p className="text-[13px] text-blue-400/70 font-medium mb-0.5">Dashboard</p>
        <h1 className="text-[22px] font-semibold text-white">Configuración</h1>
      </div>

      <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/[0.07] rounded-xl p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`shrink-0 text-center py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-[13px] font-medium transition-all duration-150 leading-tight whitespace-nowrap ${
                active
                  ? 'bg-amber-500/15 text-blue-400 border border-blue-500/25'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {children}
    </div>
  )
}
