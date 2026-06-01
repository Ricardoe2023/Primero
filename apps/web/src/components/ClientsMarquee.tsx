const ROW_1 = [
  { name: 'Routine BarberStudio', category: 'Barbería' },
  { name: 'Studio Nails', category: 'Nails' },
  { name: 'Aura Spa', category: 'Estética' },
  { name: 'Ink Society', category: 'Tatuajes' },
  { name: 'Alta Barber', category: 'Barbería' },
  { name: 'Pink Polish', category: 'Nails' },
  { name: 'Belle Estética', category: 'Estética' },
  { name: 'Black Line Studio', category: 'Tatuajes' },
  { name: 'Club de la Barba', category: 'Barbería' },
  { name: 'Nail Art Lounge', category: 'Nails' },
]

const ROW_2 = [
  { name: 'Sacred Geometry Ink', category: 'Tatuajes' },
  { name: 'Glow Studio', category: 'Estética' },
  { name: 'Glam Nails', category: 'Nails' },
  { name: 'Vikingos Barber', category: 'Barbería' },
  { name: 'Flash Studio', category: 'Tatuajes' },
  { name: 'Centro Vital', category: 'Estética' },
  { name: 'Nails & Co.', category: 'Nails' },
  { name: 'Barbudos', category: 'Barbería' },
  { name: 'Tattoo Collective', category: 'Tatuajes' },
  { name: 'Spa Esencia', category: 'Estética' },
]

const CATEGORY_DOT: Record<string, string> = {
  Barbería: 'bg-amber-400',
  Nails:    'bg-rose-400',
  Estética: 'bg-violet-400',
  Tatuajes: 'bg-sky-400',
}

function LogoCard({ name, category }: { name: string; category: string }) {
  return (
    <div className="shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-blue-950/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.05)] mx-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_DOT[category]}`} />
      <span className="text-[14px] font-semibold text-slate-600 whitespace-nowrap tracking-tight">
        {name}
      </span>
    </div>
  )
}

export default function ClientsMarquee() {
  const row1 = [...ROW_1, ...ROW_1]
  const row2 = [...ROW_2, ...ROW_2]

  return (
    <section className="py-20 overflow-hidden">
      <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-10 text-center">
        Confían en Gestai
      </p>

      {/* Row 1 — right to left */}
      <div className="relative mb-3">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex animate-ticker">
          {row1.map((c, i) => <LogoCard key={i} {...c} />)}
        </div>
      </div>

      {/* Row 2 — left to right (reverse) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex animate-ticker-reverse">
          {row2.map((c, i) => <LogoCard key={i} {...c} />)}
        </div>
      </div>
    </section>
  )
}
