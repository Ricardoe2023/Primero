// 6 images per category — strictly interleaved so no category clusters
const CATEGORIES = {
  barberias: [
    'https://images.unsplash.com/photo-1593702233354-259d1f794ed1?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1621605815971-620c53050c6d?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1512864084360-7c0d4cc42b7a?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=120&h=120&fit=crop&q=40',
  ],
  nails: [
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1604902396830-aca29e19b067?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1604881989297-9f6b01ed6c99?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1632345031435-8727f592d8dc?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=120&h=120&fit=crop&q=40',
  ],
  estetica: [
    'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1552693673-1bf958298935?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=120&h=120&fit=crop&q=40',
  ],
  tatuajes: [
    'https://images.unsplash.com/photo-1568515387631-8b650bbcdb90?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1590246815119-95a86d945d5b?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1542525187-a1a6e0a4dd76?w=120&h=120&fit=crop&q=40',
    'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=120&h=120&fit=crop&q=40',
  ],
}

// Interleave: barber, nails, estetica, tattoo, barber, nails...
function buildTiles(count: number): string[] {
  const cats = [CATEGORIES.barberias, CATEGORIES.nails, CATEGORIES.estetica, CATEGORIES.tatuajes]
  return Array.from({ length: count }, (_, i) => {
    const cat = cats[i % 4]
    return cat[Math.floor(i / 4) % cat.length]
  })
}

export default function HeroBg() {
  const tiles = buildTiles(300)

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
      aria-hidden="true"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, 90px)',
          gridAutoRows: '90px',
          filter: 'grayscale(100%) brightness(1.1) blur(0px)',
          opacity: 0.12,
          transform: 'scale(1.06)',
          transformOrigin: 'center top',
          minHeight: '100%',
          width: '100%',
        }}
      >
        {tiles.map((src, i) => (
          <div
            key={i}
            style={{
              backgroundImage: `url(${src})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              width: 90,
              height: 90,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent" />
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent" />
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(255,255,255,0.7) 0%, transparent 100%)',
        }}
      />
    </div>
  )
}
