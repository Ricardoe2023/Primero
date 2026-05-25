import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

async function sendWA(phone: string, message: string) {
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
  }).catch(() => {})
}

export async function POST(req: NextRequest) {
  const { token } = await req.json()

  const { data: consent } = await supabase
    .from('consent_requests')
    .select('client_name, business_name, client_phone, signer_name, signer_rut, signed_at, token')
    .eq('token', token)
    .eq('status', 'signed')
    .single()

  if (!consent) return Response.json({ ok: false })

  const consentUrl = `https://gestai-app.vercel.app/consentimiento/${consent.token}`
  const signedDate = new Date(consent.signed_at).toLocaleDateString('es-CL', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  if (consent.client_phone) {
    const msg = `✅ *Consentimiento firmado*\n\n*${consent.business_name}*\n\nHola ${consent.signer_name}, tu consentimiento informado ha quedado registrado correctamente.\n\n📄 Puedes verlo y descargarlo aquí:\n${consentUrl}\n\nFirmado el ${signedDate}\nRUT: ${consent.signer_rut}`
    await sendWA(consent.client_phone, msg)
  }

  return Response.json({ ok: true })
}
