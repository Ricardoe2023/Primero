import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Instancia lazy — solo se crea cuando hay API key
function getResend() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  const clean  = digits.startsWith('0') ? '56' + digits.slice(1)
    : digits.length <= 9 ? '56' + digits
    : digits
  return `${clean}@c.us`
}

async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken   = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
  if (!idInstance || !apiToken) return false
  const server = idInstance.slice(0, 4)
  const res = await fetch(
    `https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: normalizePhone(phone), message }) }
  )
  return res.ok
}

// ─── Email ────────────────────────────────────────────────────────────────────

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  try {
    const { error } = await resend.emails.send({
      from: 'GestAI <onboarding@resend.dev>',
      to,
      subject,
      html,
    })
    return !error
  } catch {
    return false
  }
}

function buildEmailHtml(params: {
  customerName: string
  businessName: string
  serviceName: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  price: number
  businessPhone?: string
}) {
  const { customerName, businessName, serviceName, staffName, date, startTime, endTime, price, businessPhone } = params
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(37,99,235,0.10)">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#60A5FA,#1D4ED8);padding:32px 32px 28px;text-align:center">
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px">
        <svg width="32" height="32" viewBox="0 0 52 52" fill="none">
          <rect x="18" y="18" width="28" height="28" rx="9" fill="#1D4ED8" fill-opacity="0.5"/>
          <rect x="6" y="6" width="28" height="28" rx="9" fill="white" fill-opacity="0.9"/>
        </svg>
        <span style="color:white;font-size:20px;font-weight:700;letter-spacing:-0.5px">gestai</span>
      </div>
      <h1 style="color:white;margin:0;font-size:22px;font-weight:700">¡Tu cita está confirmada! ✅</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Te recordamos que tienes una cita en 6 horas</p>
    </div>

    <!-- Body -->
    <div style="padding:32px">
      <p style="color:#374151;font-size:15px;margin:0 0 24px">Hola <strong>${customerName}</strong>, aquí están los detalles de tu cita:</p>

      <!-- Cita card -->
      <div style="background:#f8faff;border:1px solid #dbeafe;border-radius:12px;padding:20px;margin-bottom:24px">
        <div style="display:flex;flex-direction:column;gap:12px">
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:18px">🏠</span>
            <div><span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Local</span><br>
            <span style="color:#0a0f1e;font-size:15px;font-weight:600">${businessName}</span></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:18px">✂️</span>
            <div><span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Servicio</span><br>
            <span style="color:#0a0f1e;font-size:15px;font-weight:600">${serviceName}</span></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:18px">👤</span>
            <div><span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Profesional</span><br>
            <span style="color:#0a0f1e;font-size:15px;font-weight:600">${staffName}</span></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:18px">📅</span>
            <div><span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Fecha y hora</span><br>
            <span style="color:#0a0f1e;font-size:15px;font-weight:600">${date} · ${startTime} – ${endTime}</span></div>
          </div>
          <div style="display:flex;gap:12px;align-items:flex-start">
            <span style="font-size:18px">💰</span>
            <div><span style="color:#6b7280;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Precio</span><br>
            <span style="color:#0a0f1e;font-size:15px;font-weight:600">$${price.toLocaleString('es-CL')}</span></div>
          </div>
        </div>
      </div>

      <p style="color:#6b7280;font-size:13px;margin:0 0 8px">Si necesitas modificar o cancelar tu cita, contáctanos con anticipación.</p>
      ${businessPhone ? `<p style="color:#6b7280;font-size:13px;margin:0">📞 <strong>${businessPhone}</strong></p>` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#f8faff;border-top:1px solid #e5e7eb;padding:20px 32px;text-align:center">
      <p style="color:#9ca3af;font-size:12px;margin:0">Impulsado por <strong style="color:#3B82F6">GestAI</strong> · IA para tu negocio</p>
    </div>
  </div>
</body>
</html>`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Ventana: citas entre 5h30 y 6h30 desde ahora
  const now         = new Date()
  const windowStart = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  const windowEnd   = new Date(now.getTime() + 6.5 * 60 * 60 * 1000)

  // Convertir a fecha y rango de hora
  // Buscamos tanto hoy como mañana (por si la ventana cruza la medianoche)
  const dates = [...new Set([
    windowStart.toISOString().split('T')[0],
    windowEnd.toISOString().split('T')[0],
  ])]

  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, customer_name, customer_phone, customer_email, date, start_time, end_time, business_id, staff_id, service_id')
    .in('date', dates)
    .eq('status', 'confirmed')
    .eq('confirmation_sent', false)

  if (!appointments?.length) return Response.json({ sent: 0, message: 'No pending confirmations' })

  // Filtrar los que están realmente en la ventana de 6h
  const inWindow = appointments.filter(a => {
    const apptTime = new Date(`${a.date}T${a.start_time}`)
    return apptTime >= windowStart && apptTime <= windowEnd
  })

  if (!inWindow.length) return Response.json({ sent: 0, message: 'None in 6h window' })

  // Cargar datos relacionados
  const bizIds     = [...new Set(inWindow.map(a => a.business_id))]
  const staffIds   = [...new Set(inWindow.map(a => a.staff_id).filter(Boolean))]
  const serviceIds = [...new Set(inWindow.map(a => a.service_id).filter(Boolean))]

  const [{ data: businesses }, { data: staffList }, { data: serviceList }] = await Promise.all([
    supabase.from('businesses').select('id, name, phone').in('id', bizIds),
    supabase.from('staff').select('id, name').in('id', staffIds),
    supabase.from('services').select('id, name, price').in('id', serviceIds),
  ])

  let sent = 0
  for (const appt of inWindow) {
    const biz     = businesses?.find(b => b.id === appt.business_id)
    const member  = staffList?.find(s => s.id === appt.staff_id)
    const service = serviceList?.find(s => s.id === appt.service_id)

    const dateStr = new Date(appt.date + 'T12:00:00').toLocaleDateString('es-CL', {
      weekday: 'long', day: 'numeric', month: 'long',
    })

    let waSent    = false
    let emailSent = false

    // ── WhatsApp ──
    if (appt.customer_phone) {
      const waMsg =
        `⏰ *Recordatorio — tienes una cita en ~6 horas*\n\n` +
        `Hola ${appt.customer_name}! 👋\n\n` +
        `📍 *${biz?.name ?? 'el local'}*\n` +
        `✂️ *${service?.name ?? 'tu servicio'}*${member ? ` con ${member.name}` : ''}\n` +
        `📅 *${dateStr}* a las *${appt.start_time.slice(0,5)}*\n` +
        `${service?.price ? `💰 *$${Number(service.price).toLocaleString('es-CL')}*\n` : ''}` +
        `\nSi necesitas cancelar o cambiar, contáctanos. ¡Te esperamos! 🙌`
      waSent = await sendWhatsApp(appt.customer_phone, waMsg)
    }

    // ── Email ──
    if (appt.customer_email) {
      const html = buildEmailHtml({
        customerName:  appt.customer_name,
        businessName:  biz?.name ?? '',
        serviceName:   service?.name ?? '',
        staffName:     member?.name ?? '',
        date:          dateStr,
        startTime:     appt.start_time.slice(0,5),
        endTime:       appt.end_time?.slice(0,5) ?? '',
        price:         Number(service?.price ?? 0),
        businessPhone: biz?.phone ?? undefined,
      })
      emailSent = await sendEmail(
        appt.customer_email,
        `⏰ Recordatorio: tu cita en ${biz?.name ?? 'el local'} es hoy`,
        html
      )
    }

    if (waSent || emailSent) {
      await supabase.from('appointments')
        .update({ confirmation_sent: true, confirmation_sent_at: new Date().toISOString() })
        .eq('id', appt.id)
      sent++
    }
  }

  return Response.json({ sent, total: inWindow.length })
}
