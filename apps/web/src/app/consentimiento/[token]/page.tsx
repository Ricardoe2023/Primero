'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const CONSENT_TEXT = `Mediante este documento declaro que:

1. He sido informado/a de manera clara sobre el tratamiento o procedimiento estético que se realizará, sus beneficios esperados, posibles riesgos, efectos secundarios y alternativas disponibles.

2. Entiendo que los resultados pueden variar individualmente y no están garantizados.

3. Declaro no padecer condiciones médicas que contraindiquen el procedimiento. He informado al profesional sobre mis antecedentes médicos, alergias, medicamentos actuales y cualquier condición relevante.

4. Me comprometo a seguir las indicaciones de cuidado pre y post tratamiento entregadas por el equipo profesional.

5. Entiendo que puedo retirar este consentimiento en cualquier momento antes del inicio del procedimiento.

6. Autorizo al centro y sus profesionales a realizar el tratamiento acordado.

7. He tenido la oportunidad de realizar todas las preguntas que estimé necesarias, siendo respondidas de forma satisfactoria.

Al firmar este documento, confirmo haber leído, comprendido y aceptado lo anteriormente expuesto, otorgando mi consentimiento libre e informado.`

interface ConsentRecord {
  id: string
  status: string
  client_name: string
  business_name: string
  consent_body: string | null
  signer_name: string | null
  signer_rut: string | null
  signed_at: string | null
}

export default function ConsentPage() {
  const { token } = useParams<{ token: string }>()
  const supabase = createClient()

  const [consent, setConsent] = useState<ConsentRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [name, setName] = useState('')
  const [rut, setRut] = useState('')
  const [signing, setSigning] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('consent_requests')
        .select('id, status, client_name, business_name, consent_body, signer_name, signer_rut, signed_at')
        .eq('token', token)
        .single()
      if (!data) { setNotFound(true); setLoading(false); return }
      setConsent(data)
      setLoading(false)
    }
    load()
  }, [token])

  async function handleSign() {
    if (!consent || !name.trim() || !rut.trim()) return
    setSigning(true)
    setError(null)
    const { error: err } = await supabase
      .from('consent_requests')
      .update({
        status: 'signed',
        signer_name: name.trim(),
        signer_rut: rut.trim(),
        signed_at: new Date().toISOString(),
      })
      .eq('id', consent.id)
      .eq('status', 'pending')
    if (err) {
      setError('Error al firmar. Intenta de nuevo.')
    } else {
      const now = new Date().toISOString()
      setSigned(true)
      setConsent(prev => prev ? {
        ...prev, status: 'signed',
        signer_name: name.trim(),
        signer_rut: rut.trim(),
        signed_at: now,
      } : prev)
      fetch('/api/consent/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      }).catch(() => {})
    }
    setSigning(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#080706] flex items-center justify-center">
      <p className="text-white/30 text-[14px]">Cargando…</p>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-[#080706] flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-white/40 text-[16px] font-medium mb-1">Enlace inválido</p>
        <p className="text-white/20 text-[13px]">Este enlace no existe o ya no está disponible.</p>
      </div>
    </div>
  )

  const alreadySigned = consent?.status === 'signed'

  // ── Document view (signed) ────────────────────────────────────────────────
  if (alreadySigned) return (
    <div className="min-h-screen bg-[#080706] px-4 py-8 pb-16 print:bg-white print:text-black print:px-8 print:py-6">
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
      <div className="max-w-2xl mx-auto">

        {/* Print button */}
        <div className="no-print flex justify-end mb-5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/50 hover:text-white text-[13px] transition-colors duration-150"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
            </svg>
            Guardar / Imprimir PDF
          </button>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden print:border print:border-gray-300 print:rounded-none print:shadow-none">
          {/* Document header */}
          <div className="px-8 py-7 border-b border-white/[0.06] print:border-gray-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] text-white/25 print:text-gray-400 uppercase tracking-[0.22em] font-medium mb-1.5">Consentimiento Informado</p>
                <p className="text-[20px] font-bold text-white print:text-gray-900">{consent?.business_name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] text-white/25 print:text-gray-400 uppercase tracking-[0.15em]">Paciente</p>
                <p className="text-[14px] font-medium text-white/80 print:text-gray-700 mt-0.5">{consent?.client_name}</p>
              </div>
            </div>
          </div>

          {/* Full consent text */}
          <div className="px-8 py-7 border-b border-white/[0.06] print:border-gray-200">
            <p className="text-[10px] text-white/25 print:text-gray-400 uppercase tracking-[0.18em] font-medium mb-4">Términos del consentimiento</p>
            <div className="text-[13px] text-white/60 print:text-gray-700 leading-[1.8] whitespace-pre-line">
              {consent?.consent_body || CONSENT_TEXT}
            </div>
          </div>

          {/* Signature block */}
          <div className="px-8 py-7 bg-emerald-500/[0.04] print:bg-gray-50 border-t border-emerald-500/10 print:border-gray-200">
            <p className="text-[10px] text-white/25 print:text-gray-400 uppercase tracking-[0.18em] font-medium mb-4">Firma digital</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-[11px] text-white/30 print:text-gray-400 mb-1">Nombre completo</p>
                <p className="text-[15px] font-semibold text-emerald-400 print:text-gray-900">{consent?.signer_name}</p>
              </div>
              <div>
                <p className="text-[11px] text-white/30 print:text-gray-400 mb-1">RUT</p>
                <p className="text-[15px] font-semibold text-white/80 print:text-gray-900">{consent?.signer_rut}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[11px] text-white/30 print:text-gray-400 mb-1">Fecha y hora de firma</p>
                <p className="text-[13px] text-white/60 print:text-gray-700">
                  {consent?.signed_at && new Date(consent.signed_at).toLocaleDateString('es-CL', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-white/[0.06] print:border-gray-200">
              <p className="text-[11px] text-white/20 print:text-gray-400">
                Documento generado digitalmente por Gestai · gestai-app.vercel.app
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Signing form (pending) ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080706] px-4 py-8 pb-16">
      <div className="max-w-lg mx-auto">

        {/* Logo / header */}
        <div className="text-center mb-7">
          <p className="text-[22px] font-bold text-white tracking-tight">gestai</p>
          <p className="text-[12px] text-amber-400/70 mt-0.5">{consent?.business_name}</p>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
          {/* Card header */}
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <p className="text-[11px] text-white/25 uppercase tracking-[0.18em] font-medium mb-1">Consentimiento Informado</p>
            <p className="text-[17px] font-semibold text-white">{consent?.business_name}</p>
            <p className="text-[13px] text-white/40 mt-0.5">Paciente: <span className="text-white/60">{consent?.client_name}</span></p>
          </div>

          {/* Consent text (scrollable for signing) */}
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <p className="text-[11px] text-white/25 uppercase tracking-[0.15em] font-medium mb-3">Términos del consentimiento</p>
            <div className="text-[12px] text-white/45 leading-[1.7] whitespace-pre-line bg-white/[0.02] rounded-xl px-4 py-4 border border-white/[0.05] max-h-56 overflow-y-auto">
              {consent?.consent_body || CONSENT_TEXT}
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <p className="text-[13px] text-white/50">Para firmar, ingresa tus datos personales:</p>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">Nombre completo *</label>
              <input
                type="text"
                placeholder="Ingresa tu nombre completo"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-3 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div>
              <label className="block text-[12px] text-white/40 mb-1.5">RUT *</label>
              <input
                type="text"
                placeholder="Ej. 12.345.678-9"
                value={rut}
                onChange={e => setRut(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSign()}
                className="w-full bg-white/[0.05] border border-white/[0.10] rounded-xl px-3 py-3 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            {error && <p className="text-[12px] text-red-400">{error}</p>}
            <button
              onClick={handleSign}
              disabled={signing || !name.trim() || !rut.trim()}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[14px] font-semibold transition-colors duration-150 disabled:opacity-40"
            >
              {signing ? 'Firmando…' : '✍️ Firmar consentimiento'}
            </button>
            <p className="text-[11px] text-white/20 text-center leading-relaxed">
              Al firmar confirmas haber leído y aceptado los términos del consentimiento informado.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-8">Gestai · Plataforma de gestión estética</p>
      </div>
    </div>
  )
}
