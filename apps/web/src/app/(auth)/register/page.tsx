'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { api } from '@/lib/api/client'

type Role = 'CLIENT' | 'BARBERSHOP_OWNER'

export default function RegisterPage() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') as Role) || 'CLIENT'

  const [role, setRole] = useState<Role>(defaultRole)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError || !data.user) {
      setError(authError?.message || 'Error al registrar')
      setLoading(false)
      return
    }

    try {
      // Sincronizar con nuestra base de datos
      await api.post('/auth/sync-user', {
        id: data.user.id,
        email,
        role,
        firstName,
        lastName,
      })
    } catch {
      setError('Error al crear perfil. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.push(role === 'BARBERSHOP_OWNER' ? '/dashboard' : '/marketplace')
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-white tracking-tight">
            BarberHub
          </Link>
          <p className="text-slate-400 mt-2">Crea tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-8 space-y-5">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Selector de rol */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Soy...</label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'CLIENT', label: 'Cliente' },
                { value: 'BARBERSHOP_OWNER', label: 'Barbero / Dueño' },
              ] as { value: Role; label: string }[]).map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${
                    role === r.value
                      ? 'bg-amber-500 border-amber-500 text-slate-900'
                      : 'border-slate-600 text-slate-300 hover:border-slate-400'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Nombre</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Apellido</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                placeholder="Pérez"
              />
            </div>
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-bold py-3 rounded-lg transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-slate-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
