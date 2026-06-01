import Link from 'next/link'
import ContactForm from '@/components/ContactForm'
import BarberBot from '@/components/BarberBot'
import NovuLogo from '@/components/NovuLogo'
import ClientsMarquee from '@/components/ClientsMarquee'
import HeroBg from '@/components/HeroBg'

// ─── Icon helpers ──────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="shrink-0 text-blue-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ArrowRight = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

export default function LandingPage() {
  return (
    <div className="bg-white text-[#0a0f1e]">

      {/* ── Navbar ──────────────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav className="flex items-center justify-between max-w-2xl mx-auto px-5 py-2.5 rounded-full bg-white border border-blue-950/[0.08] backdrop-blur-xl shadow-[0_4px_24px_rgba(37,99,235,0.08),0_1px_4px_rgba(0,0,0,0.04)]">
          <Link href="/" className="flex items-center gap-2.5">
            <NovuLogo height={22} wordmark />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/productos" className="px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] bg-blue-50 hover:bg-white/[0.10] border border-blue-950/[0.08] text-slate-500 hover:text-white rounded-full transition-colors">
              Marketplace
            </Link>
            <Link href="/login" className="px-3 sm:px-4 py-1.5 text-[12px] sm:text-[13px] bg-blue-50 hover:bg-white/[0.10] border border-blue-950/[0.08] text-slate-500 hover:text-white rounded-full transition-colors">
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>

      {/* ── 1. HERO ─────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <HeroBg />
        <section className="relative z-10 min-h-[100dvh] flex flex-col justify-center items-center text-center px-6 py-32 max-w-4xl mx-auto">

          <div className="animate-fade-up mb-8">
            <NovuLogo height={48} wordmark />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3.5 py-1 mb-6 animate-fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.12em] sm:tracking-[0.18em] font-medium text-blue-400/80 whitespace-nowrap">
              Agente operativo con IA · Gestión inteligente
            </span>
          </div>

          <h1 className="animate-fade-up delay-1 text-[clamp(2.2rem,6vw,4rem)] font-bold tracking-tight leading-[1.05] mb-5">
            El agente operativo con IA
            <br />
            <span className="text-blue-400">que trabaja por ti.</span>
          </h1>

          <p className="animate-fade-up delay-1 text-slate-500 text-[15px] sm:text-[17px] leading-relaxed mb-10 max-w-xl mx-auto">
            Gestai reemplaza la agenda manual, el WhatsApp caótico y las planillas de Excel — con un sistema inteligente que gestiona tu negocio mientras tú te dedicas a lo que sabes hacer.
          </p>

          <div className="animate-fade-up delay-2 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <Link
              href="#contacto"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-[14px] active:scale-[0.97] transition-all"
            >
              Solicitar demo gratuita
            </Link>
            <a
              href="#como-funciona"
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-blue-950/[0.12] hover:border-blue-500/40 rounded-full text-[14px] text-slate-500 hover:text-white transition-all"
            >
              Ver cómo funciona
            </a>
          </div>

          <div className="animate-fade-up delay-4 flex flex-wrap justify-center gap-8 mt-14 pt-10 border-t border-white/[0.06] w-full max-w-lg">
            {[
              { n: '24/7', label: 'Disponible siempre' },
              { n: '< 3s', label: 'Tiempo de respuesta' },
              { n: '+60%', label: 'Más reservas' },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-[1.6rem] font-bold text-blue-400 leading-none">{n}</p>
                <p className="text-[12px] text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Marquee ─────────────────────────────────────── */}
      <ClientsMarquee />

      {/* ── 2. PROBLEMA ──────────────────────────────────── */}
      <section className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">
          El problema
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-4">
          ¿Te suena familiar?
        </h2>
        <p className="text-slate-500 text-center text-[15px] max-w-lg mx-auto mb-14">
          La mayoría de los negocios de belleza están perdiendo tiempo y dinero sin darse cuenta.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            {
              icon: '💬',
              title: 'WhatsApp desordenado',
              desc: 'Confirmas citas por mensajes, pierdes solicitudes entre conversaciones y no tienes registro de nada.',
            },
            {
              icon: '📋',
              title: 'Agenda manual o en papel',
              desc: 'Dobles reservas, olvidos y sin visibilidad de quién trabaja qué día ni cuánto se está generando.',
            },
            {
              icon: '💸',
              title: 'Pagos dispersos',
              desc: 'Efectivo, transferencias, apps distintas — sin consolidar ni saber el ingreso real del día.',
            },
            {
              icon: '📉',
              title: 'Sin seguimiento de clientes',
              desc: 'No sabes quiénes no volvieron, cuándo fue su última visita ni cómo recuperarlos con una promo.',
            },
          ].map((p) => (
            <div key={p.title} className="p-[5px] rounded-2xl bg-slate-50 border border-blue-950/[0.07] hover:border-red-500/15 transition-colors">
              <div className="rounded-[calc(1rem-2px)] bg-[#f8faff] px-6 py-6 h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <span className="text-2xl mb-3 block">{p.icon}</span>
                <h3 className="text-[15px] font-semibold mb-1.5 text-slate-700">{p.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. SOLUCIÓN ──────────────────────────────────── */}
      <section id="como-funciona" className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">
          La solución
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-4">
          Todo tu negocio, en una sola plataforma
        </h2>
        <p className="text-slate-500 text-center text-[15px] max-w-lg mx-auto mb-14">
          Gestai centraliza cada parte de tu operación — sin código, sin técnicos, listo en minutos.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '📅', label: 'Agenda inteligente' },
            { icon: '👥', label: 'Gestión de staff' },
            { icon: '✂️', label: 'Servicios y precios' },
            { icon: '🧴', label: 'Catálogo de productos' },
            { icon: '💳', label: 'Control de pagos' },
            { icon: '⭐', label: 'Fidelización' },
            { icon: '🛍️', label: 'Marketplace propio' },
            { icon: '📊', label: 'Reportes en tiempo real' },
          ].map((f) => (
            <div key={f.label} className="p-[5px] rounded-2xl bg-slate-50 border border-blue-950/[0.07] hover:border-blue-500/20 transition-colors">
              <div className="rounded-[calc(1rem-2px)] bg-[#f8faff] px-4 py-5 h-full flex flex-col items-center justify-center text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <span className="text-2xl mb-2 block">{f.icon}</span>
                <p className="text-[12px] font-semibold text-slate-600 leading-snug">{f.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-[6px] rounded-[2rem] bg-blue-500/[0.07] border border-blue-500/20">
          <div className="rounded-[calc(2rem-6px)] bg-white px-8 py-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Regístrate en minutos', desc: 'Crea tu cuenta, configura tu negocio, agrega tu personal y servicios. Sin técnicos.' },
                { step: '02', title: 'Activa tu agente IA', desc: 'Tu asistente atiende consultas, agenda citas y vende — en tu web y tus canales.' },
                { step: '03', title: 'Controla desde tu panel', desc: 'Ve reportes, administra staff, ajusta precios y toma decisiones con datos reales.' },
              ].map((s) => (
                <div key={s.step} className="flex flex-col">
                  <span className="text-[11px] font-mono text-blue-400/40 font-bold mb-3">{s.step}</span>
                  <h3 className="text-[16px] font-bold mb-2">{s.title}</h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. AGENTE IA ─────────────────────────────────── */}
      <section className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">
          Inteligencia artificial
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-4">
          Pregúntale a Gestai como si fuera
          <br />
          <span className="text-blue-400">tu administrador digital.</span>
        </h2>
        <p className="text-slate-500 text-center text-[15px] max-w-lg mx-auto mb-14">
          Tu agente IA conoce cada detalle de tu negocio y actúa en tiempo real — sin que tengas que hacer nada.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {/* Chat demo mockup */}
          <div className="p-[6px] rounded-[2rem] bg-slate-50 border border-blue-500/15">
            <div className="rounded-[calc(2rem-6px)] bg-white px-6 py-6 h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <span className="text-[12px]">✨</span>
                </div>
                <span className="text-[13px] font-semibold text-blue-400">Gestai IA</span>
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-3">
                {[
                  { user: true, text: '¿Cuánto generé esta semana?' },
                  { user: false, text: 'Esta semana llevas $184.500. Tu barbero Ricardo aportó el 62%. Los martes son tus días más flojos — podrías activar una promo.' },
                  { user: true, text: 'Avísame quién no ha venido en 30 días' },
                  { user: false, text: 'Detecté 8 clientes inactivos. ¿Los contacto con una oferta de reactivación?' },
                ].map((msg, i) => (
                  <div key={i} className={`flex ${msg.user ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[12.5px] leading-relaxed ${
                      msg.user
                        ? 'bg-blue-500/15 border border-blue-500/20 text-blue-100'
                        : 'bg-blue-50 border border-blue-950/[0.08] text-slate-600'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            {[
              { icon: '📊', title: 'Consulta ventas e ingresos', desc: 'Pregunta por día, semana, barbero o servicio. El agente sabe todo.' },
              { icon: '📅', title: 'Ve la agenda en tiempo real', desc: '¿Quién tiene espacio hoy? ¿Cuántas citas quedan? Solo pregunta.' },
              { icon: '🎯', title: 'Crea promos automáticas', desc: 'Detecta días lentos y lanza descuentos para llenarlos.' },
              { icon: '🔔', title: 'Detecta clientes inactivos', desc: 'Recupera clientes que no han vuelto con campañas de reactivación.' },
            ].map((c) => (
              <div key={c.title} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-blue-950/[0.07] hover:border-blue-500/20 transition-colors">
                <span className="text-xl shrink-0">{c.icon}</span>
                <div>
                  <p className="text-[14px] font-semibold mb-0.5">{c.title}</p>
                  <p className="text-slate-500 text-[13px] leading-relaxed">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3.5 py-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/80">Demo en vivo disponible</span>
          </div>
          <p className="text-slate-400 text-[13px]">Prueba el agente real en el botón azul abajo a la derecha →</p>
        </div>
      </section>

      {/* ── 5. TIPOS DE NEGOCIO ──────────────────────────── */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">
          Para todo tipo de local
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-12">
          Hecho para tu industria
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '✂️', label: 'Barberías', desc: 'Cortes, fades y barba. Múltiples barberos, sus propios servicios.' },
            { icon: '💆', label: 'Centros de estética', desc: 'Masajes, faciales, depilación — con ficha de cliente y fidelización.' },
            { icon: '💅', label: 'Salones de uñas', desc: 'Nail art, gel, acrílico. Reservas por técnica y por especialista.' },
            { icon: '🖋️', label: 'Estudios de tatuajes', desc: 'Consultas, depósitos y agenda de sesiones largas con artistas.' },
          ].map((ind) => (
            <div key={ind.label} className="p-[5px] rounded-2xl bg-slate-50 border border-blue-950/[0.07] hover:border-blue-500/20 transition-colors group cursor-default">
              <div className="rounded-[calc(1rem-2px)] bg-[#f8faff] px-5 py-6 h-full flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <span className="text-3xl mb-3 block">{ind.icon}</span>
                <p className="text-[14px] font-semibold mb-1.5">{ind.label}</p>
                <p className="text-[12px] text-slate-400 leading-snug">{ind.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. BENEFICIOS ────────────────────────────────── */}
      <section className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">
          Por qué los negocios eligen Gestai
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-14">
          Resultados que se notan<br />desde el primer mes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              metric: '+60%',
              label: 'Más reservas',
              desc: 'Tu agente atiende las 24 horas. Los clientes reservan cuando quieren, sin esperar que contestes.',
              color: 'text-blue-400',
            },
            {
              metric: '−3h',
              label: 'Menos admin al día',
              desc: 'Sin confirmaciones manuales, sin WhatsApps a las 11pm, sin planillas desactualizadas.',
              color: 'text-emerald-400',
            },
            {
              metric: '×2',
              label: 'Retención de clientes',
              desc: 'Seguimiento automático, recordatorios de cita y promos para clientes inactivos.',
              color: 'text-blue-400',
            },
          ].map((b) => (
            <div key={b.label} className="p-[6px] rounded-[2rem] bg-slate-50 border border-blue-950/[0.08]">
              <div className="rounded-[calc(2rem-6px)] bg-[#f8faff] px-7 py-8 h-full flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                <p className={`text-[3rem] font-bold leading-none mb-1 ${b.color}`}>{b.metric}</p>
                <p className="text-[15px] font-semibold mb-3">{b.label}</p>
                <p className="text-slate-500 text-[13px] leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: '🎯', title: 'Control total del negocio', desc: 'Cuánto genera cada barbero, cuáles servicios son más rentables, cuándo llegan más clientes.' },
            { icon: '💰', title: 'Más ventas por cliente', desc: 'El agente sugiere productos y servicios complementarios al momento de reservar.' },
          ].map((b) => (
            <div key={b.title} className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-blue-950/[0.07]">
              <span className="text-2xl shrink-0">{b.icon}</span>
              <div>
                <p className="text-[14px] font-semibold mb-1">{b.title}</p>
                <p className="text-slate-500 text-[13px] leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. MARKETPLACE ──────────────────────────────── */}
      <section className="px-4 py-20 max-w-5xl mx-auto">
        <div className="p-[6px] rounded-[2rem] bg-slate-50 border border-blue-950/[0.08]">
          <div className="rounded-[calc(2rem-6px)] bg-white px-8 sm:px-12 py-12 shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex px-2.5 py-1 rounded-full bg-white/[0.05] border border-blue-950/[0.08] text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Marketplace</span>
                <h2 className="text-[1.8rem] sm:text-[2.2rem] font-bold tracking-tight mb-4 leading-snug">
                  Tu propio marketplace,<br />incluido en tu plan.
                </h2>
                <p className="text-slate-500 text-[14px] leading-relaxed mb-6">
                  Cada negocio en Gestai tiene su página pública con servicios, equipo, galería y botón de reserva. Además apareces en el marketplace general donde nuevos clientes te descubren.
                </p>
                <ul className="space-y-2.5">
                  {[
                    'Página pública con tu identidad de marca',
                    'Reserva directa sin intermediarios',
                    'Vitrina de productos y servicios',
                    'Agente IA embebido en tu página',
                  ].map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-slate-500">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/productos"
                  className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-slate-50 border border-blue-950/[0.08] hover:border-blue-500/20 transition-colors"
                >
                  <div>
                    <p className="text-[14px] font-semibold mb-0.5">Ver marketplace</p>
                    <p className="text-[12px] text-slate-400">Explora los negocios registrados</p>
                  </div>
                  <ArrowRight />
                </Link>
                <Link
                  href="#contacto"
                  className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-blue-400 mb-0.5">Publicar mi negocio</p>
                    <p className="text-[12px] text-blue-400/50">Comienza hoy, sin costo inicial</p>
                  </div>
                  <ArrowRight />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. EXPERIENCIA DEL CLIENTE ───────────────────── */}
      <section className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-slate-500 mb-3 text-center">
          Para tus clientes
        </p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-4">
          Una experiencia que fideliza
        </h2>
        <p className="text-slate-500 text-center text-[15px] max-w-lg mx-auto mb-14">
          Tus clientes también ganan — y eso hace que vuelvan siempre a ti.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: '📱', title: 'Reserva 100% online', desc: 'Agenda desde cualquier dispositivo, en cualquier momento.' },
            { icon: '💳', title: 'Pago integrado', desc: 'Pagan al reservar — sin efectivo, sin líos.' },
            { icon: '📋', title: 'Historial de citas', desc: 'Saben cuándo fue su última visita y qué se hicieron.' },
            { icon: '🎁', title: 'Promos y descuentos', desc: 'Reciben ofertas personalizadas por ser clientes frecuentes.' },
            { icon: '⭐', title: 'Programa de puntos', desc: 'Acumulan puntos y los canjean en su próxima visita.' },
            { icon: '🛍️', title: 'Compran productos', desc: 'Llevan los productos que usaron en el local a su casa.' },
          ].map((f) => (
            <div key={f.title} className="p-[5px] rounded-2xl bg-slate-50 border border-blue-950/[0.07] hover:border-white/[0.12] transition-colors">
              <div className="rounded-[calc(1rem-2px)] bg-[#f8faff] px-5 py-6 h-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                <span className="text-2xl mb-3 block">{f.icon}</span>
                <p className="text-[13px] font-semibold mb-1">{f.title}</p>
                <p className="text-[12px] text-slate-400 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9. PRICING ───────────────────────────────────── */}
      <section className="px-4 py-28 max-w-5xl mx-auto">
        <p className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/70 mb-3 text-center">Planes</p>
        <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight text-center mb-4">Simple y transparente</h2>
        <p className="text-slate-500 text-center text-[15px] mb-14">Sin costos ocultos. Cancela cuando quieras. Soporte real incluido.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              name: 'Starter',
              price: 'Gratis',
              sub: 'Para empezar',
              features: [
                'Agenda básica',
                '1 miembro de staff',
                'Página pública propia',
                'Agente IA en tu web',
                'Hasta 50 citas/mes',
              ],
              cta: 'Crear mi cuenta',
              href: '/register',
              highlight: false,
            },
            {
              name: 'Pro',
              price: 'Desde',
              sub: '$29.990 / mes',
              features: [
                'Staff ilimitado',
                'Citas ilimitadas',
                'Reportes avanzados',
                'Módulo de productos',
                'Fidelización y puntos',
                'Soporte prioritario',
              ],
              cta: 'Solicitar demo',
              href: '#contacto',
              highlight: true,
            },
            {
              name: 'Business',
              price: 'A medida',
              sub: 'para cadenas',
              features: [
                'Multi-sucursal',
                'Integración con tu POS',
                'Onboarding dedicado',
                'SLA garantizado',
                'API completa',
              ],
              cta: 'Hablar con ventas',
              href: '#contacto',
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`p-[6px] rounded-[2rem] ${plan.highlight ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-50 border border-blue-950/[0.08]'}`}
            >
              <div className="rounded-[calc(2rem-6px)] bg-[#f8faff] px-7 py-8 h-full flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                {plan.highlight && (
                  <span className="inline-flex w-fit px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/25 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-4">Más popular</span>
                )}
                <p className="text-[15px] font-semibold text-slate-500 mb-1">{plan.name}</p>
                <p className="text-[2rem] font-bold leading-none mb-0.5">{plan.price}</p>
                <p className="text-[12px] text-slate-400 mb-6">{plan.sub}</p>
                <ul className="space-y-2.5 flex-1 mb-7">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[13px] text-slate-500">
                      <CheckIcon />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full py-2.5 rounded-2xl text-[13px] font-semibold text-center transition-colors ${plan.highlight ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-50 hover:bg-white/[0.10] text-slate-600'}`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. FINAL CTA ────────────────────────────────── */}
      <section id="contacto" className="px-4 py-20 max-w-5xl mx-auto">
        <div className="p-[6px] rounded-[2rem] bg-blue-500/[0.08] border border-blue-500/25">
          <div className="rounded-[calc(2rem-6px)] bg-white px-8 sm:px-14 py-14 text-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/[0.07] px-3 py-1 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/80">Sin compromiso</span>
            </div>
            <h2 className="text-[2rem] sm:text-[2.6rem] font-bold tracking-tight mb-4 leading-snug">
              Convierte tu local en
              <br />
              <span className="text-blue-400">un negocio inteligente.</span>
            </h2>
            <p className="text-slate-500 text-[15px] max-w-md mx-auto mb-8">
              Agenda una demo gratuita de 20 minutos. Te mostramos cómo funciona con tu negocio real, sin ventas agresivas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full text-[14px] active:scale-[0.97] transition-all"
              >
                Solicitar demo gratuita
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 border border-blue-950/[0.12] hover:border-blue-500/30 rounded-full text-[14px] text-white/50 hover:text-white transition-all"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Contact form ─────────────────────────────────── */}
      <ContactForm />

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="pb-10 pt-4 flex flex-col items-center gap-2">
        <NovuLogo height={20} wordmark />
        <p className="text-slate-300 text-[12px]">© {new Date().getFullYear()} Gestai · El agente operativo con IA para negocios de belleza</p>
      </footer>

      {/* ── Agent demo ───────────────────────────────────── */}
      <BarberBot />
    </div>
  )
}
