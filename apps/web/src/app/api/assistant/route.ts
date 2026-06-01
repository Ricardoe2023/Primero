import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── WhatsApp via Green API ───────────────────────────────────────────────────

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\s+/g, '').replace(/[^+\d]/g, '')
  // Green API espera formato: 56912345678@c.us (sin +)
  const clean = digits.startsWith('+') ? digits.slice(1) : digits.startsWith('0') ? '56' + digits.slice(1) : digits.length <= 9 ? '56' + digits : digits
  return `${clean}@c.us`
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  const idInstance    = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken      = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
  if (!idInstance || !apiToken) { console.error('[WA] Missing GREENAPI credentials'); return }

  const chatId = normalizePhone(phone)
  const server = idInstance.slice(0, 4)
  console.log('[WA] Sending to', chatId, 'via server', server)

  const res = await fetch(`https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  const json = await res.json()
  console.log('[WA] Response:', JSON.stringify(json))
}

// ─── Tool definitions ────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: 'crear_cita',
    description: 'Crea una cita en el sistema. Úsala SOLO cuando el cliente haya confirmado: su nombre, teléfono, el barbero/estilista, el servicio, la fecha y la hora. Antes de llamarla, repite los datos al cliente y pide confirmación.',
    input_schema: {
      type: 'object',
      properties: {
        staff_name:     { type: 'string', description: 'Nombre exacto del barbero o estilista' },
        service_name:   { type: 'string', description: 'Nombre exacto del servicio' },
        date:           { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
        start_time:     { type: 'string', description: 'Hora de inicio en formato HH:MM (24h)' },
        customer_name:  { type: 'string', description: 'Nombre completo del cliente' },
        customer_phone: { type: 'string', description: 'Teléfono del cliente con WhatsApp (con código de país si lo tiene)' },
      },
      required: ['staff_name', 'service_name', 'date', 'start_time', 'customer_name', 'customer_phone'],
    },
  },
]

// ─── Execute tool ─────────────────────────────────────────────────────────────

type ToolResult = { result: string; waPhone?: string; waMsg?: string }

async function executeTool(name: string, input: any, businessId: string): Promise<ToolResult> {
  if (name !== 'crear_cita') return { result: 'Herramienta desconocida.' }

  const [{ data: staffList }, { data: serviceList }] = await Promise.all([
    supabase.from('staff').select('id, name').eq('business_id', businessId).eq('is_active', true),
    supabase.from('services').select('id, name, duration_minutes, price').eq('business_id', businessId).eq('is_active', true),
  ])

  const staff = (staffList ?? []).find(s =>
    s.name.toLowerCase().includes(input.staff_name.toLowerCase()) ||
    input.staff_name.toLowerCase().includes(s.name.toLowerCase())
  )
  const service = (serviceList ?? []).find(s =>
    s.name.toLowerCase().includes(input.service_name.toLowerCase()) ||
    input.service_name.toLowerCase().includes(s.name.toLowerCase())
  )

  if (!staff) return { result: `No encontré al barbero "${input.staff_name}". Verifica el nombre.` }
  if (!service) return { result: `No encontré el servicio "${input.service_name}". Verifica el nombre.` }

  const [h, m] = input.start_time.split(':').map(Number)
  const endMin = h * 60 + m + (service.duration_minutes ?? 30)
  const end_time = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`

  const { error } = await supabase.from('appointments').insert({
    business_id: businessId,
    staff_id: staff.id,
    service_id: service.id,
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    date: input.date,
    start_time: input.start_time,
    end_time,
    status: 'confirmed',
    source: 'agent',
    notes: `Agendado por asistente IA`,
  })

  if (error) return { result: `Error al crear la cita: ${error.message}` }

  const { data: biz } = await supabase.from('businesses').select('name, phone').eq('id', businessId).single()
  const dateLabel = new Date(input.date + 'T12:00:00').toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
  const waMsg =
    `✅ *Reserva confirmada en ${biz?.name ?? 'el local'}*\n\n` +
    `✂️ *Servicio:* ${service.name}\n` +
    `👤 *Profesional:* ${staff.name}\n` +
    `📅 *Fecha:* ${dateLabel}\n` +
    `🕐 *Hora:* ${input.start_time} – ${end_time}\n` +
    `💰 *Precio:* $${Number(service.price).toLocaleString('es-CL')}\n\n` +
    `Te avisaremos 30 min antes. ${biz?.phone ? `Consultas al ${biz.phone}.` : ''}`

  return {
    result: `CITA_CREADA: ${input.customer_name} | ${service.name} con ${staff.name} | ${input.date} ${input.start_time}–${end_time} | $${Number(service.price).toLocaleString('es-CL')}`,
    waPhone: input.customer_phone,
    waMsg,
  }
}

// ─── Build context ────────────────────────────────────────────────────────────

async function buildContext(businessId?: string): Promise<string> {
  let bizQuery = supabase.from('businesses').select('id, name, description, phone').order('name')
  if (businessId) bizQuery = bizQuery.eq('id', businessId)

  const today = new Date().toISOString().split('T')[0]
  const in7days = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  let apptQuery = supabase
    .from('appointments')
    .select('business_id, staff_id, date, start_time, end_time, status')
    .gte('date', today)
    .lte('date', in7days)
    .in('status', ['confirmed', 'pending'])
  if (businessId) apptQuery = apptQuery.eq('business_id', businessId)

  const [
    { data: businesses },
    { data: services },
    { data: products },
    { data: staff },
    { data: locations },
    { data: appointments },
  ] = await Promise.all([
    bizQuery,
    supabase.from('services').select('id, name, price, duration_minutes, description, staff_ids, business_id').eq('is_active', true),
    supabase.from('products').select('name, brand, price, description, business_id').eq('is_active', true),
    supabase.from('staff').select('id, name, role, specialties, bio, business_id').eq('is_active', true),
    supabase.from('locations').select('business_id, address, city, hours').eq('is_active', true),
    apptQuery,
  ])

  if (!businesses?.length) return 'Aún no hay negocios registrados.'

  return businesses.map((b) => {
    const svcs  = (services     ?? []).filter(x => x.business_id === b.id)
    const prods = (products     ?? []).filter(x => x.business_id === b.id)
    const stf   = (staff        ?? []).filter(x => x.business_id === b.id)
    const loc   = (locations    ?? []).find(x => x.business_id === b.id)
    const appts = (appointments ?? []).filter(x => x.business_id === b.id)

    // Hours — el dashboard guarda con claves numéricas (1=Lun … 0=Dom)
    const DAY_NUM: Record<number, string> = { 1:'Lun', 2:'Mar', 3:'Mié', 4:'Jue', 5:'Vie', 6:'Sáb', 0:'Dom' }
    const ORDER_NUM = [1, 2, 3, 4, 5, 6, 0]
    const hoursText = loc?.hours && Object.keys(loc.hours).length
      ? ORDER_NUM.filter(d => loc.hours[String(d)]).map(d => `${DAY_NUM[d]} ${loc.hours[String(d)].open}-${loc.hours[String(d)].close}`).join(', ')
      : 'horario no configurado'

    // Staff with their services
    const staffText = stf.length
      ? stf.map(s => {
          const mine = svcs.filter(sv => !sv.staff_ids?.length || sv.staff_ids.includes(s.id))
          const svcList = mine.map(sv => `${sv.name} ($${Number(sv.price).toLocaleString('es-CL')}, ${sv.duration_minutes}min)`).join(', ')
          return `  • ${s.name}${s.role ? ` [${s.role}]` : ''}${s.specialties?.length ? ` | Especialidades: ${s.specialties.join(', ')}` : ''}${svcList ? ` | Servicios: ${svcList}` : ''}`
        }).join('\n')
      : '  (sin personal registrado)'

    // All services
    const svcText = svcs.length
      ? svcs.map(s => `  • ${s.name}: $${Number(s.price).toLocaleString('es-CL')}, ${s.duration_minutes}min${s.description ? ` — ${s.description}` : ''}`).join('\n')
      : '  (sin servicios)'

    // Products
    const prodText = prods.length
      ? prods.map(p => `  • ${p.name}${p.brand ? ` (${p.brand})` : ''}: $${Number(p.price).toLocaleString('es-CL')}`).join('\n')
      : '  (sin productos)'

    // Booked slots per staff for next 7 days
    const bookedText = appts.length
      ? (() => {
          const byStaff: Record<string, string[]> = {}
          for (const a of appts) {
            const member = stf.find(s => s.id === a.staff_id)
            if (!member) continue
            if (!byStaff[member.name]) byStaff[member.name] = []
            byStaff[member.name].push(`${a.date} ${a.start_time}-${a.end_time}`)
          }
          return Object.entries(byStaff)
            .map(([name, slots]) => `  • ${name}: ${slots.join(', ')}`)
            .join('\n')
        })()
      : '  (sin citas agendadas en los próximos 7 días)'

    return [
      `=== ${b.name} ===`,
      b.description ? `Descripción: ${b.description}` : '',
      b.phone ? `Teléfono: ${b.phone}` : '',
      loc?.address ? `Dirección: ${loc.address}${loc.city ? `, ${loc.city}` : ''}` : '',
      `Horario: ${hoursText}`,
      `\nPERSONAL:\n${staffText}`,
      `\nSERVICIOS:\n${svcText}`,
      `\nPRODUCTOS:\n${prodText}`,
      `\nCITAS OCUPADAS (próximos 7 días):\n${bookedText}`,
    ].filter(Boolean).join('\n')
  }).join('\n\n')
}

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(context: string, staffName?: string): string {
  const today = new Date().toLocaleDateString('es-CL', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return `Eres el asistente IA de este negocio. Tienes acceso COMPLETO a toda su información: personal, servicios, precios, horarios, productos y dirección.

Tu forma de ser:
- Cálido, cercano y directo — como un buen recepcionista
- Español chileno informal: "po", "cachai", "de una"
- Respuestas cortas (2-3 oraciones). Sin listas con viñetas, conversa natural
- Máximo 1 emoji por mensaje, solo si encaja
- Nunca inventes datos que no estén en el contexto

Tu misión principal:
1. Responder cualquier pregunta sobre servicios, precios, horarios, personal y productos
2. AGENDAR CITAS usando la herramienta crear_cita

Flujo para agendar:
- Si el cliente ya mencionó el servicio, NO lo preguntes de nuevo — confirma el servicio y precio directamente
- Si el cliente ya mencionó al barbero o viene pre-seleccionado, NO lo preguntes — asume ese barbero
- Cuando ya tienes servicio y barbero: ofrece 3-4 horarios disponibles para los próximos días como sugerencia, luego pregunta cuál le acomoda. Ejemplo: "Tengo disponible el jue 22 a las 10:00, 14:00 o 16:00, y el vie 23 a las 11:00 — ¿cuál te viene bien?"
- Verifica disponibilidad usando "CITAS OCUPADAS": si el horario pedido está tomado, dilo y ofrece la siguiente hora libre
- Pide nombre completo y teléfono (para enviar confirmación por WhatsApp)
- Repite todo en un resumen y pide confirmación
- Solo llama crear_cita DESPUÉS de que el cliente confirme

Para calcular disponibilidad:
- Horario del negocio está en "Horario" del contexto (ej: Lun 09:00-20:00)
- Bloques ocupados están en "CITAS OCUPADAS" con formato fecha HH:MM-HH:MM
- Un horario está disponible si NO aparece en las citas ocupadas del barbero ese día y cabe dentro del horario de atención (considera la duración del servicio)
- Si no hay citas para ese día, todos los horarios del turno están libres

Hoy es ${today}.

${staffName ? `El cliente ya eligió: ${staffName}. Asume que la cita será con ${staffName} sin preguntar.` : ''}

INFORMACIÓN DEL NEGOCIO:
${context}`
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { messages, businessId, staffName } = await req.json()
    if (!Array.isArray(messages)) return new Response('messages required', { status: 400 })

    const context = await buildContext(businessId)
    const system = buildSystemPrompt(context, staffName)
    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let assistantBlocks: any[] = []
          let toolUseId = ''
          let toolName = ''
          let toolInputRaw = ''
          let hasToolUse = false

          const stream1 = await anthropic.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 600,
            system,
            messages,
            tools: TOOLS,
            stream: true,
          })

          for await (const event of stream1) {
            if (event.type === 'content_block_start') {
              if (event.content_block.type === 'text') {
                assistantBlocks.push({ type: 'text', text: '' })
              } else if (event.content_block.type === 'tool_use') {
                hasToolUse = true
                toolUseId = event.content_block.id
                toolName = event.content_block.name
                assistantBlocks.push({ type: 'tool_use', id: toolUseId, name: toolName, input: {} })
              }
            } else if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                const last = assistantBlocks[assistantBlocks.length - 1]
                if (last?.type === 'text') (last as any).text += event.delta.text
                controller.enqueue(encoder.encode(event.delta.text))
              } else if (event.delta.type === 'input_json_delta') {
                toolInputRaw += event.delta.partial_json
              }
            }
          }

          if (hasToolUse && businessId) {
            const toolInput = JSON.parse(toolInputRaw || '{}')
            const { result: toolResult, waPhone, waMsg } = await executeTool(toolName, toolInput, businessId)

            // Construir respuesta de confirmación directamente (evita segunda llamada a Claude que puede exceder timeout de Vercel)
            const confirmText = toolResult.startsWith('CITA_CREADA')
              ? '¡Lista la cita, po! 🤙 Te llegará un WhatsApp con los detalles al tiro.'
              : toolResult
            controller.enqueue(encoder.encode(confirmText))

            // Await WA mientras el stream sigue abierto — mantiene la función viva hasta completar
            if (waPhone && waMsg) {
              try { await sendWhatsApp(waPhone, waMsg) } catch (e) { console.error('[WA]', e) }
            }
          }
        } catch (e) {
          console.error('[assistant stream error]', e)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (err) {
    console.error('[assistant route]', err)
    return new Response('Internal server error', { status: 500 })
  }
}
