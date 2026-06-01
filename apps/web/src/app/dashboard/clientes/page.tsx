'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
  created_at: string
  visit_count?: number
  last_visit?: string | null
}

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' }

export default function ClientesPage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id').eq('owner_id', user.id)
      const { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business) { setLoading(false); return }
      setBusinessId(business.id)

      const { data: rows } = await supabase
        .from('clients')
        .select('id, name, phone, email, notes, created_at')
        .eq('business_id', business.id)
        .order('name', { ascending: true })

      if (!rows) { setLoading(false); return }

      const { data: visitCounts } = await supabase
        .from('client_visits')
        .select('client_id, date')
        .eq('business_id', business.id)

      const countMap: Record<string, { count: number; last: string }> = {}
      for (const v of visitCounts ?? []) {
        if (!countMap[v.client_id]) countMap[v.client_id] = { count: 0, last: v.date }
        countMap[v.client_id].count++
        if (v.date > countMap[v.client_id].last) countMap[v.client_id].last = v.date
      }

      setClients(rows.map(r => ({
        ...r,
        visit_count: countMap[r.id]?.count ?? 0,
        last_visit: countMap[r.id]?.last ?? null,
      })))
      setLoading(false)
    }
    load()
  }, [])

  async function handleAdd() {
    if (!businessId || !form.name.trim()) return
    setSaving(true)
    setSaveError(null)
    const { data, error } = await supabase
      .from('clients')
      .insert({
        business_id: businessId,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        notes: form.notes.trim() || null,
      })
      .select('id, name, phone, email, notes, created_at')
      .single()
    if (error) {
      setSaveError(`Error: ${error.message}`)
    } else if (data) {
      setClients(prev => [...prev, { ...data, visit_count: 0, last_visit: null }].sort((a, b) => a.name.localeCompare(b.name)))
      setForm(EMPTY_FORM)
      setShowForm(false)
    }
    setSaving(false)
  }

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search)
  )

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (loading) return <div className="px-4 sm:px-8 py-6 sm:py-8"><p className="text-white/30 text-[14px]">Cargando clientes…</p></div>

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl">
      <div className="mb-6">
        <p className="text-[13px] text-blue-400/70 font-medium mb-0.5">Dashboard</p>
        <h1 className="text-[22px] font-semibold text-white">Clientes</h1>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
          />
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150">
            + Agregar
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 mb-5 space-y-4">
          <h3 className="text-[14px] font-semibold text-white">Nuevo cliente</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[12px] text-white/40 mb-1.5">Nombre *</label>
              <input
                type="text" autoFocus placeholder="Ej. Juan Pérez" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Teléfono</label>
              <input
                type="tel" placeholder="+56 9 1234 5678" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Email</label>
              <input
                type="email" placeholder="juan@ejemplo.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] text-white/40 mb-1.5">Notas</label>
              <textarea
                placeholder="Alergias, preferencias, etc." value={form.notes} rows={2}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>
          {saveError && <p className="text-[13px] text-red-400">{saveError}</p>}
          <div className="flex gap-3 pt-1">
            <button onClick={handleAdd} disabled={saving || !form.name.trim()}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40">
              {saving ? 'Guardando…' : 'Agregar cliente'}
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); setSaveError(null) }}
              className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-10 text-center">
          <p className="text-white/25 text-[14px]">
            {search ? 'No se encontraron clientes.' : 'Aún no hay clientes registrados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <Link key={c.id} href={`/dashboard/clientes/${c.id}`}
              className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl transition-colors duration-150 group">
              <div className="w-10 h-10 rounded-full bg-amber-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
                <span className="text-[13px] font-semibold text-blue-400">{initials(c.name)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white truncate group-hover:text-blue-400 transition-colors duration-150">{c.name}</p>
                <p className="text-[12px] text-white/35 truncate">
                  {c.phone ?? 'Sin teléfono'}
                  {c.last_visit ? ` · Última visita: ${formatDate(c.last_visit)}` : ''}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[13px] font-medium text-white/60">{c.visit_count ?? 0}</p>
                <p className="text-[11px] text-white/25">{c.visit_count === 1 ? 'visita' : 'visitas'}</p>
              </div>
              <svg className="text-white/20 group-hover:text-white/40 transition-colors duration-150 shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
