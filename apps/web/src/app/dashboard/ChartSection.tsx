import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import DashboardCharts from '@/components/DashboardCharts'

export default async function ChartSection() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cookieStore = await cookies()
  const activeBizId = cookieStore.get('biz')?.value
  const bizQuery = supabase.from('businesses').select('id').eq('owner_id', user.id)
  const { data: business } = activeBizId
    ? await bizQuery.eq('id', activeBizId).single()
    : await bizQuery.order('created_at', { ascending: true }).limit(1).single()
  if (!business) return null

  const today = new Date()
  const sixMonthsAgo = new Date(today)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const { data: histAppts } = await supabase
    .from('appointments')
    .select('date, status, services(price), staff(name)')
    .eq('business_id', business.id)
    .gte('date', sixMonthsAgo.toISOString().split('T')[0])
    .in('status', ['confirmed', 'completed'])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hist = (histAppts ?? []) as any[]

  // Weekly: last 8 weeks
  const weeklyMap: Record<string, { ventas: number; citas: number }> = {}
  for (let i = 7; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    if (!weeklyMap[key]) weeklyMap[key] = { ventas: 0, citas: 0 }
  }
  hist.forEach((a) => {
    const d = new Date(a.date + 'T12:00:00')
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = weekStart.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
    if (weeklyMap[key]) {
      weeklyMap[key].ventas += a.services?.price ?? 0
      weeklyMap[key].citas += 1
    }
  })
  const weekly = Object.entries(weeklyMap).map(([semana, v]) => ({ semana, ...v }))

  // Monthly: last 6 months
  const monthlyMap: Record<string, { ventas: number; citas: number }> = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const key = d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    monthlyMap[key] = { ventas: 0, citas: 0 }
  }
  hist.forEach((a) => {
    const d = new Date(a.date + 'T12:00:00')
    const key = d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' })
    if (monthlyMap[key]) {
      monthlyMap[key].ventas += a.services?.price ?? 0
      monthlyMap[key].citas += 1
    }
  })
  const monthly = Object.entries(monthlyMap).map(([mes, v]) => ({ mes, ...v }))

  // By staff
  const staffMap: Record<string, { ventas: number; citas: number }> = {}
  hist.forEach((a) => {
    const name = a.staff?.name ?? 'Sin asignar'
    if (!staffMap[name]) staffMap[name] = { ventas: 0, citas: 0 }
    staffMap[name].ventas += a.services?.price ?? 0
    staffMap[name].citas += 1
  })
  const byStaff = Object.entries(staffMap)
    .map(([nombre, v]) => ({ nombre, ...v }))
    .sort((a, b) => b.ventas - a.ventas)

  return <DashboardCharts weekly={weekly} monthly={monthly} byStaff={byStaff} />
}
