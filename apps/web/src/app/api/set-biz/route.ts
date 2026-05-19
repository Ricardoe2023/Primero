import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { businessId } = await req.json()
  const res = NextResponse.json({ ok: true })
  res.cookies.set('biz', businessId, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' })
  return res
}
