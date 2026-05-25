'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import NovuLogo from '@/components/NovuLogo'

type Role = 'CLIENT' | 'BARBERSHOP_OWNER'

const inputClass =
  'w-full bg-white/[0.04] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-amber-500/60 focus:bg-white/[0.06] transition-all duration-150'

function RegisterForm() {
  const router = useRouter()
  const params = useSearchParams()
  const defaultRole = (params.get('role') as Role) || 'BARBERSHOP_OWNER'

  const [role, setRole] = useState<Role>(defaultRole)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName, role },
      },
    })

    if (authError) {
      setError(
        authError.message.includes('already registered')
          ? 'Este email ya está registrado. Prueba iniciar sesión.'
          : authError.message
      )
      setLoading(false)
      return
    }

    if (!data.user) {
      // Email confirmation pending — mostrar pantalla de éxito
      setEmailSent(true)
      setLoading(false)
      return
    }

    if (role === 'BARBERSHOP_OWNER' && businessName.trim()) {
      const slug = businessName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const { error: bizError } = await supabase.from('businesses').insert({
        name: businessName.trim(),
        slug,
        owner_id: data.user.id,
        industry: 'barberia',
      })

      if (bizError) {
        setError('Cuenta creada, pero hubo un error al crear el negocio. Inicia sesión para continuar.')
        setLoading(false)
        return
      }
    }

    router.push(role === 'BARBERSHOP_OWNER' ? '/dashboard' : '/marketplace')
  }

  if (emailSent) {
    return (
      <div className="p-[6px] rounded-[2rem] bg-white/[0.04] border border-white/[0.08]">
        <div className="rounded-[calc(2rem-6px)] bg-[#111010] px-7 py-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h2 className="text-white font-semibold text-[18px]">Revisa tu correo</h2>
          <p className="text-white/45 text-[14px] leading-relaxed">
            Te enviamos un link de confirmación a <span className="text-amber-400">{email}</span>.<br/>
            Haz clic en el link para activar tu cuenta y acceder al dashboard.
          </p>
          <p className="text-white/25 text-[12px]">¿No llegó? Revisa la carpeta de spam.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-[6px] rounded-[2rem] bg-white/[0.04] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <form
        onSubmit={handleSubmit}
        className="rounded-[calc(2rem-6px)] bg-[#111010] px-7 py-8 space-y-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
      >
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[13px] text-white/45 mb-2 font-medium">Soy...</label>
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            {([
              { value: 'BARBERSHOP_OWNER', label: 'Dueño de negocio' },
              { value: 'CLIENT', label: 'Cliente' },
            ] as { value: Role; label: string }[]).map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  role === r.value
                    ? 'bg-amber-500 text-[#080706] shadow-sm'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Nombre</label>
            <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} placeholder="Juan" />
          </div>
          <div>
            <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Apellido</label>
            <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} placeholder="Pérez" />
          </div>
        </div>

        {role === 'BARBERSHOP_OWNER' && (
          <div>
            <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Nombre del negocio</label>
            <input type="text" required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} placeholder="Ej: Mister Martines" />
          </div>
        )}

        <div>
          <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="tu@email.com" />
        </div>

        <div>
          <label className="block text-[13px] text-white/45 mb-1.5 font-medium">Contraseña</label>
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="Mínimo 8 caracteres" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-[#080706] font-semibold py-3 rounded-xl text-[15px] active:scale-[0.98]"
          style={{ transition: 'transform 160ms cubic-bezier(0.16,1,0.3,1), background-color 150ms' }}
        >
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className="text-center text-[13px] text-white/35">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-amber-400/80 hover:text-amber-400 transition-colors">
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#080706] flex items-center justify-center px-4 py-14">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full bg-amber-600/[0.05] blur-[100px]" />
      </div>
      <div className="w-full max-w-sm relative animate-fade-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center">
            <NovuLogo height={26} wordmark />
          </Link>
          <p className="text-white/40 mt-1.5 text-[14px]">Crea tu cuenta</p>
        </div>
        <Suspense fallback={<div className="h-96 rounded-[2rem] bg-white/[0.04] border border-white/[0.08] animate-pulse" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}
