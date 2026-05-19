export default function BarberBotIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="bot-float"
    >
      {/* Outer ambient glow ring */}
      <circle cx="18" cy="18" r="16" stroke="#f59e0b" strokeWidth="0.8" className="bot-pulse" />

      {/* Antenna */}
      <line x1="18" y1="10" x2="18" y2="6" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" />
      {/* Antenna tip — blinks */}
      <circle cx="18" cy="4.5" r="1.8" fill="#f59e0b" className="bot-blink" />
      {/* Antenna base cap */}
      <rect x="15" y="9" width="6" height="2" rx="1" fill="#f59e0b" opacity="0.5" />

      {/* Robot head */}
      <rect x="5" y="10" width="26" height="20" rx="4" stroke="#f59e0b" strokeWidth="1.5" fill="#0e0d0c" />

      {/* Side circuit connectors */}
      <line x1="5" y1="16" x2="2" y2="16" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="1.5" cy="16" r="1" fill="#f59e0b" opacity="0.4" />
      <line x1="31" y1="16" x2="34" y2="16" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
      <circle cx="34.5" cy="16" r="1" fill="#f59e0b" opacity="0.4" />

      {/* Left eye — scanner bar */}
      <rect x="8" y="15" width="7" height="4" rx="2" fill="#f59e0b" opacity="0.15" />
      <rect x="9" y="16.5" width="5" height="1" rx="0.5" fill="#f59e0b" opacity="0.6" className="bot-scan" />
      {/* Left eye dot */}
      <circle cx="11.5" cy="17" r="1.2" fill="#f59e0b" className="bot-blink" />

      {/* Right eye — scanner bar */}
      <rect x="21" y="15" width="7" height="4" rx="2" fill="#f59e0b" opacity="0.15" />
      <rect x="22" y="16.5" width="5" height="1" rx="0.5" fill="#f59e0b" opacity="0.6" className="bot-scan" style={{ animationDelay: '0.9s' }} />
      {/* Right eye dot */}
      <circle cx="24.5" cy="17" r="1.2" fill="#f59e0b" className="bot-blink" style={{ animationDelay: '0.4s' }} />

      {/* Divider line */}
      <line x1="8" y1="21" x2="28" y2="21" stroke="#f59e0b" strokeWidth="0.6" opacity="0.2" />

      {/* Scissors — two blades crossing at center */}
      {/* Top blade */}
      <g className="bot-scissors-top">
        <line x1="10" y1="26" x2="26" y2="17" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <circle cx="10" cy="26" r="2" stroke="#f59e0b" strokeWidth="1" fill="#0e0d0c" />
      </g>
      {/* Bottom blade */}
      <g className="bot-scissors-bot">
        <line x1="10" y1="17" x2="26" y2="26" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
        <circle cx="10" cy="17" r="2" stroke="#f59e0b" strokeWidth="1" fill="#0e0d0c" />
      </g>
      {/* Scissors pivot */}
      <circle cx="18" cy="21.5" r="1.5" fill="#f59e0b" opacity="0.9" />

      {/* AI sparkles */}
      <g opacity="0.5" className="bot-blink" style={{ animationDelay: '1.2s' }}>
        <line x1="31" y1="11" x2="31" y2="13" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
        <line x1="30" y1="12" x2="32" y2="12" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
      </g>
      <g opacity="0.4" className="bot-blink" style={{ animationDelay: '2s' }}>
        <line x1="5" y1="28" x2="5" y2="30" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="29" x2="6" y2="29" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  )
}
