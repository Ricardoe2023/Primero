import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { clientId } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: client } = await supabase
    .from('clients')
    .select('id, name, phone, business_id')
    .eq('id', clientId)
    .single()
  if (!client) return Response.json({ error: 'Not found' }, { status: 404 })

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, consent_text')
    .eq('id', client.business_id)
    .eq('owner_id', user.id)
    .single()
  if (!business) return Response.json({ error: 'Unauthorized' }, { status: 403 })

  const DEFAULT_CONSENT = `Mediante este documento declaro que:

1. He sido informado/a de manera clara sobre el tratamiento o procedimiento estético que se realizará, sus beneficios esperados, posibles riesgos, efectos secundarios y alternativas disponibles.

2. Entiendo que los resultados pueden variar individualmente y no están garantizados.

3. Declaro no padecer condiciones médicas que contraindiquen el procedimiento. He informado al profesional sobre mis antecedentes médicos, alergias, medicamentos actuales y cualquier condición relevante.

4. Me comprometo a seguir las indicaciones de cuidado pre y post tratamiento entregadas por el equipo profesional.

5. Entiendo que puedo retirar este consentimiento en cualquier momento antes del inicio del procedimiento.

6. Autorizo al centro y sus profesionales a realizar el tratamiento acordado.

7. He tenido la oportunidad de realizar todas las preguntas que estimé necesarias, siendo respondidas de forma satisfactoria.

Al firmar este documento, confirmo haber leído, comprendido y aceptado lo anteriormente expuesto, otorgando mi consentimiento libre e informado.`

  const { data: consent } = await supabase
    .from('consent_requests')
    .insert({
      business_id: business.id,
      client_id: client.id,
      client_name: client.name,
      business_name: business.name,
      client_phone: client.phone ?? null,
      consent_body: business.consent_text || DEFAULT_CONSENT,
    })
    .select('token')
    .single()
  if (!consent) return Response.json({ error: 'Failed to create' }, { status: 500 })

  const url = `https://gestai-app.vercel.app/consentimiento/${consent.token}`

  if (client.phone) {
    const phone = client.phone.replace(/\D/g, '')
    const chatId = `${phone}@c.us`
    const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
    const apiToken = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()
    if (idInstance && apiToken) {
      const server = idInstance.slice(0, 4)
      const waUrl = `https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`
      const message = `Hola ${client.name} 👋\n\n*${business.name}* te solicita firmar el consentimiento informado para tu visita.\n\n✍️ Firma aquí:\n${url}\n\nGracias.`
      await fetch(waUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message }),
      }).catch(() => {})
    }
  }

  return Response.json({ url, token: consent.token })
}
