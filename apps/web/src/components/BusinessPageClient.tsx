'use client'

import { useState } from 'react'
import BusinessBot from '@/components/BusinessBot'
import type { Service, Product, Staff } from '@/types/database'

const BASE_URL = 'https://gestai-app.vercel.app'

const DAYS: Record<string, string> = {
  '1': 'Lunes', '2': 'Martes', '3': 'Miércoles',
  '4': 'Jueves', '5': 'Viernes', '6': 'Sábado', '0': 'Domingo',
}
const DAY_ORDER = ['1', '2', '3', '4', '5', '6', '0']

interface Props {
  business: { id: string; name: string; description: string | null; phone: string | null; logo_url: string | null }
  services: Service[]
  products: Product[]
  staff: Staff[]
  location: { address: string; city: string; hours: Record<string, { open: string; close: string }> } | null
}

export default function BusinessPageClient({ business, services, products, staff, location }: Props) {
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null)
  const [pendingMessage, setPendingMessage] = useState<string | undefined>()
  const hours = location?.hours ?? {}

  const selectedMember = staff.find(s => s.id === selectedStaff)

  const filteredServices = selectedStaff
    ? services.filter(s => !s.staff_ids?.length || s.staff_ids.includes(selectedStaff))
    : services

  return (
    <>
      {/* Logo de fondo traslúcido */}
      {business.logo_url && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url(${business.logo_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.07,
            filter: 'blur(4px)',
          }}
        />
      )}

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-10 px-4 max-w-3xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
        </div>
        <h1 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight mb-3">{business.name}</h1>
        {business.description && (
          <p className="text-white/45 text-[14px] leading-relaxed max-w-lg mx-auto mb-5">{business.description}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[13px]">
          {business.phone && (
            <a href={`tel:${business.phone}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.09] text-white/60 hover:text-white transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.13 6.13l.88-.87a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>
              {business.phone}
            </a>
          )}
          {location?.address && (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.09] text-white/60">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {location.address}{location.city ? `, ${location.city}` : ''}
            </span>
          )}
        </div>
      </section>

      {/* Equipo — selector principal */}
      {staff.length > 0 && (
        <section className="relative z-10 px-4 pb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium text-amber-400/70">Elige tu profesional</h2>
            {selectedStaff && (
              <button onClick={() => setSelectedStaff(null)} className="text-[12px] text-white/30 hover:text-white/60 transition-colors">
                Ver todos
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {staff.map((s) => {
              const active = selectedStaff === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(active ? null : s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-amber-500/15 border border-amber-500/40'
                      : 'bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full overflow-hidden border shrink-0 transition-colors ${
                    active ? 'border-amber-500/50' : 'border-white/[0.12]'
                  }`}>
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[11px] font-bold ${
                        active ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-white/60'
                      }`}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className={`text-[13px] font-medium ${active ? 'text-amber-400' : 'text-white/80'}`}>{s.name}</span>
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              )
            })}
          </div>

          {selectedMember && (
            <div className="mt-3 px-4 py-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-[13px] text-amber-400/80">
              Estás viendo servicios con <strong>{selectedMember.name}</strong> — el asistente puede ayudarte a agendar.
            </div>
          )}
        </section>
      )}

      {/* Servicios */}
      {filteredServices.length > 0 && (
        <section className="relative z-10 px-4 pb-16 max-w-3xl mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium text-amber-400/70 mb-4">
            {selectedMember ? `Servicios con ${selectedMember.name}` : 'Servicios'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredServices.map((s) => (
              <div key={s.id} className="flex flex-col justify-between px-4 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-amber-500/20 transition-colors group">
                <div>
                  <p className="text-[13px] font-medium text-white leading-tight">{s.name}</p>
                  {s.description && <p className="text-[11px] text-white/30 mt-0.5 leading-snug">{s.description}</p>}
                </div>
                <div className="mt-2.5 flex items-end justify-between">
                  <p className="text-[13px] font-semibold text-amber-400">${Number(s.price).toLocaleString('es-CL')}</p>
                  <p className="text-[11px] text-white/25">{s.duration_minutes} min</p>
                </div>
                <button
                  onClick={() => setPendingMessage(`Quiero agendar ${s.name} ($${Number(s.price).toLocaleString('es-CL')}, ${s.duration_minutes} min)${selectedMember ? ` con ${selectedMember.name}` : ''}`)}
                  className="mt-3 w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[12px] font-medium transition-all duration-150"
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Productos */}
      {products.length > 0 && (
        <section className="relative z-10 px-4 pb-16 max-w-3xl mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium text-amber-400/70 mb-4">Productos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((p) => (
              <div key={p.id} className="p-[5px] rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-amber-500/20 transition-colors">
                <div className="rounded-[calc(1rem-2px)] bg-[#111010] overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-white/[0.03] flex items-center justify-center text-white/10">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    </div>
                  )}
                  <div className="px-3 py-3">
                    <p className="text-[13px] font-medium text-white truncate">{p.name}</p>
                    {p.brand && <p className="text-[11px] text-white/30">{p.brand}</p>}
                    <p className="text-[13px] font-semibold text-amber-400 mt-1">${Number(p.price).toLocaleString('es-CL')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Horarios */}
      {Object.keys(hours).length > 0 && (
        <section className="relative z-10 px-4 pb-16 max-w-3xl mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium text-amber-400/70 mb-4">Horarios</h2>
          <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] divide-y divide-white/[0.05] overflow-hidden">
            {DAY_ORDER.filter(d => hours[d]).map((day) => (
              <div key={day} className="flex items-center justify-between px-5 py-3">
                <p className="text-[13px] text-white/60">{DAYS[day]}</p>
                <p className="text-[13px] text-white font-medium">{hours[day].open} – {hours[day].close}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Chat */}
      <BusinessBot
        businessId={business.id}
        businessName={business.name}
        selectedStaffName={selectedMember?.name}
        pendingMessage={pendingMessage}
        onPendingConsumed={() => setPendingMessage(undefined)}
      />
    </>
  )
}
