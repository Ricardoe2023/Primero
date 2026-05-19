import Image from 'next/image'
import {
  Bebas_Neue,
  Playfair_Display,
  Barlow_Condensed,
  Quicksand,
  IBM_Plex_Mono,
  Unbounded,
} from 'next/font/google'

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400' })
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['600', '700'] })
const barlow = Barlow_Condensed({ subsets: ['latin'], weight: ['400', '500', '600'] })
const quicksand = Quicksand({ subsets: ['latin'], weight: ['500', '600', '700'] })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'] })
const unbounded = Unbounded({ subsets: ['latin'], weight: ['400', '500', '700'] })

// ── ÍCONOS MINIMALISTAS ────────────────────────────────────────────────────

// G en círculo fino
const IconGCircle = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <circle cx="14" cy="14" r="12.5" stroke="#f59e0b" strokeWidth="1.2" />
    <path d="M19 14h-4v3h4" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19 10a6 6 0 1 0 0 8" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

// G bold angular
const IconGBold = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <text x="2" y="23" fontSize="24" fontWeight="800" fontFamily="system-ui, sans-serif" fill="#f5f5f4">G</text>
    <rect x="18" y="14" width="7" height="1.5" fill="#f59e0b" rx="0.75" />
  </svg>
)

// Chispa 4 puntas outline
const IconSpark = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path
      d="M14 3 L15.8 11.2 L24 13 L15.8 14.8 L14 23 L12.2 14.8 L4 13 L12.2 11.2 Z"
      stroke="#f59e0b" strokeWidth="1.3" strokeLinejoin="round" fill="none"
    />
  </svg>
)

// Tres arcos concéntricos (señal/ondas)
const IconWaves = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M8 20 Q14 8 20 20" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    <path d="M4 22 Q14 2 24 22" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" fill="none" strokeOpacity="0.5" />
    <circle cx="14" cy="22" r="1.5" fill="#f59e0b" />
  </svg>
)

// Hexágono outline
const IconHex = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <polygon
      points="14,2 24,8 24,20 14,26 4,20 4,8"
      stroke="#f59e0b" strokeWidth="1.3" fill="none"
    />
    <polygon
      points="14,7 20,10.5 20,17.5 14,21 8,17.5 8,10.5"
      stroke="#f59e0b" strokeWidth="0.8" fill="none" strokeOpacity="0.4"
    />
  </svg>
)

// Dos líneas curvas (flujo / gestión)
const IconFlow = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M4 8 Q10 8 14 14 Q18 20 24 20" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M4 14 Q10 14 14 14" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" fill="none" strokeOpacity="0.4" />
    <circle cx="24" cy="20" r="2.2" stroke="#f59e0b" strokeWidth="1.4" fill="none" />
  </svg>
)

// Cruz / más minimalista
const IconPlus = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M14 5 L14 23 M5 14 L23 14" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="14" cy="14" r="4" stroke="#f59e0b" strokeWidth="1.2" fill="none" strokeOpacity="0.5" />
  </svg>
)

// Triángulo ascendente (crecimiento)
const IconUp = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none">
    <path d="M14 4 L25 22 L3 22 Z" stroke="#f59e0b" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
    <path d="M14 11 L14 17 M11 17 L17 17" stroke="#f59e0b" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

// ── COMPONENTES ────────────────────────────────────────────────────────────

function Section({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mt-10 mb-4">
      <span className="text-[10px] uppercase tracking-[0.2em] text-amber-400/50 font-medium whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  )
}

function LogoRow({
  num,
  icon,
  wordmark,
  fontName,
  note,
}: {
  num: number
  icon: React.ReactNode
  wordmark: React.ReactNode
  fontName: string
  note: string
}) {
  return (
    <div className="group flex items-center gap-6 px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] hover:border-amber-500/25 transition-colors">
      <span className="text-[11px] text-white/20 w-4 shrink-0">{num}</span>
      {/* standalone */}
      <div className="flex items-center gap-2.5 flex-1">
        {icon}
        {wordmark}
      </div>
      {/* navbar pill */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full shrink-0" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {icon}
        {wordmark}
      </div>
      <div className="text-right shrink-0 w-28">
        <p className="text-[11px] text-amber-400/60 font-medium">{fontName}</p>
        <p className="text-[10px] text-white/25 mt-0.5">{note}</p>
      </div>
    </div>
  )
}

export default function LogoPreviewPage() {
  const H = 19 // wordmark font size

  return (
    <div className="min-h-screen bg-[#080706] text-[#fafaf9] px-6 py-12">
      <div className="max-w-3xl mx-auto">

        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-400/50 mb-2">Logo Preview · Gestai</p>
        <h1 className="text-2xl font-bold mb-1">Alternativas de tipografía e icono</h1>
        <p className="text-white/35 text-sm mb-2">Cada fila: versión standalone + en navbar pill</p>

        {/* ── TIPOGRAFÍAS ── */}
        <Section title="Tipografías — mismo ícono N" />

        <div className="flex flex-col gap-2">
          <LogoRow num={1} fontName="Bebas Neue" note="condensed, impacto"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={bebas.className} style={{ fontSize: H + 4, letterSpacing: '0.08em', color: '#f5f5f4', lineHeight: 1 }}>GESTAI</span>}
          />
          <LogoRow num={2} fontName="Playfair Display" note="serif, elegante"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={playfair.className} style={{ fontSize: H, fontWeight: 600, letterSpacing: '0.01em', color: '#f5f5f4', lineHeight: 1, fontStyle: 'italic' }}>Gestai</span>}
          />
          <LogoRow num={3} fontName="Barlow Condensed" note="condensed, limpio"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={barlow.className} style={{ fontSize: H + 3, fontWeight: 600, letterSpacing: '0.12em', color: '#f5f5f4', lineHeight: 1, textTransform: 'uppercase' as const }}>Gestai</span>}
          />
          <LogoRow num={4} fontName="Quicksand" note="redondo, amigable"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={quicksand.className} style={{ fontSize: H, fontWeight: 700, letterSpacing: '-0.01em', color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
          <LogoRow num={5} fontName="IBM Plex Mono" note="monoespaciado, dev"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={mono.className} style={{ fontSize: H - 2, fontWeight: 500, letterSpacing: '0.04em', color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
          <LogoRow num={6} fontName="Unbounded" note="futurista, wide"
            icon={<Image src="/novu-logo.png" alt="" width={22} height={22} style={{ objectFit:'contain', mixBlendMode:'screen' }} />}
            wordmark={<span className={unbounded.className} style={{ fontSize: H - 4, fontWeight: 500, letterSpacing: '0.01em', color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
        </div>

        {/* ── ÍCONOS G ── */}
        <Section title="Ícono con G · sin fondo" />

        <div className="flex flex-col gap-2">
          <LogoRow num={7} fontName="G + Bebas" note="ícono G círculo"
            icon={<IconGCircle size={24} />}
            wordmark={<span className={bebas.className} style={{ fontSize: H + 4, letterSpacing: '0.08em', color: '#f5f5f4', lineHeight: 1 }}>GESTAI</span>}
          />
          <LogoRow num={8} fontName="G + Unbounded" note="ícono G bold"
            icon={<IconGBold size={26} />}
            wordmark={<span className={unbounded.className} style={{ fontSize: H - 4, fontWeight: 700, color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
        </div>

        {/* ── ÍCONOS ABSTRACTOS ── */}
        <Section title="Íconos abstractos · sin fondo" />

        <div className="flex flex-col gap-2">
          <LogoRow num={9} fontName="Bebas + Chispa" note="✦ spark, IA"
            icon={<IconSpark size={24} />}
            wordmark={<span className={bebas.className} style={{ fontSize: H + 4, letterSpacing: '0.08em', color: '#f5f5f4', lineHeight: 1 }}>GESTAI</span>}
          />
          <LogoRow num={10} fontName="Unbounded + Ondas" note="señal / tech"
            icon={<IconWaves size={24} />}
            wordmark={<span className={unbounded.className} style={{ fontSize: H - 4, fontWeight: 500, color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
          <LogoRow num={11} fontName="Barlow + Hexágono" note="estructura"
            icon={<IconHex size={24} />}
            wordmark={<span className={barlow.className} style={{ fontSize: H + 3, fontWeight: 600, letterSpacing: '0.12em', color: '#f5f5f4', lineHeight: 1, textTransform: 'uppercase' as const }}>Gestai</span>}
          />
          <LogoRow num={12} fontName="Playfair + Flujo" note="gestión / curva"
            icon={<IconFlow size={24} />}
            wordmark={<span className={playfair.className} style={{ fontSize: H, fontWeight: 700, color: '#f5f5f4', lineHeight: 1, fontStyle: 'italic' }}>Gestai</span>}
          />
          <LogoRow num={13} fontName="Quicksand + Triángulo" note="crecimiento"
            icon={<IconUp size={24} />}
            wordmark={<span className={quicksand.className} style={{ fontSize: H, fontWeight: 700, color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
          <LogoRow num={14} fontName="Mono + Cruz" note="precisión"
            icon={<IconPlus size={24} />}
            wordmark={<span className={mono.className} style={{ fontSize: H - 2, fontWeight: 500, letterSpacing: '0.04em', color: '#f5f5f4', lineHeight: 1 }}>gestai</span>}
          />
        </div>

        <p className="text-[10px] text-white/20 text-center mt-10">gestai.app · logo preview</p>
      </div>
    </div>
  )
}
