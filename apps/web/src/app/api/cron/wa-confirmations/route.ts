import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function sendWhatsApp(phone: string, message: string) {
  const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken  = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
  if (!idInstance || !apiToken) return false

  const digits = phone.replace(/\D/g, '')
  const clean  = digits.length <= 9 ? '56' + digits : digits.startsWith('0') ? '56' + digits.slice(1) : digits
  const chatId = `${clean}@c.us`
  const server = idInstance.slice(0, 4)

  const res = await fetch(
    `https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId, message }) }
  )
  return res.ok
}

export async function GET(req: NextRequest) {
  // Verificar cron secret para seguridad
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Buscar citas de los últimos 10 minutos sin WA enviado
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('id, customer_name, customer_phone, date, start_time, end_time, service_id, staff_id, business_id, wa_sent')
    .eq('source', 'agent')
    .eq('status', 'confirmed')
    .eq('wa_sent', false)
    .gte('created_at', since)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!appointments?.length) return NextResponse.json({ sent: 0, message: 'No pending' })

  let sent = 0
  for (const appt of appointments) {
    if (!appt.customer_phone) continue

    // Cargar datos del negocio, servicio y staff
    const [{ data: biz }, { data: service }, { data: staff }] = await Promise.all([
      supabase.from('businesses').select('name, phone').eq('id', appt.business_id).single(),
      supabase.from('services').select('name, price').eq('id', appt.service_id).single(),
      appt.staff_id ? supabase.from('staff').select('name').eq('id', appt.staff_id).single() : Promise.resolve({ data: null }),
    ])

    const dateStr = new Date(appt.date + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

    const msg =
      `✅ *Reserva confirmada en ${biz?.name ?? 'el local'}*\n\n` +
      `${service ? `✂️ *Servicio:* ${service.name}\n` : ''}` +
      `${staff ? `👤 *Profesional:* ${staff.name}\n` : ''}` +
      `📅 *Fecha:* ${dateStr}\n` +
      `🕐 *Hora:* ${appt.start_time}${appt.end_time ? ` – ${appt.end_time}` : ''}\n` +
      `${service?.price ? `💰 *Precio:* $${Number(service.price).toLocaleString('es-CL')}\n` : ''}` +
      `\nTe avisaremos antes de tu cita. ${biz?.phone ? `Consultas al ${biz.phone}.` : ''}`

    const ok = await sendWhatsApp(appt.customer_phone, msg)
    if (ok) {
      await supabase.from('appointments')
        .update({ wa_sent: true, wa_sent_at: new Date().toISOString() })
        .eq('id', appt.id)
      sent++
    }
  }

  return NextResponse.json({ sent, total: appointments.length })
}
