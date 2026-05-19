'use client'

import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@supabase/supabase-js'
import NovuLogo from '@/components/NovuLogo'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string
  name: string
  brand: string | null
  price: number
  description: string | null
  image_url: string | null
  stock: number
  businesses: { id: string; name: string } | null
}

interface CartItem { product: Product; qty: number }

type SortKey = 'recientes' | 'precio_asc' | 'precio_desc'

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  return (
    <div className="group p-[5px] rounded-[1.5rem] bg-white/[0.04] border border-white/[0.07] hover:border-white/[0.13] transition-colors duration-200 flex flex-col">
      <div className="rounded-[calc(1.5rem-5px)] overflow-hidden flex flex-col flex-1 bg-[#111010] shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">

        {/* Image */}
        <div className="h-44 relative flex items-center justify-center overflow-hidden bg-white/[0.03]">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span className="text-[40px] opacity-20">🧴</span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white/60 bg-black/60 px-3 py-1 rounded-full">Sin stock</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 py-4 flex flex-col flex-1">
          <div className="flex-1">
            {product.brand && (
              <p className="text-[10px] font-semibold text-amber-400/60 uppercase tracking-[0.12em] mb-1">{product.brand}</p>
            )}
            <h3 className="text-[14px] font-semibold text-white leading-snug mb-1 line-clamp-2">{product.name}</h3>
            {product.description && (
              <p className="text-[11px] text-white/35 leading-relaxed mb-2 line-clamp-2">{product.description}</p>
            )}
            {product.businesses && (
              <p className="text-[11px] text-white/25 mb-3 truncate">📍 {product.businesses.name}</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-[17px] font-bold text-white">${Number(product.price).toLocaleString('es-CL')}</span>
            <button
              onClick={() => onAdd(product)}
              disabled={product.stock === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black font-semibold rounded-full text-[12px] active:scale-95 transition-all duration-150"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ items, onRemove, onClose }: { items: CartItem[]; onRemove: (id: string) => void; onClose: () => void }) {
  const total = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-sm bg-[#0e0d0c] border-l border-white/[0.08] flex flex-col h-full shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
          <p className="text-[16px] font-semibold text-white">Tu carrito</p>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/[0.07] hover:bg-white/[0.12] flex items-center justify-center transition-colors">
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-white/30 text-[13px]">El carrito está vacío</p>
            </div>
          ) : items.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl shrink-0 overflow-hidden bg-white/[0.06]">
                {product.image_url
                  ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-[18px]">🧴</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-white truncate">{product.name}</p>
                <p className="text-[11px] text-white/35">{product.brand ?? product.businesses?.name} · x{qty}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-semibold text-white">${(product.price * qty).toLocaleString('es-CL')}</p>
                <button onClick={() => onRemove(product.id)} className="text-[11px] text-white/25 hover:text-red-400 transition-colors">quitar</button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-6 pb-6 pt-4 border-t border-white/[0.07] space-y-3">
            <div className="flex justify-between text-[14px]">
              <span className="text-white/50">Total</span>
              <span className="font-bold text-white">${total.toLocaleString('es-CL')}</span>
            </div>
            <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full text-[14px] active:scale-[0.98] transition-all duration-150">
              Ir a pagar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProductosInner() {
  const [products, setProducts] = useState<Product[]>([])
  const [businesses, setBusinesses] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [bizFilter, setBizFilter] = useState('all')
  const [sort, setSort] = useState<SortKey>('recientes')
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('products')
        .select('id, name, brand, price, description, image_url, stock, businesses(id, name)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      const list = (data ?? []).map((p: any) => ({
        ...p,
        businesses: Array.isArray(p.businesses) ? p.businesses[0] ?? null : p.businesses,
      })) as Product[]
      setProducts(list)
      const bizMap = new Map<string, string>()
      list.forEach((p) => { if (p.businesses) bizMap.set(p.businesses.id, p.businesses.name) })
      setBusinesses(Array.from(bizMap.entries()).map(([id, name]) => ({ id, name })))
      setLoading(false)
    }
    load()
  }, [])

  const filtered = products
    .filter((p) => {
      if (bizFilter !== 'all' && p.businesses?.id !== bizFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return p.name.toLowerCase().includes(q) ||
          (p.brand ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q) ||
          (p.businesses?.name ?? '').toLowerCase().includes(q)
      }
      return true
    })
    .sort((a, b) => {
      if (sort === 'precio_asc') return a.price - b.price
      if (sort === 'precio_desc') return b.price - a.price
      return 0
    })

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
  }

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="min-h-screen bg-[#080706] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#080706]/90 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <NovuLogo height={20} wordmark />
          </Link>

          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar productos, marcas…"
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.09] text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          {/* Business filter */}
          <select
            value={bizFilter}
            onChange={(e) => setBizFilter(e.target.value)}
            className="hidden sm:block bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-amber-500/40 max-w-[160px]"
          >
            <option value="all" className="bg-[#111]">Todos los locales</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#111]">{b.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="hidden sm:block bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2 text-[13px] text-white focus:outline-none focus:border-amber-500/40"
          >
            <option value="recientes" className="bg-[#111]">Más recientes</option>
            <option value="precio_asc" className="bg-[#111]">Menor precio</option>
            <option value="precio_desc" className="bg-[#111]">Mayor precio</option>
          </select>

          <Link href="/marketplace" className="hidden sm:block text-[13px] text-white/40 hover:text-white transition-colors ml-auto">
            Barberías
          </Link>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.09] hover:border-white/20 text-[13px] text-white/70 hover:text-white transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center px-1">
                {cartCount}
              </span>
            )}
            <span className="hidden sm:inline">Carrito</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">Marketplace</h1>
            <p className="text-white/30 text-[13px] mt-0.5">Productos recomendados por tu barbero</p>
          </div>
          <p className="text-white/25 text-[12px]">
            {loading ? '…' : `${filtered.length} producto${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Mobile filters */}
        <div className="flex gap-2 mb-6 sm:hidden overflow-x-auto pb-1">
          <select
            value={bizFilter}
            onChange={(e) => setBizFilter(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none"
          >
            <option value="all" className="bg-[#111]">Todos los locales</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id} className="bg-[#111]">{b.name}</option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-white/[0.05] border border-white/[0.09] rounded-xl px-3 py-2 text-[12px] text-white focus:outline-none"
          >
            <option value="recientes" className="bg-[#111]">Más recientes</option>
            <option value="precio_asc" className="bg-[#111]">Menor precio</option>
            <option value="precio_desc" className="bg-[#111]">Mayor precio</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-[1.5rem] bg-white/[0.04] animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center">
            <p className="text-white/30 text-[15px]">No se encontraron productos</p>
            <p className="text-white/20 text-[13px] mt-1">Prueba con otra búsqueda o local</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
          </div>
        )}
      </main>

      {cartOpen && <CartDrawer items={cart} onRemove={(id) => setCart((prev) => prev.filter((i) => i.product.id !== id))} onClose={() => setCartOpen(false)} />}
    </div>
  )
}

export default function ProductosPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080706]" />}>
      <ProductosInner />
    </Suspense>
  )
}
