import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { supabase } from '@/lib/supabase'
import type { BusinessContext } from '@/types/database'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DAY_NAMES: Record<number, string> = {
  0: 'Domingo', 1: 'Lunes', 2: 'Martes', 3: 'Miércoles',
  4: 'Jueves', 5: 'Viernes', 6: 'Sábado',
}

async function loadBusinessContext(slug: string): Promise<BusinessContext | null> {
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!business) return null

  const [
    { data: locations },
    { data: services },
    { data: products },
    { data: staff },
    { data: agentConfig },
  ] = await Promise.all([
    supabase.from('locations').select('*').eq('business_id', business.id).eq('is_active', true),
    supabase.from('services').select('*').eq('business_id', business.id).eq('is_active', true),
    supabase.from('products').select('*').eq('business_id', business.id).eq('is_active', true),
    supabase.from('staff').select('*').eq('business_id', business.id).eq('is_active', true),
    supabase.from('agent_configs').select('*').eq('business_id', business.id).single(),
  ])

  return {
    business,
    locations: locations ?? [],
    services: services ?? [],
    products: products ?? [],
    staff: staff ?? [],
    agentConfig: agentConfig ?? null,
  }
}

function buildSystemPrompt(ctx: BusinessContext): string {
  const { business, locations, services, products, staff, agentConfig } = ctx
  const cfg = agentConfig

  const locationText = locations.map(loc => {
    const hoursText = Object.entries(loc.hours)
      .map(([day, h]) => `${DAY_NAMES[Number(day)]}: ${h.open}–${h.close}`)
      .join(', ')
    return `- ${loc.name}: ${loc.address}, ${loc.city}. Horario: ${hoursText}. Teléfono: ${loc.phone ?? 'no disponible'}`
  }).join('\n')

  const servicesText = services.map(s =>
    `- ${s.name} [id:${s.id}]: $${Number(s.price).toLocaleString('es-CL')} · ${s.duration_minutes} min`
  ).join('\n')

  const productsText = products.length > 0
    ? products.map(p => `- ${p.name}${p.brand ? ` (${p.brand})` : ''}: $${Number(p.price).toLocaleString('es-CL')}`).join('\n')
    : 'Sin productos.'

  const staffText = staff.map(s =>
    `- ${s.name} [id:${s.id}]${s.role ? ` (${s.role})` : ''}`
  ).join('\n')

  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]
  const todayStr = today.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return `Eres ${cfg?.agent_name ?? 'Martina'}, agente de atención de **${business.name}**.
${cfg?.personality ?? 'Amable, directa, español chileno informal. Máximo 3 oraciones por respuesta.'}

Hoy: ${todayStr} (ISO: ${todayISO}).

## Locales
${locationText || 'Sin locales.'}

## Servicios
${servicesText || 'Sin servicios.'}

## Productos
${productsText}

## Equipo
${staffText || 'Sin personal.'}

## Instrucciones
- Para agendar recopila: servicio, día, hora, nombre y teléfono del cliente.
- Genera horarios razonables dentro del horario del local.
- Cuando tengas todos los datos confirmados por el cliente, confirma la reserva.
- No inventes precios ni servicios.
${cfg?.extra_instructions ? `\n## Extra\n${cfg.extra_instructions}` : ''}`
}

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'save_appointment',
  description: 'Extrae y guarda los datos de la cita confirmada.',
  input_schema: {
    type: 'object' as const,
    properties: {
      customer_name: { type: 'string' },
      customer_phone: { type: 'string' },
      service_id: { type: 'string', description: 'ID del servicio del listado (formato UUID)' },
      service_name: { type: 'string' },
      date: { type: 'string', description: 'Fecha YYYY-MM-DD' },
      start_time: { type: 'string', description: 'Hora inicio HH:MM' },
      end_time: { type: 'string', description: 'Hora término HH:MM' },
      staff_id: { type: 'string', description: 'ID del barbero (opcional)' },
    },
    required: ['customer_name', 'customer_phone', 'service_id', 'service_name', 'date', 'start_time', 'end_time'],
  },
}

function isBookingConfirmation(text: string): boolean {
  return /reserva|cita.*confirm|confirm.*cita|quedó.*agend|agend.*quedó|nos vemos|¡listo|todo listo|agendando|agendad[ao]|confirmad[ao]|registrad[ao]|guardad[ao]|de una|ya quedó|está confirmad|cita está|hora está/i.test(text)
}

async function sendWhatsApp(phone: string, message: string) {
  const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
  if (!idInstance || !apiToken) return
  const server = idInstance.slice(0, 4)
  const url = `https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`
  const chatId = `${phone.replace(/\D/g, '')}@c.us`
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  }).catch(e => console.error('[sendWhatsApp error]', e))
}

async function extractAndSave(ctx: BusinessContext, messages: Anthropic.MessageParam[], confirmedText: string) {
  const today = new Date()
  const todayISO = today.toISOString().split('T')[0]

  const extraction = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: `Extrae los datos de la cita de la conversación. Hoy es ${todayISO}.
Servicios disponibles con sus IDs: ${ctx.services.map(s => `${s.name}=${s.id}`).join(', ')}.
Staff disponible: ${ctx.staff.map(s => `${s.name}=${s.id}`).join(', ')}.
Usa los IDs exactos del listado. Si "mañana" es el día mencionado, usa ${new Date(today.getTime() + 86400000).toISOString().split('T')[0]}.`,
    tools: [EXTRACT_TOOL],
    tool_choice: { type: 'any' },
    messages: [
      ...messages,
      { role: 'assistant' as const, content: confirmedText },
      { role: 'user' as const, content: 'Extrae y guarda los datos de esta cita confirmada.' },
    ],
  })

  const toolUse = extraction.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
  if (!toolUse) return { success: false, error: 'No se pudo extraer' }

  const args = toolUse.input as {
    customer_name: string; customer_phone: string; service_id: string
    service_name: string; date: string; start_time: string; end_time: string; staff_id?: string
  }

  console.log('[save_appointment] args:', JSON.stringify(args))

  const location = ctx.locations[0]
  const { error } = await supabase.from('appointments').insert({
    business_id: ctx.business.id,
    location_id: location?.id ?? null,
    staff_id: args.staff_id ?? null,
    service_id: args.service_id ?? null,
    customer_name: args.customer_name,
    customer_phone: args.customer_phone,
    date: args.date,
    start_time: args.start_time,
    end_time: args.end_time,
    status: 'confirmed',
    source: 'agent',
  })

  console.log('[save_appointment] supabase error:', error?.message ?? 'none')

  // Enviar WhatsApp de confirmación al cliente
  if (!error && args.customer_phone) {
    const dateObj = new Date(args.date + 'T12:00:00')
    const dateStr = dateObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })
    const staffMember = args.staff_id ? ctx.staff.find(s => s.id === args.staff_id) : null
    const locationInfo = location ? `📍 ${location.name}${location.address ? ` · ${location.address}` : ''}` : ''
    const msg = `¡Hola ${args.customer_name}! 👋\n\nTu cita en *${ctx.business.name}* ha sido confirmada ✅\n\n📋 *${args.service_name}*\n📅 ${dateStr} a las ${args.start_time}${staffMember ? `\n👤 ${staffMember.name}` : ''}${locationInfo ? `\n${locationInfo}` : ''}\n\nSi necesitas modificar o cancelar tu cita, contáctanos. ¡Hasta pronto!`
    await sendWhatsApp(args.customer_phone, msg)
  }

  return { success: !error, error: error?.message }
}

export async function POST(req: NextRequest) {
  try {
    const { businessSlug, messages } = await req.json()

    if (!businessSlug || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'businessSlug and messages are required' }, { status: 400 })
    }

    const ctx = await loadBusinessContext(businessSlug)
    if (!ctx) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const systemPrompt = buildSystemPrompt(ctx)

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    })

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
    const text = textBlock?.text ?? ''

    // Si la respuesta confirma una cita, extraer y guardar (await para que Vercel no lo mate)
    if (isBookingConfirmation(text)) {
      await extractAndSave(ctx, messages, text).catch(e => console.error('[extractAndSave error]', e))
    }

    return NextResponse.json({ text })

  } catch (err) {
    console.error('[agent route]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
