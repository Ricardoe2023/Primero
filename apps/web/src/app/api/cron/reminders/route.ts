import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\s+/g, '').replace(/[^+\d]/g, '')
  const clean = digits.startsWith('+') ? digits.slice(1) : digits.startsWith('0') ? '56' + digits.slice(1) : digits.length <= 9 ? '56' + digits : digits
  return `${clean}@c.us`
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken   = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
  if (!idInstance || !apiToken) return

  const server = idInstance.slice(0, 4)
  await fetch(`https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: normalizePhone(phone), message }),
  })
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const now = new Date()
  const windowStart = new Date(now.getTime() + 28 * 60 * 1000)
  const windowEnd   = new Date(now.getTime() + 33 * 60 * 1000)

  const todayStr = now.toISOString().split('T')[0]
  const startStr = `${String(windowStart.getHours()).padStart(2,'0')}:${String(windowStart.getMinutes()).padStart(2,'0')}`
  const endStr   = `${String(windowEnd.getHours()).padStart(2,'0')}:${String(windowEnd.getMinutes()).padStart(2,'0')}`

  const { data: upcoming } = await supabase
    .from('appointments')
    .select('id, customer_name, customer_phone, date, start_time, end_time, business_id, staff_id, service_id')
    .eq('date', todayStr)
    .gte('start_time', startStr)
    .lte('start_time', endStr)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false)
    .not('customer_phone', 'is', null)

  if (!upcoming?.length) return Response.json({ sent: 0 })

  const bizIds     = [...new Set(upcoming.map(a => a.business_id))]
  const staffIds   = [...new Set(upcoming.map(a => a.staff_id))]
  const serviceIds = [...new Set(upcoming.map(a => a.service_id))]

  const [{ data: businesses }, { data: staffList }, { data: serviceList }] = await Promise.all([
    supabase.from('businesses').select('id, name').in('id', bizIds),
    supabase.from('staff').select('id, name').in('id', staffIds),
    supabase.from('services').select('id, name').in('id', serviceIds),
  ])

  let sent = 0
  for (const appt of upcoming) {
    const biz     = businesses?.find(b => b.id === appt.business_id)
    const member  = staffList?.find(s => s.id === appt.staff_id)
    const service = serviceList?.find(s => s.id === appt.service_id)

    const msg =
      `⏰ *Recordatorio — en 30 minutos*\n\n` +
      `Hola ${appt.customer_name}, tu cita en *${biz?.name ?? 'el local'}* está por comenzar.\n\n` +
      `✂️ *Servicio:* ${service?.name ?? ''} con ${member?.name ?? ''}\n` +
      `🕐 *Hora:* ${appt.start_time.slice(0,5)} – ${appt.end_time.slice(0,5)}\n\n` +
      `¡Te esperamos!`

    try {
      await sendWhatsApp(appt.customer_phone, msg)
      await supabase.from('appointments').update({ reminder_sent: true }).eq('id', appt.id)
      sent++
    } catch {
      // reintento en el siguiente ciclo
    }
  }

  return Response.json({ sent })
}
