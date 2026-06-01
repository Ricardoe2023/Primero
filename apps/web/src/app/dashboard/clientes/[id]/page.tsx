'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  phone: string | null
  email: string | null
  notes: string | null
}

interface ConsentRecord {
  id: string
  token: string
  status: string
  signer_name: string | null
  signer_rut: string | null
  signed_at: string | null
  created_at: string
}

interface VisitPhoto {
  id: string
  photo_url: string
  caption: string | null
}

interface Visit {
  id: string
  date: string
  treatment: string | null
  notes: string | null
  photos: VisitPhoto[]
}

const EMPTY_VISIT = { date: '', treatment: '', notes: '' }

export default function ClientDetailPage() {
  const supabase = createClient()
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [client, setClient] = useState<Client | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [businessId, setBusinessId] = useState<string | null>(null)

  const [showVisitForm, setShowVisitForm] = useState(false)
  const [visitForm, setVisitForm] = useState(EMPTY_VISIT)
  const [savingVisit, setSavingVisit] = useState(false)

  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({})
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [expandedVisit, setExpandedVisit] = useState<string | null>(null)
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [editVisitForm, setEditVisitForm] = useState(EMPTY_VISIT)
  const [savingEditVisit, setSavingEditVisit] = useState(false)

  const [editingClient, setEditingClient] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', notes: '' })
  const [savingClient, setSavingClient] = useState(false)

  const [consents, setConsents] = useState<ConsentRecord[]>([])
  const [sendingConsent, setSendingConsent] = useState(false)
  const [consentError, setConsentError] = useState<string | null>(null)
  const [consentLink, setConsentLink] = useState<string | null>(null)
  const [copiedConsent, setCopiedConsent] = useState(false)
  const [deletingConsentId, setDeletingConsentId] = useState<string | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)
  const activeVisitRef = useRef<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: biz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single()
      if (biz) setBusinessId(biz.id)

      const { data: c } = await supabase
        .from('clients')
        .select('id, name, phone, email, notes')
        .eq('id', id)
        .single()
      if (!c) { setLoading(false); return }
      setClient(c)
      setClientForm({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', notes: c.notes ?? '' })

      const { data: vs } = await supabase
        .from('client_visits')
        .select('id, date, treatment, notes')
        .eq('client_id', id)
        .order('date', { ascending: false })

      const visitList = vs ?? []
      if (visitList.length > 0) {
        const { data: photos } = await supabase
          .from('client_visit_photos')
          .select('id, visit_id, photo_url, caption')
          .in('visit_id', visitList.map(v => v.id))

        const photoMap: Record<string, VisitPhoto[]> = {}
        for (const p of photos ?? []) {
          if (!photoMap[p.visit_id]) photoMap[p.visit_id] = []
          photoMap[p.visit_id].push({ id: p.id, photo_url: p.photo_url, caption: p.caption })
        }
        setVisits(visitList.map(v => ({ ...v, photos: photoMap[v.id] ?? [] })))
        if (visitList.length > 0) setExpandedVisit(visitList[0].id)
      } else {
        setVisits([])
      }
      const { data: cs } = await supabase
        .from('consent_requests')
        .select('id, token, status, signer_name, signer_rut, signed_at, created_at')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      setConsents(cs ?? [])

      setLoading(false)
    }
    load()
  }, [id])

  async function handleSaveClient() {
    if (!client || !clientForm.name.trim()) return
    setSavingClient(true)
    const { data } = await supabase
      .from('clients')
      .update({
        name: clientForm.name.trim(),
        phone: clientForm.phone.trim() || null,
        email: clientForm.email.trim() || null,
        notes: clientForm.notes.trim() || null,
      })
      .eq('id', client.id)
      .select('id, name, phone, email, notes')
      .single()
    if (data) setClient(data)
    setSavingClient(false)
    setEditingClient(false)
  }

  async function handleAddVisit() {
    if (!businessId || !client || !visitForm.date) return
    setSavingVisit(true)
    const { data } = await supabase
      .from('client_visits')
      .insert({
        client_id: client.id,
        business_id: businessId,
        date: visitForm.date,
        treatment: visitForm.treatment.trim() || null,
        notes: visitForm.notes.trim() || null,
      })
      .select('id, date, treatment, notes')
      .single()
    if (data) {
      const newVisit: Visit = { ...data, photos: [] }
      setVisits(prev => [newVisit, ...prev])
      setExpandedVisit(data.id)
      setVisitForm(EMPTY_VISIT)
      setShowVisitForm(false)
    }
    setSavingVisit(false)
  }

  function openEditVisit(v: Visit) {
    setEditingVisitId(v.id)
    setEditVisitForm({ date: v.date, treatment: v.treatment ?? '', notes: v.notes ?? '' })
  }

  async function handleSaveEditVisit() {
    if (!editingVisitId || !editVisitForm.date) return
    setSavingEditVisit(true)
    const { data } = await supabase
      .from('client_visits')
      .update({
        date: editVisitForm.date,
        treatment: editVisitForm.treatment.trim() || null,
        notes: editVisitForm.notes.trim() || null,
      })
      .eq('id', editingVisitId)
      .select('id, date, treatment, notes')
      .single()
    if (data) {
      setVisits(prev => prev.map(v => v.id === editingVisitId ? { ...v, ...data } : v)
        .sort((a, b) => b.date.localeCompare(a.date)))
    }
    setSavingEditVisit(false)
    setEditingVisitId(null)
  }

  async function handleSendConsent() {
    if (!client) return
    setSendingConsent(true)
    setConsentError(null)
    setConsentLink(null)
    const res = await fetch('/api/consent/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id }),
    })
    const data = await res.json()
    if (data.url) {
      setConsentLink(data.url)
      const { data: cs } = await supabase
        .from('consent_requests')
        .select('id, token, status, signer_name, signer_rut, signed_at, created_at')
        .eq('client_id', id)
        .order('created_at', { ascending: false })
      setConsents(cs ?? [])
    } else {
      setConsentError('Error al enviar. Verifica que el cliente tenga teléfono registrado.')
    }
    setSendingConsent(false)
  }

  async function handleDeleteConsent(consentId: string) {
    if (!confirm('¿Eliminar este consentimiento? Esta acción no se puede deshacer.')) return
    setDeletingConsentId(consentId)
    await supabase.from('consent_requests').delete().eq('id', consentId)
    setConsents(prev => prev.filter(c => c.id !== consentId))
    setDeletingConsentId(null)
  }

  async function copyConsentLink(url: string) {
    await navigator.clipboard.writeText(url)
    setCopiedConsent(true)
    setTimeout(() => setCopiedConsent(false), 2000)
  }

  async function handlePhotoUpload(visitId: string, files: FileList) {
    if (!files.length) return
    setUploadingPhotos(prev => ({ ...prev, [visitId]: true }))
    setPhotoError(null)
    const uploaded: VisitPhoto[] = []
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()
      const path = `${visitId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: storageErr } = await supabase.storage.from('client-photos').upload(path, file, { upsert: true })
      if (storageErr) {
        setPhotoError(`Error al subir imagen: ${storageErr.message}`)
        continue
      }
      const { data: { publicUrl } } = supabase.storage.from('client-photos').getPublicUrl(path)
      const { data: photo, error: dbErr } = await supabase
        .from('client_visit_photos')
        .insert({ visit_id: visitId, photo_url: publicUrl, caption: null })
        .select('id, photo_url, caption')
        .single()
      if (dbErr) {
        setPhotoError(`Error al guardar foto: ${dbErr.message}`)
      } else if (photo) {
        uploaded.push(photo)
      }
    }
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, photos: [...v.photos, ...uploaded] } : v))
    setUploadingPhotos(prev => ({ ...prev, [visitId]: false }))
  }

  async function handleDeletePhoto(visitId: string, photoId: string) {
    await supabase.from('client_visit_photos').delete().eq('id', photoId)
    setVisits(prev => prev.map(v => v.id === visitId ? { ...v, photos: v.photos.filter(p => p.id !== photoId) } : v))
  }

  function formatDate(d: string) {
    return new Date(d + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  if (loading) return <div className="px-4 sm:px-8 py-6 sm:py-8"><p className="text-white/30 text-[14px]">Cargando…</p></div>
  if (!client) return <div className="px-4 sm:px-8 py-6 sm:py-8"><p className="text-white/30 text-[14px]">Cliente no encontrado.</p></div>

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-5 text-[13px]">
        <Link href="/dashboard/clientes" className="text-white/35 hover:text-white/60 transition-colors">Clientes</Link>
        <span className="text-white/20">›</span>
        <span className="text-white/60 truncate">{client.name}</span>
      </div>

      {/* Client header */}
      <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-5 mb-5">
        {!editingClient ? (
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-blue-500/25 flex items-center justify-center shrink-0">
              <span className="text-[18px] font-semibold text-blue-400">{initials(client.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-[20px] font-semibold text-white mb-0.5">{client.name}</h1>
              {client.phone && <p className="text-[13px] text-white/40">{client.phone}</p>}
              {client.email && <p className="text-[13px] text-white/40">{client.email}</p>}
              {client.notes && <p className="text-[12px] text-white/30 mt-1 italic">{client.notes}</p>}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[12px] text-white/25">{visits.length} {visits.length === 1 ? 'visita' : 'visitas'}</span>
              </div>
            </div>
            <button onClick={() => setEditingClient(true)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[12px] text-white/35 hover:text-white/60 hover:bg-white/[0.05] transition-colors duration-150">
              Editar
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-[14px] font-semibold text-white">Editar cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[12px] text-white/40 mb-1">Nombre *</label>
                <input type="text" value={clientForm.name} autoFocus
                  onChange={e => setClientForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/40 mb-1">Teléfono</label>
                <input type="tel" value={clientForm.phone}
                  onChange={e => setClientForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-[12px] text-white/40 mb-1">Email</label>
                <input type="email" value={clientForm.email}
                  onChange={e => setClientForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[12px] text-white/40 mb-1">Notas</label>
                <textarea value={clientForm.notes} rows={2}
                  onChange={e => setClientForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveClient} disabled={savingClient || !clientForm.name.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold disabled:opacity-40 transition-colors duration-150">
                {savingClient ? 'Guardando…' : 'Guardar'}
              </button>
              <button onClick={() => setEditingClient(false)}
                className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visit section header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[15px] font-semibold text-white">Historial de visitas</h2>
        {!showVisitForm && (
          <button onClick={() => setShowVisitForm(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150">
            + Nueva visita
          </button>
        )}
      </div>

      {/* Add visit form */}
      {showVisitForm && (
        <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 mb-4 space-y-3">
          <h3 className="text-[14px] font-semibold text-white">Nueva visita</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Fecha *</label>
              <input type="date" value={visitForm.date}
                onChange={e => setVisitForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Tratamiento / servicio</label>
              <input type="text" placeholder="Ej. Corte + Barba" value={visitForm.treatment}
                onChange={e => setVisitForm(f => ({ ...f, treatment: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[12px] text-white/40 mb-1.5">Notas de la visita</label>
              <textarea placeholder="Observaciones, productos usados, etc." value={visitForm.notes} rows={2}
                onChange={e => setVisitForm(f => ({ ...f, notes: e.target.value }))}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={handleAddVisit} disabled={savingVisit || !visitForm.date}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold disabled:opacity-40 transition-colors duration-150">
              {savingVisit ? 'Guardando…' : 'Agregar visita'}
            </button>
            <button onClick={() => { setShowVisitForm(false); setVisitForm(EMPTY_VISIT) }}
              className="px-5 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Visit timeline */}
      {visits.length === 0 ? (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-10 text-center">
          <p className="text-white/25 text-[14px]">Aún no hay visitas registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visits.map((v, idx) => {
            const isOpen = expandedVisit === v.id
            const isEditingThis = editingVisitId === v.id
            return (
              <div key={v.id} className="bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.10] rounded-2xl overflow-hidden transition-colors duration-150">
                {/* Visit header */}
                <button
                  onClick={() => { if (!isEditingThis) setExpandedVisit(isOpen ? null : v.id) }}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left"
                >
                  <div className="flex flex-col items-center shrink-0 w-8">
                    <div className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-amber-400' : 'bg-white/20'}`} />
                    {idx < visits.length - 1 && <div className="w-px flex-1 bg-white/[0.06] mt-1" style={{ minHeight: 16 }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-white capitalize">{formatDate(v.date)}</p>
                    {v.treatment && <p className="text-[12px] text-blue-400/70 mt-0.5">{v.treatment}</p>}
                    {v.notes && !isOpen && <p className="text-[12px] text-white/30 truncate mt-0.5">{v.notes}</p>}
                    <p className="text-[11px] text-white/25 mt-0.5">{v.photos.length} {v.photos.length === 1 ? 'foto' : 'fotos'}</p>
                  </div>
                  <svg className={`text-white/25 shrink-0 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {/* Expanded content */}
                {isOpen && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05]">

                    {/* Edit visit form */}
                    {isEditingThis ? (
                      <div className="pt-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[12px] text-white/40 mb-1">Fecha *</label>
                            <input type="date" value={editVisitForm.date}
                              onChange={e => setEditVisitForm(f => ({ ...f, date: e.target.value }))}
                              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white focus:outline-none focus:border-blue-500/50"
                              style={{ colorScheme: 'dark' }}
                            />
                          </div>
                          <div>
                            <label className="block text-[12px] text-white/40 mb-1">Tratamiento</label>
                            <input type="text" placeholder="Ej. Corte + Barba" value={editVisitForm.treatment}
                              onChange={e => setEditVisitForm(f => ({ ...f, treatment: e.target.value }))}
                              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-[12px] text-white/40 mb-1">Notas</label>
                            <textarea value={editVisitForm.notes} rows={2}
                              onChange={e => setEditVisitForm(f => ({ ...f, notes: e.target.value }))}
                              className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 resize-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button onClick={handleSaveEditVisit} disabled={savingEditVisit || !editVisitForm.date}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold disabled:opacity-40 transition-colors duration-150">
                            {savingEditVisit ? 'Guardando…' : 'Guardar'}
                          </button>
                          <button onClick={() => setEditingVisitId(null)}
                            className="px-4 py-2 rounded-xl text-[13px] text-white/40 hover:text-white/60 transition-colors duration-150">
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between pt-4">
                        <div className="flex-1">
                          {v.notes && <p className="text-[13px] text-white/50 italic">"{v.notes}"</p>}
                        </div>
                        <button onClick={e => { e.stopPropagation(); openEditVisit(v) }}
                          className="shrink-0 ml-3 px-3 py-1.5 rounded-lg text-[12px] text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors duration-150">
                          Editar
                        </button>
                      </div>
                    )}

                    {/* Photos grid */}
                    {v.photos.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {v.photos.map(p => (
                          <div key={p.id} className="relative group aspect-square">
                            <img src={p.photo_url} alt={p.caption ?? ''} className="w-full h-full object-cover rounded-xl border border-white/[0.06]" />
                            <button
                              onClick={() => handleDeletePhoto(v.id, p.id)}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white/60 hover:text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px]"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Photo error */}
                    {photoError && <p className="text-[12px] text-red-400">{photoError}</p>}

                    {/* Upload photos */}
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-dashed border-white/[0.12] hover:border-white/[0.22] text-white/40 hover:text-white/60 text-[13px] transition-colors duration-150 cursor-pointer w-fit ${uploadingPhotos[v.id] ? 'opacity-40 pointer-events-none' : ''}`}>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploadingPhotos[v.id]}
                        onChange={e => e.target.files && handlePhotoUpload(v.id, e.target.files)}
                      />
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      {uploadingPhotos[v.id] ? 'Subiendo…' : 'Subir fotos'}
                    </label>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Consentimientos */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-semibold text-white">Consentimientos</h2>
          <button
            onClick={handleSendConsent}
            disabled={sendingConsent}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.10] text-white/60 hover:text-white text-[13px] font-medium transition-colors duration-150 disabled:opacity-40 flex items-center gap-2"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {sendingConsent ? 'Enviando…' : 'Enviar consentimiento'}
          </button>
        </div>

        {consentError && <p className="text-[12px] text-red-400 mb-3">{consentError}</p>}

        {consentLink && (
          <div className="bg-blue-600/[0.06] border border-blue-500/20 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-blue-400/70 mb-0.5">Enviado por WhatsApp. También puedes copiar el link:</p>
              <p className="text-[11px] text-white/30 truncate font-mono">{consentLink}</p>
            </div>
            <button onClick={() => copyConsentLink(consentLink)}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-black text-[12px] font-semibold transition-colors duration-150">
              {copiedConsent ? '✓' : 'Copiar'}
            </button>
          </div>
        )}

        {consents.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-6 text-center">
            <p className="text-white/20 text-[13px]">Aún no se han enviado consentimientos.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {consents.map(c => (
              <div key={c.id} className="flex items-center gap-4 px-5 py-3.5 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white/60">
                    Enviado el {new Date(c.created_at).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {c.status === 'signed' && (
                    <p className="text-[12px] text-white/35 mt-0.5">
                      Firmado por {c.signer_name} · RUT {c.signer_rut}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === 'signed' ? (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        ✓ Firmado
                      </span>
                      <a
                        href={`https://gestai-app.vercel.app/consentimiento/${c.token}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors duration-150 flex items-center gap-1"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Ver
                      </a>
                      <button
                        onClick={() => handleDeleteConsent(c.id)}
                        disabled={deletingConsentId === c.id}
                        className="text-[12px] text-white/20 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/[0.06] transition-colors duration-150 disabled:opacity-40"
                      >
                        {deletingConsentId === c.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400">
                        Pendiente
                      </span>
                      <button onClick={() => copyConsentLink(`https://gestai-app.vercel.app/consentimiento/${c.token}`)}
                        className="text-[12px] text-white/30 hover:text-white/60 px-2 py-1 rounded-lg hover:bg-white/[0.05] transition-colors duration-150">
                        Copiar link
                      </button>
                      <button
                        onClick={() => handleDeleteConsent(c.id)}
                        disabled={deletingConsentId === c.id}
                        className="text-[12px] text-white/20 hover:text-red-400 px-2 py-1 rounded-lg hover:bg-red-500/[0.06] transition-colors duration-150 disabled:opacity-40"
                      >
                        {deletingConsentId === c.id ? '…' : 'Eliminar'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
