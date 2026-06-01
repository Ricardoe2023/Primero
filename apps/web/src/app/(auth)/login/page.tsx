'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import NovuLogo from '@/components/NovuLogo'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
      return
    }

    router.push(redirect)
  }

  return (
    <div className="p-[6px] rounded-[2rem] bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[calc(2rem-6px)] bg-[#0f1e35] px-7 py-8 space-y-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all duration-150"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.06] transition-all duration-150"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl text-[15px] active:scale-[0.98]"
          style={{ transition: 'transform 160ms cubic-bezier(0.16,1,0.3,1), background-color 150ms' }}
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>

        <p className="text-center text-[13px] text-white/35">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-blue-400/80 hover:text-blue-400 transition-colors">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#060f1a] flex items-center justify-center px-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-blue-600/[0.10] blur-[100px]" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <NovuLogo height={26} wordmark />
          </Link>
          <p className="text-white/40 mt-1.5 text-[14px]">Bienvenido de vuelta</p>
        </div>

        <Suspense fallback={<div className="h-64 rounded-[2rem] bg-white/[0.04] border border-white/[0.08] animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
