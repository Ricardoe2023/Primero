'use client'

import { useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setSending(false)
  }

  const inputClass =
    'w-full bg-white/[0.05] border border-white/[0.09] rounded-xl px-4 py-3 text-white text-[14px] placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-150'

  return (
    <section className="px-4 sm:px-6 pb-32 max-w-3xl mx-auto">
      <div className="p-[6px] rounded-[2rem] bg-white/[0.04] border border-white/[0.08]">
        <div className="rounded-[calc(2rem-6px)] bg-[#0f1e35] px-8 py-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">

          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-2">
              Contacto
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              ¿Tienes alguna consulta?
            </h2>
            <p className="text-white/40 mt-2 text-[15px]">
              Escríbenos y te respondemos a la brevedad.
            </p>
          </div>

          {sent ? (
            <div className="py-10 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <div>
                <p className="text-[16px] font-semibold text-white">¡Mensaje enviado!</p>
                <p className="text-white/40 text-[14px] mt-1">Te responderemos pronto.</p>
              </div>
              <button
                onClick={() => { setSent(false); setName(''); setEmail(''); setMessage('') }}
                className="text-[13px] text-blue-400/70 hover:text-blue-400 transition-colors mt-1"
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-white/40 font-medium mb-1.5">Nombre</label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Pérez"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-white/40 font-medium mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] text-white/40 font-medium mb-1.5">Mensaje</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntanos en qué podemos ayudarte..."
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <p className="text-[12px] text-white/25">
                  También puedes escribirnos por{' '}
                  <a
                    href="https://wa.me/56957235875"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400/60 hover:text-blue-400 transition-colors"
                  >
                    WhatsApp
                  </a>
                </p>
                <button
                  type="submit"
                  disabled={sending}
                  className="group inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-full text-[14px] active:scale-[0.97] shrink-0"
                  style={{ transition: 'transform 160ms cubic-bezier(0.16,1,0.3,1), background-color 150ms' }}
                >
                  {sending ? 'Enviando...' : 'Enviar mensaje'}
                  {!sending && (
                    <span className="w-5 h-5 rounded-full bg-[#060f1a]/15 flex items-center justify-center group-hover:translate-x-0.5 transition-transform duration-150">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
