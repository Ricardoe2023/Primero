'use client'

import { useState } from 'react'
import Link from 'next/link'

const variants = ['Dark Tech', 'Warm Minimal', 'Bold Split'] as const
type Variant = typeof variants[number]

export default function PreviewPage() {
  const [active, setActive] = useState<Variant>('Dark Tech')

  return (
    <div className="min-h-dvh bg-[#111] font-sans">
      {/* Variant switcher */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-3 bg-black/80 backdrop-blur border-b border-white/10">
        <span className="text-white/40 text-xs mr-2 uppercase tracking-widest">Variante</span>
        {variants.map((v) => (
          <button
            key={v}
            onClick={() => setActive(v)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              active === v
                ? 'bg-white text-black'
                : 'text-white/50 hover:text-white border border-white/20'
            }`}
          >
            {v}
          </button>
        ))}
        <Link
          href="/"
          className="ml-4 text-white/30 hover:text-white/60 text-xs transition-colors"
        >
          ← Volver
        </Link>
      </div>

      <div className="pt-12">
        {active === 'Dark Tech' && <DarkTech />}
        {active === 'Warm Minimal' && <WarmMinimal />}
        {active === 'Bold Split' && <BoldSplit />}
      </div>
    </div>
  )
}

/* ─── VARIANTE 1: DARK TECH ─────────────────────────────────────────────── */
function DarkTech() {
  return (
    <div className="min-h-dvh bg-[#080706] text-white flex flex-col">
      {/* Navbar */}
      <header className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="text-white font-bold text-lg tracking-tight">GestAI</span>
        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-white/50">
          <a href="#" className="hover:text-white transition-colors">Funciones</a>
          <a href="#" className="hover:text-white transition-colors">Precios</a>
          <a href="#" className="hover:text-white transition-colors">Demo</a>
        </nav>
        <button className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold transition-colors">
          Empieza gratis
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-20 pt-10 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-[12px] font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          IA para profesionales de servicios · Ya disponible
        </div>

        <h1 className="text-[3.2rem] sm:text-[5rem] font-black tracking-tighter leading-[0.95] mb-6 max-w-4xl">
          Tu negocio,<br />
          <span className="text-blue-400">en piloto automático.</span>
        </h1>
        <p className="text-white/50 text-[16px] sm:text-[18px] max-w-xl leading-relaxed mb-10">
          El asistente de IA que agenda citas, confirma por WhatsApp y gestiona tus clientes — para barberías, clínicas, estudios y más.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <button className="px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-[14px] transition-all shadow-[0_0_30px_rgba(37,99,235,0.45)] hover:shadow-[0_0_40px_rgba(37,99,235,0.65)]">
            Empieza gratis →
          </button>
          <button className="px-7 py-3.5 rounded-full border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-medium text-[14px] transition-all">
            Ver demo
          </button>
        </div>

        {/* Phone mockup */}
        <div className="relative w-[280px] mx-auto">
          <div className="rounded-[36px] bg-[#1a1a1a] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden">
            {/* Phone header */}
            <div className="px-5 pt-5 pb-3 border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">G</div>
                <div>
                  <p className="text-white text-[13px] font-semibold">GestAI Bot</p>
                  <p className="text-blue-400 text-[11px]">● En línea</p>
                </div>
              </div>
            </div>
            {/* Chat */}
            <div className="px-4 py-4 space-y-3 bg-[#0f0f0f]">
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-[12px] rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[75%] leading-relaxed">
                  Hola, quiero cortarme para el viernes 🙌
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-white/90 text-[12px] rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[80%] leading-relaxed">
                  ¡Hola! Tengo disponible el viernes a las 10am o 3pm. ¿Cuál te acomoda? 😊
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white text-[12px] rounded-2xl rounded-tr-sm px-3.5 py-2">
                  A las 10am perfecto 👍
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] text-white/90 text-[12px] rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[80%] leading-relaxed">
                  ¡Listo! Tu cita está confirmada para el <strong>viernes 6 a las 10am</strong>. Te recordaré el día antes 🗓️
                </div>
              </div>
            </div>
          </div>
          {/* Glow below phone */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 bg-blue-500/20 blur-2xl rounded-full" />
        </div>

        {/* Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {['✓ Agenda automática', '✓ WhatsApp incluido', '✓ Sin apps extra', '✓ Cualquier rubro'].map(p => (
            <span key={p} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-[12px]">{p}</span>
          ))}
        </div>
      </main>

      {/* Feature strip */}
      <section className="border-t border-white/5 px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'Agenda sin intervención', desc: 'El bot gestiona citas 24/7 por WhatsApp — para cualquier tipo de servicio o profesional.' },
            { icon: '📲', title: 'Confirmaciones automáticas', desc: 'Recordatorios y confirmaciones enviados solos, reduciendo los no-shows.' },
            { icon: '📊', title: 'Panel de control', desc: 'Ve tus citas, ingresos y clientes desde un dashboard limpio, sin importar tu rubro.' },
          ].map(f => (
            <div key={f.title} className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-[15px] mb-1.5">{f.title}</h3>
              <p className="text-white/40 text-[13px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ─── VARIANTE 2: WARM MINIMAL ──────────────────────────────────────────── */
function WarmMinimal() {
  return (
    <div className="min-h-dvh bg-[#f5f4f2] text-[#0f0e0d] flex flex-col">
      {/* Navbar */}
      <header className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto w-full">
        <span className="font-black text-[#0f0e0d] text-lg tracking-tight">GestAI</span>
        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-[#6b6a68]">
          <a href="#" className="hover:text-[#0f0e0d] transition-colors">Funciones</a>
          <a href="#" className="hover:text-[#0f0e0d] transition-colors">Precios</a>
          <a href="#" className="hover:text-[#0f0e0d] transition-colors">Demo</a>
        </nav>
        <button className="px-4 py-2 rounded-full bg-[#0f0e0d] text-white text-[13px] font-bold hover:bg-[#2a2927] transition-colors">
          Empieza gratis
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0f0e0d]/[0.06] text-[#0f0e0d]/60 text-[11px] font-medium mb-8 uppercase tracking-widest">
            IA para profesionales de servicios
          </div>
          <h1 className="text-[3.5rem] sm:text-[4.5rem] font-black tracking-tighter leading-[0.92] mb-6">
            El asistente<br />que nunca<br /><em className="not-italic underline decoration-[3px] underline-offset-4">falla.</em>
          </h1>
          <p className="text-[#6b6a68] text-[16px] leading-relaxed max-w-md mb-10">
            GestAI agenda citas, envía confirmaciones por WhatsApp y gestiona tus clientes automáticamente — para barberías, clínicas estéticas, dentistas, tatuadores, estilistas y más.
          </p>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 rounded-full bg-[#0f0e0d] text-white font-bold text-[14px] hover:bg-[#2a2927] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.15)]">
              Empieza gratis →
            </button>
            <button className="px-6 py-3 rounded-full border border-black/15 text-[#3a3937] font-medium text-[14px] hover:border-black/30 transition-colors">
              Ver demo
            </button>
          </div>
          {/* Trust */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['R','M','C','J'].map((l, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-[#0f0e0d] text-white flex items-center justify-center text-[11px] font-bold border-2 border-[#f5f4f2]">{l}</div>
              ))}
            </div>
            <p className="text-[#9b9997] text-[13px]"><strong className="text-[#0f0e0d]">+200 barberías</strong> ya lo usan</p>
          </div>
        </div>

        {/* Right — floating cards */}
        <div className="relative h-[460px] hidden lg:block">
          {/* Main card */}
          <div className="absolute top-8 left-4 right-4 bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.10),0_4px_16px_rgba(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] text-[#9b9997] uppercase tracking-widest font-semibold">Próximas citas hoy</p>
              <span className="text-[11px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">4 confirmadas</span>
            </div>
            {[
              { time: '10:00', name: 'Valentina R.', service: 'Limpieza facial', avatar: 'V' },
              { time: '11:30', name: 'Carlos V.', service: 'Sesión de tatuaje', avatar: 'C' },
              { time: '13:00', name: 'Matías L.', service: 'Consulta dental', avatar: 'M' },
            ].map(a => (
              <div key={a.time} className="flex items-center gap-3 py-2.5 border-b border-black/[0.04] last:border-0">
                <div className="w-8 h-8 rounded-full bg-[#0f0e0d] text-white flex items-center justify-center text-[11px] font-bold shrink-0">{a.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0f0e0d]">{a.name}</p>
                  <p className="text-[11px] text-[#9b9997]">{a.service}</p>
                </div>
                <span className="text-[12px] font-bold text-[#0f0e0d]">{a.time}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp card */}
          <div className="absolute bottom-4 right-0 w-64 bg-white rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.10)] p-4 rotate-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a9.934 9.934 0 01-5.032-1.359l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884z"/></svg>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[#0f0e0d]">Confirmación enviada</p>
                <p className="text-[10px] text-[#9b9997]">hace 2 minutos</p>
              </div>
            </div>
            <p className="text-[11px] text-[#6b6a68] leading-relaxed bg-[#f5f4f2] rounded-xl px-3 py-2">
              "Tu cita del viernes a las 10am está confirmada ✂️"
            </p>
          </div>

          {/* Mini stat card */}
          <div className="absolute bottom-28 left-0 bg-[#0f0e0d] text-white rounded-2xl shadow-xl p-4 w-36 -rotate-1">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Este mes</p>
            <p className="text-[2rem] font-black leading-none">84</p>
            <p className="text-[11px] text-white/50 mt-1">citas agendadas</p>
          </div>
        </div>
      </main>

      {/* Features strip */}
      <section className="border-t border-black/[0.06] px-8 py-12 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { n: '01', title: 'Para cualquier profesional', desc: 'Barberías, clínicas, dentistas, tatuadores, estilistas — el bot se adapta a tu servicio.' },
            { n: '02', title: 'Confirmaciones automáticas', desc: 'Recordatorios el día anterior para reducir los no-shows en cualquier rubro.' },
            { n: '03', title: 'Dashboard simple', desc: 'Ve todo en un panel limpio: citas, ingresos y clientes, sin importar tu negocio.' },
          ].map(f => (
            <div key={f.n} className="flex gap-4 items-start">
              <span className="text-[11px] font-bold text-[#0f0e0d]/20 mt-1 shrink-0">{f.n}</span>
              <div>
                <h3 className="font-bold text-[15px] text-[#0f0e0d] mb-1">{f.title}</h3>
                <p className="text-[#9b9997] text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ─── VARIANTE 3: BOLD SPLIT ────────────────────────────────────────────── */
function BoldSplit() {
  return (
    <div className="min-h-dvh bg-white text-[#0a0a0a] flex flex-col">
      {/* Navbar */}
      <header className="px-8 py-5 flex items-center justify-between max-w-7xl mx-auto w-full border-b border-black/[0.06]">
        <span className="font-black text-[#0a0a0a] text-lg tracking-tight">GestAI</span>
        <nav className="hidden sm:flex items-center gap-6 text-[13px] text-[#6b6a68]">
          <a href="#" className="hover:text-black transition-colors">Funciones</a>
          <a href="#" className="hover:text-black transition-colors">Precios</a>
          <a href="#" className="hover:text-black transition-colors">Demo</a>
        </nav>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-[13px] text-[#6b6a68] hover:text-black transition-colors">Inicia sesión</button>
          <button className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-[13px] font-bold transition-colors">
            Empieza gratis
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-8 grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-12 items-center py-16">
        {/* Left */}
        <div>
          <h1 className="text-[4rem] sm:text-[5.5rem] font-black tracking-tighter leading-[0.88] mb-8">
            IA para<br />
            <span className="text-emerald-500">tu negocio.</span><br />
            Ya.
          </h1>
          <p className="text-[#6b6a68] text-[17px] leading-relaxed max-w-md mb-8">
            GestAI responde por WhatsApp, agenda citas y confirma clientes automáticamente — para barberías, clínicas estéticas, dentistas, tatuadores, estilistas y cualquier profesional de servicios.
          </p>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4 mb-10 py-6 border-y border-black/[0.07]">
            {[
              { n: '24/7', label: 'disponible' },
              { n: '−40%', label: 'no-shows' },
              { n: '3 min', label: 'para instalar' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-[1.8rem] font-black leading-none text-[#0a0a0a]">{m.n}</p>
                <p className="text-[12px] text-[#9b9997] mt-1">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button className="px-7 py-3.5 rounded-xl bg-[#0a0a0a] text-white font-bold text-[14px] hover:bg-[#222] transition-colors">
              Empieza gratis →
            </button>
            <button className="px-7 py-3.5 rounded-xl border border-black/15 text-[#3a3937] font-medium text-[14px] hover:bg-black/[0.03] transition-colors">
              Ver demo
            </button>
          </div>
        </div>

        {/* Right — dashboard */}
        <div className="hidden lg:block bg-[#f8f8f7] rounded-3xl border border-black/[0.07] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6">
          {/* Dashboard header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] text-[#9b9997] uppercase tracking-widest font-semibold">Dashboard · Hoy</p>
              <p className="text-[18px] font-bold text-[#0a0a0a] mt-0.5">Barbería El Clásico</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 text-[11px] font-semibold">Bot activo</span>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Citas hoy', value: '8', delta: '+2', color: 'emerald' },
              { label: 'Ingresos', value: '$96k', delta: '+12%', color: 'emerald' },
              { label: 'No-shows', value: '0', delta: '−100%', color: 'emerald' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-3.5 border border-black/[0.05] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                <p className="text-[10px] text-[#9b9997] uppercase tracking-wider mb-1">{s.label}</p>
                <p className="text-[1.4rem] font-black text-[#0a0a0a] leading-none">{s.value}</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-1">{s.delta} vs ayer</p>
              </div>
            ))}
          </div>

          {/* Citas */}
          <div className="bg-white rounded-2xl border border-black/[0.05] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="px-4 py-3 border-b border-black/[0.05]">
              <p className="text-[12px] font-semibold text-[#0a0a0a]">Próximas citas</p>
            </div>
            {[
              { time: '10:00', name: 'Valentina R.', service: 'Limpieza facial', status: 'Confirmado' },
              { time: '11:30', name: 'Carlos V.', service: 'Sesión de tatuaje', status: 'Confirmado' },
              { time: '13:00', name: 'Matías L.', service: 'Consulta dental', status: 'Pendiente' },
              { time: '15:30', name: 'Sofía M.', service: 'Tinte + corte', status: 'Confirmado' },
            ].map(a => (
              <div key={a.time} className="flex items-center justify-between px-4 py-2.5 border-b border-black/[0.03] last:border-0 hover:bg-black/[0.01] transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-[#9b9997] w-10 shrink-0">{a.time}</span>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0a0a0a]">{a.name}</p>
                    <p className="text-[11px] text-[#9b9997]">{a.service}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  a.status === 'Confirmado'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {a.status}
                </span>
              </div>
            ))}
          </div>

          {/* WhatsApp preview */}
          <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-green-500 rounded-2xl">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" className="shrink-0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413z"/><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.029 18.88a9.934 9.934 0 01-5.032-1.359l-.361-.214-3.741.982.998-3.648-.235-.374A9.86 9.86 0 012.148 12c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884z"/></svg>
            <div className="flex-1 min-w-0">
              <p className="text-white text-[11px] font-semibold">Bot envió confirmación a Sofía M.</p>
              <p className="text-white/70 text-[10px]">hace 30 segundos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom strip */}
      <div className="border-t border-black/[0.06] py-6 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <p className="text-[12px] text-[#9b9997]">Confiado por más de 200 profesionales de servicios en Latinoamérica</p>
          <div className="flex items-center gap-6">
            {['Sin contrato', 'Cancela cuando quieras', 'Soporte incluido'].map(t => (
              <span key={t} className="text-[12px] text-[#9b9997] flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
