'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { BARBERSHOPS, type StaticBarbershop } from '@/data/barbershops'
import NovuLogo from '@/components/NovuLogo'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { firstName: string; lastName: string }
}

type Barbershop = StaticBarbershop & { reviews?: Review[] }

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

function filterStatic(search: string, city: string): Barbershop[] {
  return BARBERSHOPS.filter((b) => {
    const q = search.toLowerCase()
    const c = city.toLowerCase()
    const matchSearch =
      !q ||
      b.name.toLowerCase().includes(q) ||
      b.neighborhood.toLowerCase().includes(q) ||
      b.specialty.toLowerCase().includes(q)
    const matchCity =
      !c ||
      b.city.toLowerCase().includes(c) ||
      b.neighborhood.toLowerCase().includes(c)
    return matchSearch && matchCity
  })
}

async function fetchBarbershops(search: string, city: string): Promise<Barbershop[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    const res = await fetch(`${API_URL}/barbershops?${params}`, { cache: 'no-store' })
    if (!res.ok) throw new Error()
    const data = await res.json()
    if (data.items?.length) return data.items
  } catch { /* fall through to static */ }
  return filterStatic(search, city)
}

async function fetchBarbershop(slug: string): Promise<Barbershop | null> {
  try {
    const res = await fetch(`${API_URL}/barbershops/${slug}`, { cache: 'no-store' })
    if (res.ok) return res.json()
  } catch { /* fall through */ }
  return BARBERSHOPS.find((b) => b.slug === slug) || null
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#060f1a]" />}>
      <MarketplaceInner />
    </Suspense>
  )
}

function MarketplaceInner() {
  const sp = useSearchParams()

  const [search, setSearch] = useState(sp.get('search') || '')
  const [city, setCity] = useState(sp.get('city') || '')
  const [shops, setShops] = useState<Barbershop[]>([])
  const [total, setTotal] = useState(0)
  const [selected, setSelected] = useState<Barbershop | null>(null)
  const [loadingShops, setLoadingShops] = useState(true)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  const load = useCallback(async () => {
    setLoadingShops(true)
    const items = await fetchBarbershops(search, city)
    setShops(items)
    setTotal(items.length)
    setLoadingShops(false)
  }, [search, city])

  useEffect(() => { load() }, [load])

  async function selectShop(shop: Barbershop) {
    setLoadingDetail(true)
    setSelected(null)
    const detail = await fetchBarbershop(shop.slug)
    setSelected(detail || shop)
    setLoadingDetail(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    load()
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setReviewSubmitting(true)
    await fetch(`${API_URL}/barbershops/${selected.slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: reviewRating, comment: reviewText }),
    })
    const detail = await fetchBarbershop(selected.slug)
    setSelected(detail || selected)
    setReviewText('')
    setReviewRating(5)
    setReviewSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#060f1a] text-[#fafaf9] flex flex-col">

      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#060f1a]/90 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
        <div className="max-w-full px-4 sm:px-6 py-3.5 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <NovuLogo height={20} wordmark />
          </Link>
          <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xl">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar barbería..."
              className="flex-1 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors duration-150 min-w-0"
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ciudad..."
              className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white text-[13px] placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors duration-150 w-28 hidden sm:block"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-[#060f1a] font-semibold rounded-xl text-[13px] shrink-0 active:scale-[0.97] transition-colors duration-150"
            >
              Buscar
            </button>
          </form>
          <span className="text-white/30 text-[12px] shrink-0 hidden sm:block">{total} barberías</span>
        </div>
      </header>

      {/* Body — sidebar + detail */}
      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100dvh - 57px)' }}>

        {/* ── Floating Sidebar ── */}
        <aside className={`${selected ? 'hidden sm:flex' : 'flex'} w-full sm:w-[300px] shrink-0 overflow-y-auto border-r border-white/[0.06] bg-[#060f1a] flex-col`}>
          <div className="p-3 space-y-1.5">
            {loadingShops ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[72px] rounded-2xl bg-white/[0.04] animate-pulse" />
              ))
            ) : shops.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-white/30 text-[13px]">No hay barberías</p>
              </div>
            ) : (
              shops.map((shop) => (
                <button
                  key={shop.id}
                  onClick={() => selectShop(shop)}
                  className={`w-full text-left p-[5px] rounded-2xl border transition-all duration-200 ${
                    selected?.id === shop.id
                      ? 'bg-blue-600/[0.08] border-blue-500/30'
                      : 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14] hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="rounded-[calc(1rem-5px)] px-3.5 py-3 flex gap-3 items-center">
                    {/* Mini cover */}
                    <div className="w-10 h-10 rounded-xl bg-[#1a1917] overflow-hidden shrink-0">
                      {shop.coverImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shop.coverImageUrl} alt={shop.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/15">
                            <path d="M9.5 14.5 3 21" /><path d="M14.5 9.5 21 3" />
                            <path d="M2 12c0-3.31 2.69-6 6-6 1.66 0 3.14.67 4.22 1.76L3.76 16.22A5.95 5.95 0 0 1 2 12z" />
                            <path d="M22 12c0 3.31-2.69 6-6 6a5.95 5.95 0 0 1-4.22-1.76l8.46-8.46C21.33 8.86 22 10.34 22 12z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{shop.name}</p>
                      <p className="text-[11px] text-white/35 truncate mt-0.5">{shop.neighborhood}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-blue-400 text-[10px]">★</span>
                        <span className="text-[11px] text-white/60">{shop.rating.toFixed(1)}</span>
                        <span className="text-white/20 text-[10px]">({shop.reviewCount})</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* ── Detail Panel ── */}
        <main className={`${selected ? 'flex' : 'hidden sm:flex'} flex-1 overflow-y-auto flex-col`}>
          {loadingDetail ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-amber-500 animate-spin" />
            </div>
          ) : !selected ? (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-white/20">
                  <path d="M9.5 14.5 3 21" /><path d="M14.5 9.5 21 3" />
                  <path d="M2 12c0-3.31 2.69-6 6-6 1.66 0 3.14.67 4.22 1.76L3.76 16.22A5.95 5.95 0 0 1 2 12z" />
                  <path d="M22 12c0 3.31-2.69 6-6 6a5.95 5.95 0 0 1-4.22-1.76l8.46-8.46C21.33 8.86 22 10.34 22 12z" />
                </svg>
              </div>
              <div>
                <p className="text-white/50 text-[15px] font-medium">Selecciona una barbería</p>
                <p className="text-white/25 text-[13px] mt-1">Elige una de la lista para ver sus servicios</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto px-6 py-8">

              {/* Back button — mobile only */}
              <button
                onClick={() => setSelected(null)}
                className="flex sm:hidden items-center gap-2 text-white/50 hover:text-white text-[13px] mb-5 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Volver a la lista
              </button>

              {/* Cover */}
              <div className="h-52 rounded-2xl bg-[#1a1917] overflow-hidden mb-6 relative">
                {selected.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.coverImageUrl} alt={selected.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/10">
                      <path d="M9.5 14.5 3 21" /><path d="M14.5 9.5 21 3" />
                      <path d="M2 12c0-3.31 2.69-6 6-6 1.66 0 3.14.67 4.22 1.76L3.76 16.22A5.95 5.95 0 0 1 2 12z" />
                      <path d="M22 12c0 3.31-2.69 6-6 6a5.95 5.95 0 0 1-4.22-1.76l8.46-8.46C21.33 8.86 22 10.34 22 12z" />
                    </svg>
                  </div>
                )}
                {/* Directions button */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${selected.name}, ${selected.address}, ${selected.neighborhood}, ${selected.city}, Chile`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#060f1a]/70 hover:bg-[#060f1a]/90 backdrop-blur-md border border-white/[0.14] hover:border-white/25 text-white text-[12px] font-medium transition-all duration-150 group"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                  Cómo llegar
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-white/40 group-hover:translate-x-0.5 transition-transform duration-150">
                    <path d="M2.5 6h7M6.5 3l3 3-3 3" />
                  </svg>
                </a>
              </div>

              {/* Info */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight mb-1">{selected.name}</h1>
                  <p className="text-white/40 text-[14px]">{selected.address} · {selected.neighborhood}, {selected.city}</p>
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="text-blue-400/60 hover:text-blue-400 text-[13px] transition-colors duration-150 mt-0.5 block">
                      {selected.phone}
                    </a>
                  )}
                  {selected.specialty && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {selected.specialty.split(',').map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded-full bg-blue-600/[0.08] border border-blue-500/20 text-[11px] text-blue-400/80 font-medium">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  {selected.description && (
                    <p className="text-white/50 text-[14px] mt-3 leading-relaxed">{selected.description}</p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-blue-400 text-[14px]">★</span>
                    <span className="font-semibold text-white text-[16px]">{selected.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-white/30 text-[12px]">{selected.reviewCount} reseñas</p>
                </div>
              </div>

              {/* Services */}
              {selected.services && selected.services.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-[13px] font-semibold text-white/45 uppercase tracking-[0.12em] mb-3">Servicios</h2>
                  <div className="space-y-2">
                    {selected.services.map((svc) => (
                      <div
                        key={svc.id}
                        className="p-[5px] rounded-2xl bg-white/[0.03] border border-white/[0.07]"
                      >
                        <div className="rounded-[calc(1rem-5px)] bg-[#0f1e35] px-4 py-3.5 flex items-center justify-between shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                          <div>
                            <p className="text-[14px] font-semibold text-white">{svc.name}</p>
                            {svc.description && (
                              <p className="text-[12px] text-white/35 mt-0.5">{svc.description}</p>
                            )}
                            <p className="text-[12px] text-white/30 mt-1">{svc.duration} min</p>
                          </div>
                          <span className="text-[15px] font-bold text-blue-400 shrink-0 ml-4">
                            ${svc.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Agendar cita CTA */}
              <div className="p-[6px] rounded-[1.5rem] bg-blue-600/[0.07] border border-blue-500/[0.15] mb-8">
                <div className="rounded-[calc(1.5rem-6px)] bg-[#0e0b05] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[inset_0_1px_1px_rgba(251,191,36,0.04)]">
                  <div>
                    <p className="text-[16px] font-semibold text-white">¿Listo para tu corte?</p>
                    <p className="text-[13px] text-white/40 mt-0.5">Reserva tu cita en segundos, sin llamadas.</p>
                  </div>
                  <Link
                    href={`/booking/${selected.slug}`}
                    className="group inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-[#060f1a] font-semibold rounded-full text-[14px] active:scale-[0.97] shrink-0"
                    style={{ transition: 'transform 160ms cubic-bezier(0.16,1,0.3,1), background-color 150ms' }}
                  >
                    Agendar cita
                    <span className="w-5 h-5 rounded-full bg-[#060f1a]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-150">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </div>
              </div>

              {/* Reviews */}
              <section>
                <h2 className="text-[13px] font-semibold text-white/45 uppercase tracking-[0.12em] mb-4">Reseñas</h2>

                {/* Leave a review */}
                <div className="p-[5px] rounded-2xl bg-white/[0.03] border border-white/[0.07] mb-4">
                  <form
                    onSubmit={submitReview}
                    className="rounded-[calc(1rem-5px)] bg-[#0f1e35] px-5 py-5 space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]"
                  >
                    <p className="text-[13px] font-semibold text-white/70">Deja tu reseña</p>

                    {/* Star picker */}
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-[20px] transition-colors duration-100 ${star <= reviewRating ? 'text-blue-400' : 'text-white/15'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                      rows={3}
                      placeholder="Comparte tu experiencia..."
                      className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-blue-500/50 transition-colors duration-150 resize-none"
                    />

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-[#060f1a] font-semibold rounded-xl text-[13px] active:scale-[0.97] transition-colors duration-150"
                    >
                      {reviewSubmitting ? 'Enviando...' : 'Publicar reseña'}
                    </button>
                  </form>
                </div>

                {/* Existing reviews */}
                {selected.reviews && selected.reviews.length > 0 ? (
                  <div className="space-y-2">
                    {selected.reviews.map((rev) => (
                      <div key={rev.id} className="p-[5px] rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                        <div className="rounded-[calc(1rem-5px)] bg-[#0f1e35] px-4 py-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[13px] font-semibold text-white/80">
                              {rev.user.firstName} {rev.user.lastName}
                            </p>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-400 text-[11px]">{'★'.repeat(rev.rating)}</span>
                            </div>
                          </div>
                          <p className="text-[13px] text-white/45 leading-relaxed">{rev.comment}</p>
                          <p className="text-[11px] text-white/20 mt-2">
                            {new Date(rev.createdAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/25 text-[13px] text-center py-8">Sé el primero en dejar una reseña</p>
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
