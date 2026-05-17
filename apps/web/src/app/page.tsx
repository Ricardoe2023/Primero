import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-2xl font-bold tracking-tight">BarberHub</span>
        <div className="flex gap-3">
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/register"
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold rounded-full transition-colors"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-20 pb-32 text-center max-w-4xl mx-auto">
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight mb-6">
          Tu barbería,{' '}
          <span className="text-amber-400">a un clic</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Encuentra las mejores barberías de tu ciudad, agenda tu cita en segundos y lleva un
          historial visual de tus cortes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/marketplace"
            className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-full text-lg transition-colors"
          >
            Explorar barberías
          </Link>
          <Link
            href="/register?role=BARBERSHOP_OWNER"
            className="px-8 py-4 border border-slate-600 hover:border-slate-400 rounded-full text-lg transition-colors"
          >
            Soy barbero
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800 py-20 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              icon: '📍',
              title: 'Encuentra cerca tuyo',
              desc: 'Filtra barberías por ciudad, precio, disponibilidad y rating.',
            },
            {
              icon: '📅',
              title: 'Agenda sin llamadas',
              desc: 'Elige barbero, servicio, fecha y hora. Confirmación instantánea.',
            },
            {
              icon: '📸',
              title: 'Tu book de cortes',
              desc: 'Historial visual de cada corte con fotos, fecha y notas.',
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-700 rounded-2xl p-6">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        © {new Date().getFullYear()} BarberHub. Todos los derechos reservados.
      </footer>
    </div>
  )
}
