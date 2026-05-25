'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'
import type { Staff } from '@/types/database'

type StaffForm = { name: string; role: string; specialties: string }
const EMPTY_FORM: StaffForm = { name: '', role: '', specialties: '' }

export default function PersonalPage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Photo upload per staff member
  const [uploadingId, setUploadingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUploadId, setPendingUploadId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id').eq('owner_id', user.id)
      let { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business && activeBizId) {
        const { data: fallback } = await supabase.from('businesses').select('id').eq('owner_id', user.id).order('created_at', { ascending: true }).limit(1).single()
        business = fallback
      }
      if (!business) { setLoading(false); return }
      setBusinessId(business.id)
      const { data } = await supabase
        .from('staff')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: true })
      setStaff(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  function openAdd() { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true) }
  function openEdit(s: Staff) {
    setEditingId(s.id)
    setForm({ name: s.name, role: s.role ?? '', specialties: (s.specialties ?? []).join(', ') })
    setShowForm(true)
  }
  function cancelForm() { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM) }

  async function handleSave() {
    if (!businessId || !form.name.trim()) return
    setSaving(true)
    const specialties = form.specialties.split(',').map((s) => s.trim()).filter(Boolean)
    const payload = { business_id: businessId, name: form.name.trim(), role: form.role.trim() || null, specialties, is_active: true }
    if (editingId) {
      const { data } = await supabase.from('staff').update(payload).eq('id', editingId).select().single()
      if (data) setStaff((prev) => prev.map((s) => (s.id === editingId ? data : s)))
    } else {
      const { data } = await supabase.from('staff').insert(payload).select().single()
      if (data) setStaff((prev) => [...prev, data])
    }
    setSaving(false)
    cancelForm()
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    await supabase.from('staff').update({ is_active: false }).eq('id', id)
    setStaff((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  function triggerPhotoUpload(staffId: string) {
    setPendingUploadId(staffId)
    fileInputRef.current?.click()
  }

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !pendingUploadId) return
    setUploadingId(pendingUploadId)
    const ext = file.name.split('.').pop()
    const path = `${pendingUploadId}.${ext}`
    const { error: upErr } = await supabase.storage.from('staff-avatars').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data: { publicUrl } } = supabase.storage.from('staff-avatars').getPublicUrl(path)
      const { data } = await supabase.from('staff').update({ avatar_url: publicUrl }).eq('id', pendingUploadId).select().single()
      if (data) setStaff((prev) => prev.map((s) => s.id === pendingUploadId ? data : s))
    }
    setUploadingId(null)
    setPendingUploadId(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loading) return <p className="text-white/30 text-[14px]">Cargando personal…</p>
  if (!businessId) return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-6 text-center">
      <p className="text-white/30 text-[14px]">No hay negocio configurado.</p>
    </div>
  )

  return (
    <div>
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

      <div className="flex items-center justify-between mb-6">
        <p className="text-[13px] text-white/35">Profesionales y colaboradores del negocio.</p>
        {!showForm && (
          <button onClick={openAdd} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150">
            + Agregar
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 mb-6 space-y-4">
          <h3 className="text-[14px] font-semibold text-white">{editingId ? 'Editar colaborador' : 'Nuevo colaborador'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Nombre *</label>
              <input type="text" placeholder="Ej. Carlos López" value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Cargo / Rol</label>
              <input type="text" placeholder="Ej. Barbero Senior" value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] text-white/40 mb-1.5">Especialidades (separadas por coma)</label>
            <input type="text" placeholder="Ej. Fade, Navaja, Colorimetría" value={form.specialties}
              onChange={(e) => setForm((f) => ({ ...f, specialties: e.target.value }))}
              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleSave} disabled={saving || !form.name.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40">
              {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Agregar'}
            </button>
            <button onClick={cancelForm} className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Staff list */}
      {staff.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-8 text-center">
          <p className="text-white/25 text-[14px]">Aún no hay personal registrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-4 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl transition-colors duration-150">
              {/* Avatar */}
              <button
                onClick={() => triggerPhotoUpload(s.id)}
                disabled={uploadingId === s.id}
                title="Cambiar foto"
                className="relative w-11 h-11 rounded-full shrink-0 overflow-hidden group"
              >
                {s.avatar_url ? (
                  <img src={s.avatar_url} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                    <span className="text-[15px] font-semibold text-amber-400">{s.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploadingId === s.id ? (
                    <span className="text-white text-[9px]">…</span>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  )}
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-white truncate">{s.name}</p>
                <p className="text-[12px] text-white/35 truncate">
                  {s.role ?? 'Sin cargo'}{s.specialties?.length > 0 ? ` · ${s.specialties.join(', ')}` : ''}
                </p>
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
          ))}
        </div>
      )}
    </div>
  )
}
