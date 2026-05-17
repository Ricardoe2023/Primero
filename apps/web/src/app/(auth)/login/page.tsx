'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') || '/marketplace'

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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            BarberHub
          </Link>
          <p className="text-slate-400 mt-2">Bienvenido de vuelta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>

          <p className="text-center text-sm text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-amber-400 hover:text-amber-300">
              Regístrate
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
