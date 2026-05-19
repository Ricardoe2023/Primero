'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getActiveBizId } from '@/lib/activeBiz'

const DAYS = [
  { key: 1, label: 'Lunes' },
  { key: 2, label: 'Martes' },
  { key: 3, label: 'Miércoles' },
  { key: 4, label: 'Jueves' },
  { key: 5, label: 'Viernes' },
  { key: 6, label: 'Sábado' },
  { key: 0, label: 'Domingo' },
]

type DayHours = { open: string; close: string }
type HoursMap = Record<string, DayHours>
type DayState = { enabled: boolean; open: string; close: string }

const DEFAULT_OPEN = '09:00'
const DEFAULT_CLOSE = '19:00'

export default function HorariosPage() {
  const supabase = createClient()
  const [locationId, setLocationId] = useState<string | null>(null)
  const [days, setDays] = useState<Record<number, DayState>>(() =>
    Object.fromEntries(DAYS.map((d) => [d.key, { enabled: false, open: DEFAULT_OPEN, close: DEFAULT_CLOSE }]))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const activeBizId = getActiveBizId()
      const query = supabase.from('businesses').select('id').eq('owner_id', user.id)
      const { data: business } = activeBizId
        ? await query.eq('id', activeBizId).single()
        : await query.order('created_at', { ascending: true }).limit(1).single()
      if (!business) return

      let { data: location } = await supabase
        .from('locations')
        .select('id, hours')
        .eq('business_id', business.id)
        .single()

      // Si no existe local, crearlo automáticamente
      if (!location) {
        const { data: created } = await supabase
          .from('locations')
          .insert({ business_id: business.id, name: '', address: '', city: '', hours: {}, is_active: true })
          .select('id, hours')
          .single()
        location = created
      }
      if (!location) { setLoading(false); return }

      setLocationId(location.id)
      const hours: HoursMap = location.hours ?? {}
      setDays(
        Object.fromEntries(
          DAYS.map((d) => {
            const h = hours[String(d.key)]
            return [d.key, h
              ? { enabled: true, open: h.open, close: h.close }
              : { enabled: false, open: DEFAULT_OPEN, close: DEFAULT_CLOSE }
            ]
          })
        )
      )
      setLoading(false)
    }
    load()
  }, [])

  function toggle(key: number) {
    setDays((prev) => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }))
  }

  function setTime(key: number, field: 'open' | 'close', value: string) {
    setDays((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSave() {
    if (!locationId) return
    setSaving(true)
    const hours: HoursMap = {}
    DAYS.forEach((d) => {
      if (days[d.key].enabled) {
        hours[String(d.key)] = { open: days[d.key].open, close: days[d.key].close }
      }
    })
    await supabase.from('locations').update({ hours }).eq('id', locationId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return <p className="text-white/30 text-[14px]">Cargando horarios…</p>
  }

  if (!locationId) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl px-5 py-6 text-center">
        <p className="text-white/30 text-[14px]">No hay local configurado aún.</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[13px] text-white/35 mb-6">Define qué días y en qué horario atiende tu negocio.</p>

      <div className="space-y-2 mb-8">
        {DAYS.map((d) => {
          const day = days[d.key]
          return (
            <div
              key={d.key}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl border transition-all duration-150 ${
                day.enabled
                  ? 'bg-white/[0.04] border-white/[0.10]'
                  : 'bg-white/[0.02] border-white/[0.05]'
              }`}
            >
              {/* Toggle */}
              <button
                onClick={() => toggle(d.key)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                  day.enabled ? 'bg-amber-500' : 'bg-white/[0.12]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    day.enabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Day label */}
              <span className={`w-24 text-[14px] font-medium shrink-0 ${day.enabled ? 'text-white' : 'text-white/30'}`}>
                {d.label}
              </span>

              {/* Time inputs */}
              {day.enabled ? (
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="time"
                    value={day.open}
                    onChange={(e) => setTime(d.key, 'open', e.target.value)}
                    className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <span className="text-white/25 text-[13px]">a</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={(e) => setTime(d.key, 'close', e.target.value)}
                    className="bg-white/[0.06] border border-white/[0.10] rounded-lg px-3 py-1.5 text-[13px] text-white focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              ) : (
                <span className="text-[13px] text-white/20">Cerrado</span>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-[13px] font-semibold transition-colors duration-150 disabled:opacity-50"
      >
        {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar horarios'}
      </button>
    </div>
  )
}
