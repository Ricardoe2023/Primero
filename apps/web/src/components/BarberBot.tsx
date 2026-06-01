'use client'

import { useState, useRef, useEffect } from 'react'

function GestaiIcon({ size = 36, color = '#3B82F6' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="2 1 24 24" fill="none" aria-hidden>
      <path d="M8 20 Q14 8 20 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"/>
      <path d="M4 22 Q14 2 24 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none" strokeOpacity="0.5"/>
      <circle cx="14" cy="22" r="2.2" fill={color} />
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
            className="p-[5px] rounded-[1.75rem] bg-white/[0.06] border border-white/[0.12] shadow-[0_24px_64px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-2xl flex flex-col overflow-hidden"
            style={{ height: 'min(600px, calc(100dvh - 120px))' }}
          >
            <div className="rounded-[calc(1.75rem-5px)] bg-[#0e0d0c] flex flex-col overflow-hidden h-full">

              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] shrink-0">
                <div className="relative shrink-0">
                  <GestaiIcon size={36} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0e0d0c]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-white leading-none">{AGENT_NAME}</p>
                  <p className="text-[11px] text-white/35 mt-0.5">Encuentra tu barbería o salón</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400/80 font-medium">En línea</span>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-6 h-6 rounded-full bg-white/[0.06] hover:bg-white/[0.12] flex items-center justify-center transition-colors duration-150"
                  >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 2l8 8M10 2l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col gap-2 ${msg.from === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-blue-600 text-[white] font-medium rounded-br-sm'
                          : 'bg-white/[0.07] border border-white/[0.08] text-white/85 rounded-bl-sm'
                      }`}
                    >
                      {renderText(msg.text)}
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex items-start">
                    <div className="bg-white/[0.07] border border-white/[0.08] rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/35 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(input) }}
                className="px-3 pb-3 pt-2.5 border-t border-white/[0.06] flex gap-2 shrink-0"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="¿Qué estás buscando?"
                  className="flex-1 bg-white/[0.05] border border-white/[0.09] rounded-xl px-3.5 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-blue-600/40 transition-colors duration-150"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-[white] flex items-center justify-center shrink-0 active:scale-95 transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
                  </svg>
                </button>
              </form>

              {/* Powered by */}
              <div className="text-center pb-2.5">
                <span className="text-[10px] text-white/15">Agente IA · powered by </span>
                <span className="text-[10px] text-blue-600/40 font-medium">gestai</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bubble hint */}
      {!open && (
        <div className="fixed bottom-8 right-20 z-50 pointer-events-none" style={{ animation: 'bot-float 3s ease-in-out infinite' }}>
          <div
            className="px-3.5 py-2 rounded-2xl rounded-br-sm text-[12px] font-medium text-white/70 whitespace-nowrap"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(12px)' }}
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_28px_rgba(251,191,36,0.3)]"
        style={{
          background: open ? '#1a1816' : 'linear-gradient(135deg, #3B82F6 0%, #d97706 100%)',
          border: open ? '1.5px solid rgba(255,255,255,0.10)' : 'none',
          transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1), background 250ms',
        }}
      >
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
        )}
        {open
          ? <svg width="18" height="18" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round"><path d="M2 2l8 8M10 2l-8 8" /></svg>
          : <GestaiIcon size={30} color="white" />
        }
      </button>
    </>
  )
}
