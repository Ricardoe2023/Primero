'use client'
import { useEffect, useState } from 'react'

export default function NearbyMap() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'denied'>('idle')

  useEffect(() => {
    if (!navigator.geolocation) { setStatus('denied'); return }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('ok')
      },
      () => setStatus('denied'),
      { timeout: 8000 }
    )
  }, [])

  // Default center: Santiago, Chile
  const lat = coords?.lat ?? -33.4489
  const lng = coords?.lng ?? -70.6693
  const delta = coords ? 0.008 : 0.04

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - delta},${lat - delta * 0.7},${lng + delta},${lat + delta * 0.7}&layer=mapnik&marker=${lat},${lng}`

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.08]" style={{ height: 170 }}>
        <div className="w-full h-full flex items-center justify-center bg-white/[0.03]">
          <span className="text-white/25 text-sm animate-pulse">Detectando ubicación…</span>
        </div>
      </div>
    )
  }

  if (status === 'denied') {
    return (
      <div className="mt-5 rounded-xl overflow-hidden border border-white/[0.08]" style={{ height: 170 }}>
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'invert(88%) hue-rotate(180deg) brightness(0.82) saturate(0.7)' }}
          loading="lazy"
          title="Mapa Santiago"
        />
      </div>
    )
  }

  return (
    <div className="mt-5 rounded-xl overflow-hidden border border-blue-500/20 ring-1 ring-blue-600/10" style={{ height: 170 }}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'invert(88%) hue-rotate(180deg) brightness(0.82) saturate(0.7)' }}
        loading="lazy"
        title="Tu ubicación actual"
      />
    </div>
  )
}
