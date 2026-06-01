'use client'

import { useState } from 'react'
import Link from 'next/link'

type BgMode = 'navy' | 'dark' | 'light'

const theme = {
  navy:  { page: '#0b1526', card: '#0f1e35', border: 'rgba(96,165,250,0.10)', label: 'rgba(255,255,255,0.22)', text: '#fff' },
  dark:  { page: '#080706', card: '#0f0f10', border: 'rgba(255,255,255,0.07)', label: 'rgba(255,255,255,0.22)', text: '#fff' },
  light: { page: '#e8eaed', card: '#ffffff',  border: 'rgba(0,0,0,0.07)',       label: 'rgba(0,0,0,0.28)',      text: '#0f0e0d' },
}

const B  = '#3B82F6'
const BL = '#60A5FA'
const BD = '#1D4ED8'
const W  = '#ffffff'

export default function LogosPage() {
  const [mode, setMode] = useState<BgMode>('navy')
  const c = theme[mode]

  return (
    <div className="min-h-dvh transition-colors duration-300" style={{ background: c.page }}>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 py-3 border-b"
        style={{ background: 'rgba(4,8,18,0.9)', backdropFilter: 'blur(16px)', borderColor: 'rgba(255,255,255,0.06)' }}>
        <span className="text-white/30 text-[10px] mr-2 uppercase tracking-widest">Fondo</span>
        {(['navy','dark','light'] as BgMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-[11px] font-semibold transition-all ${mode === m ? 'bg-white text-black' : 'text-white/40 hover:text-white border border-white/12'}`}>
            {{ navy:'Marino', dark:'Negro', light:'Blanco' }[m]}
          </button>
        ))}
        <Link href="/preview" className="ml-4 text-white/20 hover:text-white/50 text-[11px] transition-colors">← Diseños</Link>
      </div>

      <div className="pt-20 pb-28 px-5 max-w-4xl mx-auto">
        <p className="text-center text-[10px] uppercase tracking-[0.22em] mb-14" style={{ color: c.label }}>
          Abstract logos · GestAI · Ronda 6
        </p>
        <div className="grid grid-cols-3 gap-4">
          {logos.map((logo, i) => (
            <div key={i} className="flex flex-col items-center gap-5 py-9 px-5 rounded-2xl border"
              style={{ background: c.card, borderColor: c.border }}>
              <div className="w-16 h-16 flex items-center justify-center">{logo.render(58, mode)}</div>
              <div className="flex items-center gap-5">
                <div className="w-9 h-9 flex items-center justify-center">{logo.render(32, mode)}</div>
                <div className="w-6 h-6 flex items-center justify-center">{logo.render(20, mode)}</div>
              </div>
              <div className="flex items-center gap-2">
                {logo.render(18, mode)}
                <span className="font-extrabold text-[13px] tracking-tight" style={{ color: c.text }}>gestai</span>
              </div>
              <p className="text-[9px] uppercase tracking-[0.18em] font-bold text-center" style={{ color: c.label }}>{logo.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const logos = [

  /* 1 — dos rectángulos en tensión: grandes masas que casi se tocan
     el espacio entre ellos ES el logo */
  {
    name: 'Tensión',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="t1" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={BL}/><stop offset="100%" stopColor={BD}/>
          </linearGradient>
        </defs>
        <rect x="2"  y="2"  width="16" height="36" rx="5" fill="url(#t1)"/>
        <rect x="22" y="2"  width="16" height="36" rx="5" fill="url(#t1)" fillOpacity="0.4"/>
      </svg>
    ),
  },

  /* 2 — forma líquida: blob orgánico-geométrico, entre cuadrado y círculo */
  {
    name: 'Líquido',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="lq" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={BL}/><stop offset="100%" stopColor={BD}/>
          </linearGradient>
        </defs>
        <path d="M20 3 C30 3 38 8 38 18 C38 30 30 38 20 37 C10 36 2 28 3 18 C4 8 10 3 20 3 Z"
          fill="url(#lq)"/>
      </svg>
    ),
  },

  /* 3 — condensación: muchas líneas finas que se vuelven una masa densa */
  {
    name: 'Condensación',
    render: (s: number, mode: BgMode) => {
      const col = mode === 'light' ? BD : W
      return (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
          {[0,1,2,3,4,5,6].map(i => (
            <line key={i}
              x1={4 + i * 2} y1="5"
              x2={20}        y2="35"
              stroke={i < 3 ? col : B}
              strokeWidth={i < 3 ? 1 + i * 0.4 : 2 + (i - 3) * 0.8}
              strokeLinecap="round"
              strokeOpacity={0.2 + i * 0.12}
            />
          ))}
        </svg>
      )
    },
  },

  /* 4 — rectángulo diagonal: masa sólida rotada, solo eso — bold y limpio */
  {
    name: 'Masa Diagonal',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <defs>
          <linearGradient id="md" x1="0" y1="40" x2="40" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={BD}/><stop offset="100%" stopColor={BL}/>
          </linearGradient>
        </defs>
        <rect x="8" y="8" width="24" height="24" rx="6" fill="url(#md)"
          transform="rotate(15 20 20)"/>
        <rect x="11" y="11" width="18" height="18" rx="4" fill={BD}
          transform="rotate(15 20 20)"/>
      </svg>
    ),
  },

  /* 5 — acorde de líneas: barras verticales de alturas distintas
     como frecuencia de audio, como un código de barras vivo */
  {
    name: 'Acorde',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        {[
          { x:5,  h:14, y:26, o:0.3 },
          { x:11, h:24, y:16, o:0.5 },
          { x:17, h:32, y:8,  o:0.75 },
          { x:23, h:32, y:8,  o:1   },
          { x:29, h:20, y:20, o:0.6 },
          { x:35, h:10, y:30, o:0.35 },
        ].map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width="4" height={b.h} rx="2"
            fill={B} fillOpacity={b.o}/>
        ))}
      </svg>
    ),
  },

  /* 6 — punto de masa: círculo que sangra por el borde — sugiere infinitud */
  {
    name: 'Masa',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <circle cx="28" cy="28" r="22" fill={B}/>
        <circle cx="28" cy="28" r="14" fill={BD}/>
        <circle cx="16" cy="16" r="5" fill={BL}/>
      </svg>
    ),
  },

  /* 7 — chevron triple: tres V apiladas, peso descendente */
  {
    name: 'Chevron',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <polyline points="6,8  20,18  34,8"
          stroke={B} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <polyline points="6,19 20,29  34,19"
          stroke={B} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.55"/>
        <polyline points="6,30 20,40  34,30"
          stroke={B} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.25"/>
      </svg>
    ),
  },

  /* 8 — sombra: forma y su offset — profundidad, dualidad, presencia */
  {
    name: 'Sombra',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        {/* sombra offset */}
        <rect x="12" y="12" width="22" height="22" rx="7" fill={BD} fillOpacity="0.4"/>
        {/* forma principal */}
        <rect x="6"  y="6"  width="22" height="22" rx="7" fill={B}/>
      </svg>
    ),
  },

  /* 9 — scatter intencional: 5 puntos en disposición que no es aleatoria
     pero tampoco simétrica — caos controlado */
  {
    name: 'Scatter',
    render: (s: number, _: BgMode) => (
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
        <circle cx="8"  cy="32" r="3.5" fill={BD} fillOpacity="0.5"/>
        <circle cx="16" cy="20" r="5"   fill={B}  fillOpacity="0.7"/>
        <circle cx="28" cy="28" r="3"   fill={BL} fillOpacity="0.6"/>
        <circle cx="22" cy="10" r="6"   fill={B}/>
        <circle cx="34" cy="16" r="2.5" fill={BL} fillOpacity="0.8"/>
      </svg>
    ),
  },

]
