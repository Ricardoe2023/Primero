/**
 * BarberHub mark — the letter B rotated 90° CCW:
 * the spine becomes a horizontal baseline, the two
 * bumps of the B rise upward (smaller left, larger right).
 */
export default function BHLogo({
  height = 20,
  className = '',
}: {
  height?: number
  className?: string
}) {
  // viewBox aspect ratio: 48 wide × 30 tall
  const width = Math.round(height * (48 / 30))

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BarberHub"
    >
      <defs>
        <linearGradient id="bh-grad" x1="0" y1="0" x2="48" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#fbbf24" />
          <stop offset="55%"  stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* ── Baseline spine ── */}
      <line
        x1="3" y1="27"
        x2="45" y2="27"
        stroke="url(#bh-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />

      {/* ── Small arc (top bump of B, now left) ── */}
      {/* From baseline at x=3 → peak ~y=12 → back to baseline at x=21 */}
      <path
        d="M 3 27 C 3 9 21 9 21 27"
        stroke="url(#bh-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Large arc (bottom bump of B, now right) ── */}
      {/* From baseline at x=21 → peak ~y=2 → back to baseline at x=45 */}
      <path
        d="M 21 27 C 21 2 45 2 45 27"
        stroke="url(#bh-grad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* ── Subtle inner accent line (blade suggestion) ── */}
      <line
        x1="3" y1="27"
        x2="45" y2="27"
        stroke="white"
        strokeWidth="0.5"
        strokeLinecap="round"
        opacity="0.08"
      />
    </svg>
  )
}
