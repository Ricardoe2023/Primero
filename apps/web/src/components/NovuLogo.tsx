import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' })

interface Props {
  height?: number
  wordmark?: boolean
  subtitle?: string
  subtitleColor?: string
}

function SombraIcon({ size }: { size: number }) {
  const s = size
  return (
    <svg width={s} height={s} viewBox="0 0 40 40" fill="none" aria-hidden>
      {/* sombra offset */}
      <rect x="14" y="14" width="22" height="22" rx="7" fill="#1D4ED8" fillOpacity="0.45"/>
      {/* forma principal */}
      <rect x="4" y="4" width="22" height="22" rx="7" fill="#3B82F6"/>
    </svg>
  )
}

export default function NovuLogo({ height = 32, wordmark = false, subtitle, subtitleColor = '#3B82F6' }: Props) {
  const iconSize = Math.round(height * 1.35)
  const fontSize = Math.round(height * 0.66)

  return (
    <span className="inline-flex items-center gap-1.5">
      <SombraIcon size={iconSize} />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={unbounded.className}
            style={{ fontSize, fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1, color: '#0a0f1e' }}
          >
            gestai
          </span>
          {subtitle && (
            <span style={{ fontSize: fontSize * 0.55, fontWeight: 600, color: subtitleColor, lineHeight: 1, marginTop: 3 }}>
              {subtitle}
            </span>
          )}
        </span>
      )}
    </span>
  )
}
