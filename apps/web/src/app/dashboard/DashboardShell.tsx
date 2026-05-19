'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import NovuLogo from '@/components/NovuLogo'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '📅' },
  { href: '/dashboard/marketplace', label: 'Marketplace', icon: '🛍️' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '📊' },
  { href: '/dashboard/configuracion', label: 'Configura tu negocio', icon: '⚙️' },
]

interface Business { id: string; name: string; slug: string }

interface Props {
  businesses: Business[]
  business: Business | null
  userEmail: string
  isClient?: boolean
  children: React.ReactNode
}

export default function DashboardShell({ businesses, business, userEmail, isClient = false, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [showBizMenu, setShowBizMenu] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBizName, setNewBizName] = useState('')
  const [addingBiz, setAddingBiz] = useState(false)
  const [optimisticBiz, setOptimisticBiz] = useState<Business | null>(null)

  const currentBiz = optimisticBiz ?? business

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function switchBusiness(id: string) {
    const target = businesses.find(b => b.id === id)
    if (target) setOptimisticBiz(target) // instant UI update
    setShowBizMenu(false)
    await fetch('/api/set-biz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: id }) })
    router.refresh()
  }

  async function handleAddBusiness() {
    if (!newBizName.trim()) return
    setAddingBiz(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAddingBiz(false); return }

    const base = newBizName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    const slug = base || 'mi-negocio'
    const { data: biz } = await supabase
      .from('businesses')
      .insert({ name: newBizName.trim(), slug, owner_id: user.id, industry: 'barbershop' })
      .select('id')
      .single()

    if (biz) {
      // Crear local por defecto con horario vacío
      await supabase.from('locations').insert({
        business_id: biz.id,
        name: newBizName.trim(),
        address: '',
        city: '',
        hours: {},
        is_active: true,
      })
      await fetch('/api/set-biz', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: biz.id }) })
    }
    setAddingBiz(false)
    setShowAddModal(false)
    setNewBizName('')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[#080706] flex">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-white/[0.06] flex flex-col">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/">
            <NovuLogo
              height={22}
              wordmark
              subtitle={isClient ? 'Clientes' : 'Partner'}
              subtitleColor={isClient ? '#60a5fa' : '#f59e0b'}
            />
          </Link>
        </div>

        {/* Business switcher */}
        {!isClient && (
          <div className="px-3 pt-3 pb-1 relative">
            <button
              onClick={() => setShowBizMenu((v) => !v)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.14] transition-all duration-150"
            >
              <span className="text-[13px] font-medium text-white/70 truncate">
                {currentBiz?.name ?? 'Sin negocio'}
              </span>
              <span className="text-white/30 text-[10px] shrink-0">▾</span>
            </button>

            {showBizMenu && (
              <div className="absolute left-3 right-3 top-full mt-1 bg-[#111] border border-white/[0.10] rounded-xl overflow-hidden z-50 shadow-xl">
                {businesses.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => switchBusiness(b.id)}
                    className={`w-full text-left px-4 py-2.5 text-[13px] transition-colors duration-100 ${
                      b.id === currentBiz?.id
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-white/60 hover:bg-white/[0.05] hover:text-white/80'
                    }`}
                  >
                    {b.name}
                    {b.id === currentBiz?.id && <span className="ml-2 text-[10px]">✓</span>}
                  </button>
                ))}
                <div className="border-t border-white/[0.07]">
                  <button
                    onClick={() => { setShowBizMenu(false); setShowAddModal(true) }}
                    className="w-full text-left px-4 py-2.5 text-[13px] text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/[0.06] transition-colors duration-100"
                  >
                    + Agregar negocio
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 px-3 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 ${
                  active
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.04]'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
          <p className="px-3 text-[11px] text-white/25 truncate">{userEmail}</p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150"
          >
            <span>🚪</span> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto" onClick={() => setShowBizMenu(false)}>
        {children}
      </main>

      {/* Add business modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#111] border border-white/[0.10] rounded-2xl p-6 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-semibold text-white mb-4">Agregar negocio</h3>
            <input
              type="text"
              placeholder="Nombre del negocio"
              value={newBizName}
              onChange={(e) => setNewBizName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBusiness()}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAddBusiness}
                disabled={addingBiz || !newBizName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
              >
                {addingBiz ? 'Creando…' : 'Crear'}
              </button>
              <button
                onClick={() => { setShowAddModal(false); setNewBizName('') }}
                className="px-4 py-2.5 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
