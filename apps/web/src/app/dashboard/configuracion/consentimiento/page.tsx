'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'

const DEFAULT_TEXT = `Mediante este documento declaro que:

1. He sido informado/a de manera clara sobre el tratamiento o procedimiento estético que se realizará, sus beneficios esperados, posibles riesgos, efectos secundarios y alternativas disponibles.

2. Entiendo que los resultados pueden variar individualmente y no están garantizados.

3. Declaro no padecer condiciones médicas que contraindiquen el procedimiento. He informado al profesional sobre mis antecedentes médicos, alergias, medicamentos actuales y cualquier condición relevante.

4. Me comprometo a seguir las indicaciones de cuidado pre y post tratamiento entregadas por el equipo profesional.

5. Entiendo que puedo retirar este consentimiento en cualquier momento antes del inicio del procedimiento.

6. Autorizo al centro y sus profesionales a realizar el tratamiento acordado.

7. He tenido la oportunidad de realizar todas las preguntas que estimé necesarias, siendo respondidas de forma satisfactoria.

Al firmar este documento, confirmo haber leído, comprendido y aceptado lo anteriormente expuesto, otorgando mi consentimiento libre e informado.`

export default function ConsentimientoConfigPage() {
  const supabase = createClient()
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [text, setText] = useState(DEFAULT_TEXT)
  const [savedText, setSavedText] = useState(DEFAULT_TEXT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id, consent_text').eq('owner_id', user.id)
      const { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business) { setLoading(false); return }
      setBusinessId(business.id)
      const t = business.consent_text || DEFAULT_TEXT
      setText(t)
      setSavedText(t)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSave() {
    if (!businessId) return
    setSaving(true)
    await supabase.from('businesses').update({ consent_text: text }).eq('id', businessId)
    setSavedText(text)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
    setSaving(false)
  }

  function handleReset() {
    setText(DEFAULT_TEXT)
  }

  if (loading) return <p className="text-white/30 text-[14px]">Cargando…</p>

  const isDirty = text !== savedText

  return (
    <div className="space-y-5">
      <p className="text-[13px] text-white/35">
        Personaliza el texto del consentimiento informado que verán tus clientes al firmar.
      </p>

      <div className="bg-white/[0.03] border border-white/[0.10] rounded-2xl px-5 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] uppercase tracking-[0.15em] text-white/30 font-medium">Texto del consentimiento</p>
          <button
            onClick={handleReset}
            className="text-[11px] text-white/25 hover:text-white/50 transition-colors duration-150"
          >
            Restaurar texto original
          </button>
        </div>

        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={18}
          className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-4 py-3.5 text-[13px] text-white/70 placeholder-white/20 focus:outline-none focus:border-blue-500/40 resize-y leading-relaxed font-mono"
        />

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-40"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          {success && <p className="text-[13px] text-emerald-400">Guardado correctamente.</p>}
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-4">
        <p className="text-[12px] text-white/30 leading-relaxed">
          <span className="text-white/50 font-medium">Nota:</span> Los consentimientos ya enviados y firmados conservarán el texto original con el que fueron creados. Solo los nuevos consentimientos usarán el texto actualizado.
        </p>
      </div>
    </div>
  )
}
