import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const idInstance = process.env.GREENAPI_ID_INSTANCE?.replace(/^﻿/, '').trim()
  const apiToken   = process.env.GREENAPI_API_TOKEN?.replace(/^﻿/, '').trim()

  if (!idInstance || !apiToken) {
    return Response.json({ error: 'Missing credentials', idInstance: !!idInstance, apiToken: !!apiToken })
  }

  const phone = req.nextUrl.searchParams.get('phone') ?? '56957235875'
  const chatId = `${phone}@c.us`
  const server = idInstance.slice(0, 4)

  const url = `https://${server}.api.green-api.com/waInstance${idInstance}/sendMessage/${apiToken}`

  let result: unknown
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message: '✅ Prueba de WhatsApp desde Gestai' }),
    })
    result = await res.json()
  } catch (e) {
    result = { fetchError: String(e) }
  }

  return Response.json({ url, chatId, result })
}
