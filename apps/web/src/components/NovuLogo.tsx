import { Unbounded } from 'next/font/google'

const unbounded = Unbounded({ subsets: ['latin'], weight: ['400', '500', '700'], display: 'swap' })

interface Props {
  height?: number
  wordmark?: boolean
  subtitle?: string
  subtitleColor?: string
}

function WavesIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="2 1 24 24" fill="none" aria-hidden>
      <path
        d="M8 20 Q14 8 20 20"
        stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" fill="none"
      />
      <path
        d="M4 22 Q14 2 24 22"
        stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.4"
      />
      <circle cx="14" cy="22" r="2.2" fill="#f59e0b" />
    </svg>
  )
}

export default function NovuLogo({ height = 32, wordmark = false, subtitle, subtitleColor = '#f59e0b' }: Props) {
  const iconSize = Math.round(height * 1.35)
  const fontSize = Math.round(height * 0.66)

  return (
    <span className="inline-flex items-center gap-1.5">
      <WavesIcon size={iconSize} />
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={unbounded.className}
            style={{ fontSize, fontWeight: 500, letterSpacing: '0.01em', lineHeight: 1, color: '#f5f5f4' }}
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
