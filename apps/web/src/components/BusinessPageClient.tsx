'use client'

import { useState } from 'react'
import BusinessBot from '@/components/BusinessBot'
import type { Service, Product, Staff } from '@/types/database'

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
            backgroundSize: '60%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.03,
          }}
        />
      )}

      {/* Hero */}
      <section className="relative z-10 pt-36 pb-12 px-4 max-w-3xl mx-auto text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-[22px] overflow-hidden bg-white shadow-[0_8px_32px_rgba(37,99,235,0.12),0_2px_8px_rgba(37,99,235,0.06)] flex items-center justify-center border border-blue-950/[0.06]">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
              <rect x="14" y="14" width="22" height="22" rx="7" fill="#1D4ED8" fillOpacity="0.35"/>
              <rect x="4"  y="4"  width="22" height="22" rx="7" fill="#3B82F6"/>
            </svg>
          )}
        </div>
        <h1 className="text-[2.2rem] sm:text-[2.8rem] font-bold tracking-tight text-[#0a0f1e] mb-3 leading-[1.1]">
          {business.name}
        </h1>
        {business.description && (
          <p className="text-slate-500 text-[15px] leading-relaxed max-w-lg mx-auto mb-6">
            {business.description}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-[13px]">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-blue-950/[0.08] text-[#0a0f1e] hover:border-blue-400/50 hover:shadow-[0_4px_16px_rgba(37,99,235,0.10)] transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.43 2 2 0 0 1 3.58 1.25h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.68 2.81a2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.13 6.13l.88-.87a2 2 0 0 1 2.11-.45c.91.32 1.85.55 2.81.68A2 2 0 0 1 22 16.92z"/></svg>
              {business.phone}
            </a>
          )}
          {location?.address && (
            <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-blue-950/[0.08] text-slate-500 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {location.address}{location.city ? `, ${location.city}` : ''}
            </span>
          )}
        </div>
      </section>

      {/* Equipo */}
      {staff.length > 0 && (
        <section className="relative z-10 px-4 pb-12 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-950/40">
              Elige tu profesional
            </h2>
            {selectedStaff && (
              <button onClick={() => setSelectedStaff(null)} className="text-[12px] text-slate-400 hover:text-blue-600 transition-colors">
                Ver todos
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {staff.map((s) => {
              const active = selectedStaff === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStaff(active ? null : s.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-full transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-[0_8px_24px_rgba(37,99,235,0.30),0_2px_6px_rgba(37,99,235,0.15)]'
                      : 'bg-white border border-blue-950/[0.08] text-[#0a0f1e] hover:border-blue-300/60 hover:shadow-[0_4px_16px_rgba(37,99,235,0.10)] shadow-[0_2px_6px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full overflow-hidden shrink-0 ${active ? 'ring-2 ring-white/30' : ''}`}>
                    {s.avatar_url ? (
                      <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center text-[11px] font-bold ${active ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-[13px] font-medium">{s.name}</span>
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </button>
              )
            })}
          </div>
          {selectedMember && (
            <div className="mt-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200/60 text-[13px] text-blue-700 shadow-[0_2px_8px_rgba(37,99,235,0.08)]">
              Estás viendo servicios con <strong>{selectedMember.name}</strong> — el asistente puede ayudarte a agendar.
            </div>
          )}
        </section>
      )}

      {/* Servicios */}
      {filteredServices.length > 0 && (
        <section className="relative z-10 px-4 pb-16 max-w-3xl mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-950/40 mb-5">
            {selectedMember ? `Servicios con ${selectedMember.name}` : 'Servicios'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredServices.map((s) => (
              <div key={s.id} className="flex flex-col justify-between p-4 rounded-2xl bg-white border border-blue-950/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.12),0_2px_8px_rgba(37,99,235,0.06)] hover:-translate-y-0.5 transition-all duration-200">
                <div>
                  <p className="text-[13px] font-semibold text-[#0a0f1e] leading-tight">{s.name}</p>
                  {s.description && <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.description}</p>}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <p className="text-[14px] font-bold text-[#0a0f1e]">${Number(s.price).toLocaleString('es-CL')}</p>
                  <p className="text-[11px] text-slate-300">{s.duration_minutes} min</p>
                </div>
                <button
                  onClick={() => setPendingMessage(`Quiero agendar ${s.name} ($${Number(s.price).toLocaleString('es-CL')}, ${s.duration_minutes} min)${selectedMember ? ` con ${selectedMember.name}` : ''}`)}
                  className="mt-3.5 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-semibold transition-all duration-150 shadow-[0_2px_8px_rgba(37,99,235,0.25)]"
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
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-950/40 mb-5">Productos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map((p) => (
              <div key={p.id} className="rounded-2xl bg-white border border-blue-950/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.12),0_2px_8px_rgba(37,99,235,0.06)] hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="w-full h-28 bg-blue-50 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
                      <rect x="14" y="14" width="22" height="22" rx="7" fill="#1D4ED8" fillOpacity="0.2"/>
                      <rect x="4"  y="4"  width="22" height="22" rx="7" fill="#3B82F6" fillOpacity="0.35"/>
                    </svg>
                  </div>
                )}
                <div className="px-3.5 py-3.5">
                  <p className="text-[13px] font-semibold text-[#0a0f1e] truncate">{p.name}</p>
                  {p.brand && <p className="text-[11px] text-slate-400">{p.brand}</p>}
                  <p className="text-[14px] font-bold text-[#0a0f1e] mt-1.5">${Number(p.price).toLocaleString('es-CL')}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Horarios */}
      {Object.keys(hours).length > 0 && (
        <section className="relative z-10 px-4 pb-16 max-w-3xl mx-auto">
          <h2 className="text-[11px] uppercase tracking-[0.18em] font-semibold text-blue-950/40 mb-5">Horarios</h2>
          <div className="rounded-2xl bg-white border border-blue-950/[0.06] shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-blue-950/[0.04]">
            {DAY_ORDER.filter(d => hours[d]).map((day) => (
              <div key={day} className="flex items-center justify-between px-5 py-3.5">
                <p className="text-[13px] text-slate-500">{DAYS[day]}</p>
                <p className="text-[13px] text-[#0a0f1e] font-semibold">{hours[day].open} – {hours[day].close}</p>
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
