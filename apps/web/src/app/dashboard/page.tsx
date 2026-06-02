import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import ChartSection from './ChartSection'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  confirmed: 'Confirmada', completed: 'Completada',
  cancelled: 'Cancelada', no_show: 'No asistió',
}
const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  no_show: 'bg-blue-950/[0.3] text-white/40 border-blue-400/10',
}

function formatTime(t: string) { return t.slice(0, 5) }
function formatDate(d: Date) {
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 mb-8 animate-pulse">
      <div className="h-3 w-20 rounded bg-white/[0.05]" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 h-48 rounded-2xl bg-white/[0.025]" />
        <div className="lg:col-span-2 h-48 rounded-2xl bg-white/[0.025]" />
      </div>
      <div className="h-48 rounded-2xl bg-white/[0.025]" />
    </div>
  )
}

export default async function AgendaPage() {
  const [supabase, cookieStore] = await Promise.all([createClient(), cookies()])
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.user_metadata?.role as string | undefined
  const firstName = user.user_metadata?.first_name as string | undefined

  if (role === 'CLIENT') {
    return (
      <div className="px-8 py-8">
        <div className="mb-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05]">
          <p className="text-[13px] text-blue-400/70 font-medium mb-1">Bienvenido a</p>
          <h1 className="text-[26px] font-semibold text-white">Gestai Clientes {firstName ? `👋 ${firstName}` : ''}</h1>
          <p className="text-white/35 text-[14px] mt-1">Aquí podrás ver tus citas y gestionar tus reservas.</p>
        </div>
      </div>
    )
  }

  const activeBizId = cookieStore.get('biz')?.value
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const in7daysStr = new Date(today.getTime() + 7 * 86400000).toISOString().split('T')[0]

  // Intentar con el cookie primero; si no pertenece al usuario, usar el primer negocio disponible
  let { data: business } = activeBizId
    ? await supabase.from('businesses').select('id, name').eq('owner_id', user.id).eq('id', activeBizId).single()
    : { data: null }

  if (!business) {
    const { data: fallback } = await supabase.from('businesses').select('id, name').eq('owner_id', user.id).order('created_at', { ascending: true }).limit(1).single()
    business = fallback ?? null
  }

  const finalBiz = business ?? null
  const effectiveBizId = finalBiz?.id ?? null

  const { data: apptData } = effectiveBizId
    ? await supabase.from('appointments')
        .select('id, date, start_time, end_time, status, customer_name, customer_phone, services(name, price), staff(name)')
        .eq('business_id', effectiveBizId)
        .gte('date', todayStr).lte('date', in7daysStr)
        .order('date').order('start_time')
    : { data: [] }

  const appointments = (apptData ?? []) as any[]

  if (!finalBiz) {
    return (
      <div className="px-8 py-8">
        <div className="mb-8 p-6 rounded-2xl border border-blue-500/20 bg-blue-500/[0.05]">
          <p className="text-[13px] text-blue-400/70 font-medium mb-1">Bienvenido a</p>
          <h1 className="text-[26px] font-semibold text-white">Gestai Partner {firstName ? `👋 ${firstName}` : ''}</h1>
          <p className="text-white/35 text-[14px] mt-1">Tu negocio aún no está configurado.</p>
        </div>
      </div>
    )
  }

  const todayAppts = appointments.filter((a) => a.date === todayStr)
  const upcomingAppts = appointments.filter((a) => a.date > todayStr)
  const realRevenue = todayAppts
    .filter((a) => a.status === 'completed')
    .reduce((sum: number, a: any) => sum + (a.services?.price ?? 0), 0)
  const weekRevenue = appointments
    .filter((a) => a.status !== 'cancelled' && a.status !== 'no_show')
    .reduce((sum: number, a: any) => sum + (a.services?.price ?? 0), 0)

  return (
    <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6">
        <p className="text-[13px] text-blue-400/70 font-medium mb-0.5">Gestai Partner</p>
        <h1 className="text-[22px] font-semibold text-white">
          {firstName ? `Bienvenido, ${firstName} 👋` : 'Dashboard'}
        </h1>
        <p className="text-white/35 text-[14px] mt-0.5 capitalize">{formatDate(today)} · {finalBiz.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Citas hoy', value: todayAppts.length },
          { label: 'Ingreso real (hoy)', value: `$${realRevenue.toLocaleString('es-CL')}` },
          { label: 'Ingresos esperados (semana)', value: `$${weekRevenue.toLocaleString('es-CL')}` },
        ].map((s) => (
          <div key={s.label} className="bg-[#0f1e35] border border-blue-400/[0.10] rounded-2xl px-4 py-4 flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-2">
            <p className="text-[12px] text-white/35">{s.label}</p>
            <p className="text-[22px] font-semibold text-white">{s.value}</p>
          </div>
        ))}
      </div>

      <Suspense fallback={<ChartSkeleton />}>
        <ChartSection />
      </Suspense>

      <section className="mb-8">
        <h2 className="text-[14px] font-semibold text-white/50 uppercase tracking-wider mb-3">Hoy</h2>
        {todayAppts.length === 0 ? (
          <div className="bg-[#0f1e35] border border-blue-400/[0.08] rounded-2xl px-5 py-6 text-center">
            <p className="text-white/25 text-[14px]">Sin citas para hoy</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayAppts.map((a: any) => <AppointmentRow key={a.id} appt={a} />)}
          </div>
        )}
      </section>

      {upcomingAppts.length > 0 && (
        <section>
          <h2 className="text-[14px] font-semibold text-white/50 uppercase tracking-wider mb-3">Próximos días</h2>
          <div className="space-y-2">
            {upcomingAppts.map((a: any) => <AppointmentRow key={a.id} appt={a} showDate />)}
          </div>
        </section>
      )}
    </div>
  )
}

function AppointmentRow({ appt, showDate = false }: { appt: any; showDate?: boolean }) {
  const status = appt.status as string
  const dateLabel = new Date(appt.date + 'T12:00:00').toLocaleDateString('es-CL', { weekday: 'short', day: 'numeric', month: 'short' })
  return (
    <div className="bg-[#0f1e35] border border-blue-400/[0.10] hover:border-blue-400/[0.20] rounded-2xl px-5 py-4 flex items-center gap-4 transition-colors duration-150">
      <div className="text-center shrink-0 w-16">
        <p className="text-[10px] text-white/30 uppercase capitalize mb-0.5">{dateLabel}</p>
        <p className="text-[15px] font-semibold text-white">{formatTime(appt.start_time)}</p>
        <p className="text-[11px] text-white/30">{formatTime(appt.end_time)}</p>
      </div>
      <div className="w-px h-10 bg-white/[0.07] shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{appt.customer_name}</p>
        <p className="text-[12px] text-white/40 truncate">
          {appt.services?.name ?? 'Servicio'}
          {appt.staff?.name ? ` · ${appt.staff.name}` : ''}
          {appt.customer_phone ? ` · ${appt.customer_phone}` : ''}
        </p>
      </div>
      {appt.services?.price && (
        <p className="text-[14px] font-medium text-white/60 shrink-0">
          ${Number(appt.services.price).toLocaleString('es-CL')}
        </p>
      )}
      <span className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full border ${STATUS_COLOR[status] ?? STATUS_COLOR.confirmed}`}>
        {STATUS_LABEL[status] ?? status}
      </span>
    </div>
  )
}
