import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
        customer_phone: { type: 'string', description: 'Teléfono del cliente' },
      },
      required: ['staff_name', 'service_name', 'date', 'start_time', 'customer_name', 'customer_phone'],
    },
  },
]

// ─── Execute tool ─────────────────────────────────────────────────────────────

async function executeTool(name: string, input: any, businessId: string): Promise<string> {
  if (name !== 'crear_cita') return 'Herramienta desconocida.'

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

  if (!staff) return `No encontré al barbero "${input.staff_name}". Verifica el nombre.`
  if (!service) return `No encontré el servicio "${input.service_name}". Verifica el nombre.`

  const [h, m] = input.start_time.split(':').map(Number)
  const endMin = h * 60 + m + (service.duration_minutes ?? 30)
  const end_time = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`

  const { data, error } = await supabase.from('appointments').insert({
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
  }).select().single()

  if (error) return `Error al crear la cita: ${error.message}`

  return `CITA_CREADA: ID ${data.id} | ${input.customer_name} | ${service.name} con ${staff.name} | ${input.date} ${input.start_time}–${end_time} | $${Number(service.price).toLocaleString('es-CL')}`
}

// ─── Build context ────────────────────────────────────────────────────────────

async function buildContext(businessId?: string): Promise<string> {
  let bizQuery = supabase.from('businesses').select('id, name, description, phone').order('name')
  if (businessId) bizQuery = bizQuery.eq('id', businessId)

  const [
    { data: businesses },
    { data: services },
    { data: products },
    { data: staff },
    { data: locations },
  ] = await Promise.all([
    bizQuery,
    supabase.from('services').select('id, name, price, duration_minutes, description, staff_ids, business_id').eq('is_active', true),
    supabase.from('products').select('name, brand, price, description, business_id').eq('is_active', true),
    supabase.from('staff').select('id, name, role, specialties, bio, business_id').eq('is_active', true),
    supabase.from('locations').select('business_id, address, city, hours').eq('is_active', true),
  ])

  if (!businesses?.length) return 'Aún no hay negocios registrados.'

  return businesses.map((b) => {
    const svcs  = (services   ?? []).filter(x => x.business_id === b.id)
    const prods = (products   ?? []).filter(x => x.business_id === b.id)
    const stf   = (staff      ?? []).filter(x => x.business_id === b.id)
    const loc   = (locations  ?? []).find(x => x.business_id === b.id)

    // Hours
    const DAY: Record<string, string> = { monday:'Lun', tuesday:'Mar', wednesday:'Mié', thursday:'Jue', friday:'Vie', saturday:'Sáb', sunday:'Dom' }
    const ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
    const hoursText = loc?.hours && Object.keys(loc.hours).length
      ? ORDER.filter(d => loc.hours[d]).map(d => `${DAY[d]} ${loc.hours[d].open}-${loc.hours[d].close}`).join(', ')
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

    return [
      `=== ${b.name} ===`,
      b.description ? `Descripción: ${b.description}` : '',
      b.phone ? `Teléfono: ${b.phone}` : '',
      loc?.address ? `Dirección: ${loc.address}${loc.city ? `, ${loc.city}` : ''}` : '',
      `Horario: ${hoursText}`,
      `\nPERSONAL:\n${staffText}`,
      `\nSERVICIOS:\n${svcText}`,
      `\nPRODUCTOS:\n${prodText}`,
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
- Pregunta qué servicio quiere y con quién (si no lo sabe, sugiérele opciones)
- Pregunta la fecha y hora que le acomoda
- Pide nombre completo y teléfono
- Repite todo en un resumen y pide confirmación
- Solo llama crear_cita DESPUÉS de que el cliente confirme
- Tras crear la cita, confirma con los datos: fecha, hora, barbero y precio

Hoy es ${today}.

${staffName ? `El cliente ya eligió: ${staffName}. Cuando hables de agendar, asume que será con ${staffName} salvo que pida cambiar.` : ''}

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
          // ── Collect full first response (handles tool_use cleanly) ──
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
                // Stream text to client immediately
                controller.enqueue(encoder.encode(event.delta.text))
              } else if (event.delta.type === 'input_json_delta') {
                toolInputRaw += event.delta.partial_json
              }
            }
          }

          // ── If tool was called, execute and get follow-up ──
          if (hasToolUse && businessId) {
            const toolInput = JSON.parse(toolInputRaw || '{}')
            const toolResult = await executeTool(toolName, toolInput, businessId)

            const last = assistantBlocks[assistantBlocks.length - 1]
            if (last?.type === 'tool_use') (last as any).input = toolInput

            const stream2 = await anthropic.messages.create({
              model: 'claude-sonnet-4-6',
              max_tokens: 400,
              system,
              messages: [
                ...messages,
                { role: 'assistant' as const, content: assistantBlocks },
                {
                  role: 'user' as const,
                  content: [{ type: 'tool_result' as const, tool_use_id: toolUseId, content: toolResult }],
                },
              ],
              stream: true,
            })

            for await (const event of stream2) {
              if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(event.delta.text))
              }
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
