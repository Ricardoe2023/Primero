import Link from 'next/link'

interface BarbershopCard {
  id: string
  name: string
  slug: string
  description?: string
  address: string
  city: string
  coverImageUrl?: string
  rating: number
  reviewCount: number
  services: { price: number }[]
}

async function getBarbershops(searchParams: { city?: string; search?: string; page?: string }) {
  const params = new URLSearchParams()
  if (searchParams.city) params.set('city', searchParams.city)
  if (searchParams.search) params.set('search', searchParams.search)
  if (searchParams.page) params.set('page', searchParams.page)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
  const res = await fetch(`${API_URL}/barbershops?${params}`, { cache: 'no-store' })
  if (!res.ok) return { items: [], total: 0, pages: 1 }
  return res.json()
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; search?: string; page?: string }>
}) {
  const sp = await searchParams
  const { items, total, pages } = await getBarbershops(sp)
  const currentPage = parseInt(sp.page || '1')

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Barberías</h1>
          <form className="flex gap-3 flex-col sm:flex-row">
            <input
              name="search"
              defaultValue={sp.search}
              placeholder="Buscar barbería..."
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <input
              name="city"
              defaultValue={sp.city}
              placeholder="Ciudad..."
              className="px-4 py-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 sm:w-40"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-lg"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-slate-500 text-sm mb-6">{total} barberías encontradas</p>

        {items.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No se encontraron barberías</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((shop: BarbershopCard) => (
              <Link key={shop.id} href={`/marketplace/${shop.slug}`}>
                <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                  <div className="h-40 bg-slate-200 relative">
                    {shop.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={shop.coverImageUrl}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                        ✂️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-lg text-slate-900 mb-1">{shop.name}</h2>
                    <p className="text-slate-500 text-sm mb-2">{shop.address}, {shop.city}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm">
                        <span className="text-amber-500">★</span>
                        <span className="font-medium">{shop.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({shop.reviewCount})</span>
                      </div>
                      {shop.services.length > 0 && (
                        <span className="text-sm text-slate-500">
                          desde ${shop.services[0].price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}

        {/* Paginación */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/marketplace?${new URLSearchParams({ ...sp, page: String(p) })}`}
                className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  p === currentPage
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
