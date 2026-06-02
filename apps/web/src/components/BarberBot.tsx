'use client'

import { useState, useRef, useEffect } from 'react'

function GestaiIcon({ size = 36 }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 52 52" fill="none" aria-hidden>
      {/* sombra offset */}
      <rect x="18" y="18" width="28" height="28" rx="9" fill="#1D4ED8" fillOpacity="0.5"/>
      {/* forma principal */}
      <rect x="6"  y="6"  width="28" height="28" rx="9" fill="#3B82F6"/>
    </svg>
  )
}

const AGENT_NAME = 'Gestai'
const WELCOME_TEXT = '¡Hola! 👋 Soy **GestAI**.\nPuedo ayudarte a encontrar servicios, productos, agendar tu hora. ¿Qué estás buscando?'

interface Message {
  id: number
  from: 'bot' | 'user'
  text: string
}

type ApiMessage = { role: 'user' | 'assistant'; content: string }

const WELCOME: Message = { id: 0, from: 'bot', text: WELCOME_TEXT }

function renderText(text: string) {
  return text.split('\n').map((line, i, arr) => {
    const parts = line.split(/\*\*(.*?)\*\*/g)
    return (
      <span key={i}>
        {parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
        {i < arr.length - 1 && <br />}
      </span>
    )
  })
}

export default function BarberBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [history, setHistory] = useState<ApiMessage[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60)
    }
  }, [open, messages])

  async function sendMessage(text: string) {
    if (!text.trim()) return

    const userMsg: Message = { id: Date.now(), from: 'user', text }
    setMessages(m => [...m, userMsg])
    setInput('')
    setTyping(true)

    const newHistory: ApiMessage[] = [...history, { role: 'user', content: text }]
    setHistory(newHistory)

    const botMsgId = Date.now() + 1
    let fullText = ''

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      })

      if (!res.ok || !res.body) throw new Error('stream error')

      // Agregar mensaje vacío del bot y empezar a llenarlo
      setMessages(m => [...m, { id: botMsgId, from: 'bot', text: '' }])
      setTyping(false)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        fullText += decoder.decode(value, { stream: true })
        setMessages(m => m.map(msg => msg.id === botMsgId ? { ...msg, text: fullText } : msg))
      }

      setHistory(h => [...h, { role: 'assistant', content: fullText }])
      if (!open) setUnread(u => u + 1)
    } catch {
      setMessages(m => {
        const withoutEmpty = m.filter(msg => msg.id !== botMsgId)
        return [...withoutEmpty, { id: botMsgId, from: 'bot', text: 'Hubo un error de conexión. Por favor intenta de nuevo.' }]
      })
    } finally {
      setTyping(false)
    }
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] sm:w-[380px] flex flex-col"
          style={{ maxHeight: 'min(600px, calc(100dvh - 120px))' }}
        >
          <div
            className="rounded-3xl bg-white border border-blue-950/[0.08] shadow-[0_24px_64px_rgba(37,99,235,0.15),0_4px_16px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden"
            style={{ height: 'min(600px, calc(100dvh - 120px))' }}
          >
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-blue-950/[0.06] shrink-0 bg-white">
                <div className="relative shrink-0">
                  <GestaiIcon size={36} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0a0f1e] leading-none">{AGENT_NAME}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Asistente IA para profesionales</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-500 font-medium">En línea</span>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-150"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#0a0f1e" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth bg-[#f8faff]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-2 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-blue-600 text-white font-medium rounded-br-sm'
                          : 'bg-white border border-blue-950/[0.08] text-slate-700 rounded-bl-sm shadow-[0_1px_4px_rgba(0,0,0,0.05)]'
                      }`}
                    >
                      {renderText(msg.text)}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-start">
                    <div className="bg-white border border-blue-950/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                className="px-3 pb-3 pt-2.5 border-t border-blue-950/[0.06] flex gap-2 shrink-0 bg-white"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="flex-1 bg-slate-50 border border-blue-950/[0.08] rounded-xl px-3.5 py-2.5 text-[#0a0f1e] text-[13px] placeholder-slate-300 focus:outline-none focus:border-blue-400 transition-colors duration-150"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white flex items-center justify-center shrink-0 active:scale-95 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>

              {/* Powered by */}
              <div className="text-center pb-2.5 bg-white">
                <span className="text-[10px] text-slate-300">Agente IA · powered by </span>
                <span className="text-[10px] text-blue-400 font-medium">gestai</span>
              </div>
          </div>
        </div>
      )}

      {/* Bubble hint */}
      {!open && (
        <div className="fixed bottom-8 right-20 z-50 pointer-events-none" style={{ animation: 'bot-float 3s ease-in-out infinite' }}>
          <div
            className="px-3.5 py-2 rounded-2xl rounded-br-sm text-[12px] font-medium text-white/70 whitespace-nowrap"
            style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(37,99,235,0.12)', backdropFilter: 'blur(12px)', color: '#0a0f1e' }}
          >
            ✨ Tu asistente Gestai
          </div>
          <div className="absolute right-0 bottom-0 translate-x-1 translate-y-1" style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderTop: '6px solid rgba(255,255,255,0.09)' }} />
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Abrir agente GestAI"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{ background: 'none', border: 'none', padding: 0, filter: open ? 'none' : 'drop-shadow(0 4px 16px rgba(37,99,235,0.40))' }}
      >
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center z-10">{unread}</span>
        )}
        {open ? (
          <div className="w-12 h-12 rounded-2xl bg-white border border-blue-100 shadow-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 12 12" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
          </div>
        ) : (
          <GestaiIcon size={52} />
        )}
      </button>
    </>
  )
}
