'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'

const BASE_URL = 'https://gestai-app.vercel.app'

export default function MiPaginaPage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [slug, setSlug] = useState('')
  const [slugInput, setSlugInput] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [savedName, setSavedName] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingName, setSavingName] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [nameSuccess, setNameSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id, name, slug, logo_url').eq('owner_id', user.id)
      const { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business) { setLoading(false); return }
      setBusinessId(business.id)
      setSlug(business.slug)
      setSlugInput(business.slug)
      setNameInput(business.name)
      setSavedName(business.name)
      setLogoUrl(business.logo_url ?? null)
      setLoading(false)
    }
    load()
  }, [])

  function sanitize(val: string) {
    return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  }

  async function handleSaveName() {
    if (!businessId || !nameInput.trim() || nameInput.trim() === savedName) return
    setSavingName(true)
    const { error: err } = await supabase
      .from('businesses')
      .update({ name: nameInput.trim() })
      .eq('id', businessId)
    if (!err) {
      setSavedName(nameInput.trim())
      setNameSuccess(true)
      setTimeout(() => setNameSuccess(false), 3000)
    }
    setSavingName(false)
  }

  async function handleSaveSlug() {
    if (!businessId) return
    const clean = sanitize(slugInput)
    if (!clean || clean === slug) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    const { error: err } = await supabase
      .from('businesses')
      .update({ slug: clean })
      .eq('id', businessId)
    if (err) {
      setError(err.message.includes('duplicate') ? 'Esa URL ya está en uso, elige otra.' : 'Error al guardar.')
    } else {
      setSlug(clean)
      setSlugInput(clean)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
    setSaving(false)
  }

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !businessId) return
    setUploadingLogo(true)
    setLogoError(null)
    const ext = file.name.split('.').pop()
    const path = `${businessId}.${ext}`
    const { error: upErr } = await supabase.storage.from('business-logos').upload(path, file, { upsert: true })
    if (upErr) {
      setLogoError(`Error al subir: ${upErr.message}`)
    } else {
      const { data: { publicUrl } } = supabase.storage.from('business-logos').getPublicUrl(path)
      const baseUrl = publicUrl.split('?')[0]
      const urlWithBust = `${baseUrl}?t=${Date.now()}`
      await supabase.from('businesses').update({ logo_url: baseUrl }).eq('id', businessId)
      setLogoUrl(urlWithBust)
    }
    setUploadingLogo(false)
    if (logoInputRef.current) logoInputRef.current.value = ''
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${BASE_URL}/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return <p className="text-white/30 text-[14px]">Cargando…</p>

  const previewSlug = sanitize(slugInput) || slug

  return (
    <div className="space-y-6">
      <p className="text-[13px] text-white/35">Comparte este link con tus clientes para que vean tu página pública.</p>

      {/* Logo / foto del local */}
      <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium mb-4">Logo o foto del local</p>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.09] shrink-0 flex items-center justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="text-white/15">
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-[13px] text-white/60">Aparecerá como fondo traslúcido en tu página pública.</p>
            <p className="text-[12px] text-white/30">Recomendado: imagen cuadrada, mínimo 400×400px.</p>
            <label className={`px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.09] text-white/60 hover:text-white text-[13px] transition-colors duration-150 flex items-center gap-2 cursor-pointer ${uploadingLogo ? 'opacity-40 pointer-events-none' : ''}`}>
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={uploadingLogo} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {uploadingLogo ? 'Subiendo…' : logoUrl ? 'Cambiar imagen' : 'Subir imagen'}
            </label>
            {logoError && <p className="text-[12px] text-red-400 mt-1">{logoError}</p>}
          </div>
        </div>
      </div>

      {/* Link actual + editar */}
      <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Tu link público</p>

        {/* Display + acciones */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]">
            <p className="text-[13px] text-amber-400 truncate font-mono">{BASE_URL}/<span className="text-white">{slug}</span></p>
          </div>
          <button onClick={copyLink} className="shrink-0 px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 flex items-center gap-2">
            {copied ? (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Copiado</>) : (<><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copiar</>)}
          </button>
          <a href={`${BASE_URL}/${slug}`} target="_blank" rel="noopener noreferrer" className="shrink-0 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.08] text-white/50 hover:text-white text-[13px] transition-colors duration-150 flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Ver
          </a>
        </div>

        {/* Editar slug inline */}
        <div>
          <label className="block text-[12px] text-white/40 mb-1.5">Cambiar URL</label>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-white/25 font-mono shrink-0">gestai-app.vercel.app/</span>
            <input
              type="text"
              value={slugInput}
              onChange={(e) => { setSlugInput(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSlug()}
              placeholder="mi-negocio"
              className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>
          {slugInput && sanitize(slugInput) !== slugInput && (
            <p className="text-[11px] text-white/30 mt-1">Quedará como: <span className="text-amber-400/70 font-mono">{sanitize(slugInput)}</span></p>
          )}
        </div>
        {error && <p className="text-[13px] text-red-400">{error}</p>}
        {success && <p className="text-[13px] text-emerald-400">URL actualizada correctamente.</p>}
        <button
          onClick={handleSaveSlug}
          disabled={saving || !slugInput.trim() || sanitize(slugInput) === slug}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar URL'}
        </button>
      </div>

      {/* Editar nombre */}
      <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Nombre del negocio</p>
        <div>
          <label className="block text-[12px] text-white/40 mb-1.5">Nombre visible para los clientes</label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
            placeholder="Ej. Mister Martinez"
            className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50"
          />
        </div>
        {nameSuccess && <p className="text-[13px] text-emerald-400">Nombre actualizado correctamente.</p>}
        <button
          onClick={handleSaveName}
          disabled={savingName || !nameInput.trim() || nameInput.trim() === savedName}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
        >
          {savingName ? 'Guardando…' : 'Guardar nombre'}
        </button>
      </div>

      {/* Editar slug */}
      <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 space-y-4">
        <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Personalizar URL</p>
        <div>
          <label className="block text-[12px] text-white/40 mb-1.5">Nombre en la URL</label>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-white/25 font-mono shrink-0">gestai-app.vercel.app/</span>
            <input
              type="text"
              value={slugInput}
              onChange={(e) => { setSlugInput(e.target.value); setError(null) }}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveSlug()}
              placeholder="mi-negocio"
              className="flex-1 bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>
          {slugInput && sanitize(slugInput) !== slugInput && (
            <p className="text-[11px] text-white/30 mt-1.5">
              Quedará como: <span className="text-amber-400/70 font-mono">{sanitize(slugInput)}</span>
            </p>
          )}
        </div>
        <div className="px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <p className="text-[11px] text-white/25">Vista previa:</p>
          <p className="text-[13px] font-mono text-white/50 mt-0.5 truncate">{BASE_URL}/{previewSlug}</p>
        </div>
        {error && <p className="text-[13px] text-red-400">{error}</p>}
        {success && <p className="text-[13px] text-emerald-400">URL actualizada correctamente.</p>}
        <button
          onClick={handleSaveSlug}
          disabled={saving || !slugInput.trim() || sanitize(slugInput) === slug}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar URL'}
        </button>
      </div>
    </div>
  )
}
