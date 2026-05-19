'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'
import type { Service, Staff } from '@/types/database'

type ServiceForm = { name: string; price: string; duration_minutes: string; description: string; staffIds: string[] }
const EMPTY_FORM: ServiceForm = { name: '', price: '', duration_minutes: '30', description: '', staffIds: [] }

const DURATIONS = [15, 20, 30, 45, 60, 75, 90, 120]

export default function ServiciosConfigPage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
      const [{ data: svcs }, { data: stf }] = await Promise.all([
        supabase.from('services').select('*').eq('business_id', business.id).eq('is_active', true).order('created_at', { ascending: true }),
        supabase.from('staff').select('*').eq('business_id', business.id).eq('is_active', true).order('created_at', { ascending: true }),
      ])
      setServices(svcs ?? [])
      setStaff(stf ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function openAdd() { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true) }

  function openEdit(s: Service) {
    setEditingId(s.id)
    setForm({
      name: s.name,
      price: String(s.price),
      duration_minutes: String(s.duration_minutes),
      description: s.description ?? '',
      staffIds: s.staff_ids ?? [],
    })
    setShowForm(true)
  }

  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }

  function toggleStaff(id: string) {
    setForm((f) => ({
      ...f,
      staffIds: f.staffIds.includes(id) ? f.staffIds.filter((x) => x !== id) : [...f.staffIds, id],
    }))
  }

  async function handleSave() {
    if (!businessId || !form.name.trim() || !form.price) return
    setSaving(true)
    const payload = {
      business_id: businessId,
      name: form.name.trim(),
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes) || 30,
      description: form.description.trim() || null,
      staff_ids: form.staffIds,
      is_active: true,
    }
    if (editingId) {
      const { data } = await supabase.from('services').update(payload).eq('id', editingId).select().single()
      if (data) setServices((prev) => prev.map((s) => (s.id === editingId ? data : s)))
    } else {
      const { data } = await supabase.from('services').insert(payload).select().single()
      if (data) setServices((prev) => [...prev, data])
    }
    setSaving(false)
    cancelForm()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('services').update({ is_active: false }).eq('id', id)
    setServices((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  if (loading) return <p className="text-white/30 text-[14px]">Cargando servicios…</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-white/35">Cortes, tratamientos y servicios que ofrece el negocio.</p>
        {!showForm && (
          <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150">
            + Agregar
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 mb-6 space-y-4">
          <h3 className="text-[14px] font-semibold text-white">{editingId ? 'Editar servicio' : 'Nuevo servicio'}</h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] text-white/40 mb-1.5">Nombre *</label>
              <input
                type="text" placeholder="Ej. Corte + Barba" value={form.name} autoFocus
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Precio (CLP) *</label>
              <input
                type="number" placeholder="12000" value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Duración</label>
              <select
                value={form.duration_minutes}
                onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-amber-500/50"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d} className="bg-[#111]">
                    {d < 60 ? `${d} min` : `${d / 60}h${d % 60 ? ` ${d % 60}min` : ''}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Descripción</label>
            <textarea
              placeholder="Descripción opcional…" value={form.description} rows={2}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 resize-none"
            />
          </div>

          {staff.length > 0 && (
            <div>
              <label className="block text-[12px] text-white/40 mb-2">
                ¿Quién ofrece este servicio?
                <span className="ml-1.5 text-white/20 font-normal">· deja vacío si lo hacen todos</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {staff.map((s) => {
                  const on = form.staffIds.includes(s.id)
                  return (
                    <button
                      key={s.id} type="button" onClick={() => toggleStaff(s.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] transition-all duration-150 ${
                        on
                          ? 'bg-amber-500/15 border border-amber-500/40 text-amber-400'
                          : 'bg-white/[0.04] border border-white/[0.10] text-white/50 hover:border-white/[0.20]'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full overflow-hidden border shrink-0 ${on ? 'border-amber-500/40' : 'border-white/10'}`}>
                        {s.avatar_url ? (
                          <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center text-[9px] font-bold ${on ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.06] text-white/40'}`}>
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {s.name}
                      {on && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} disabled={saving || !form.name.trim() || !form.price}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button onClick={cancelForm} className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {services.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-8 text-center">
          <p className="text-white/25 text-[14px]">Aún no hay servicios registrados.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((s) => {
            const assigned = (s.staff_ids ?? []).map((id) => staff.find((st) => st.id === id)?.name).filter(Boolean)
            return (
              <div key={s.id} className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl transition-colors duration-150">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-white truncate">{s.name}</p>
                  <p className="text-[12px] text-white/35">
                    ${Number(s.price).toLocaleString('es-CL')} · {s.duration_minutes} min
                    {s.description ? ` · ${s.description}` : ''}
                  </p>
                  {assigned.length > 0 && (
                    <p className="text-[11px] text-amber-400/60 mt-0.5">{assigned.join(', ')}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="px-3 py-1.5 rounded-lg text-[12px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] transition-colors duration-150">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(s.id)} disabled={deletingId === s.id}
                    className="px-3 py-1.5 rounded-lg text-[12px] text-white/30 hover:text-red-400 hover:bg-red-500/[0.06] transition-colors duration-150 disabled:opacity-40">
                    {deletingId === s.id ? '…' : 'Eliminar'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
