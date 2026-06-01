'use client'

import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'

interface WeeklyPoint { semana: string; ventas: number; citas: number }
interface MonthlyPoint { mes: string; ventas: number; citas: number }
interface StaffPoint { nombre: string; ventas: number; citas: number }

interface Props {
  weekly: WeeklyPoint[]
  monthly: MonthlyPoint[]
  byStaff: StaffPoint[]
}

const AMBER = '#3B82F6'
const AMBER_DIM = '#3B82F640'

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2.5 rounded-xl bg-[#0f1e35]/90 border border-white/10 backdrop-blur-sm shadow-xl text-[12px]">
      <p className="text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.dataKey === 'ventas' ? fmt(p.value) : `${p.value} citas`}
        </p>
      ))}
    </div>
  )
}

export default function DashboardCharts({ weekly, monthly, byStaff }: Props) {
  return (
    <div className="space-y-4 mb-8">
      <h2 className="text-[11px] uppercase tracking-[0.18em] font-medium text-blue-400/60">Analítica</h2>

      {/* Top row: weekly + staff */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Tendencia semanal */}
        <div className="lg:col-span-3 bg-white/[0.025] border border-white/[0.07] rounded-2xl px-5 py-5">
          <p className="text-[12px] text-white/40 font-medium mb-4">Ventas por semana</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weekly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gw" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={AMBER} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="semana" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="ventas" stroke={AMBER} strokeWidth={2} fill="url(#gw)" dot={false} activeDot={{ r: 4, fill: AMBER, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Por barbero */}
        <div className="lg:col-span-2 bg-white/[0.025] border border-white/[0.07] rounded-2xl px-5 py-5">
          <p className="text-[12px] text-white/40 font-medium mb-4">Ventas por barbero</p>
          {byStaff.length === 0 ? (
            <p className="text-white/20 text-[12px] mt-6 text-center">Sin datos aún</p>
          ) : (
            <div className="space-y-3 mt-1">
              {byStaff.map((s, i) => {
                const max = Math.max(...byStaff.map(x => x.ventas), 1)
                const pct = (s.ventas / max) * 100
                return (
                  <div key={s.nombre}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-white/60 truncate max-w-[120px]">{s.nombre}</span>
                      <span className="text-[12px] font-semibold text-blue-400">{fmt(s.ventas)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(90deg, ${AMBER}99, ${AMBER})`,
                          boxShadow: `0 0 8px ${AMBER_DIM}`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-white/20 mt-0.5">{s.citas} citas</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white/[0.025] border border-white/[0.07] rounded-2xl px-5 py-5">
        <p className="text-[12px] text-white/40 font-medium mb-4">Ventas por mes</p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthly} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="ventas" radius={[4, 4, 0, 0]}>
              {monthly.map((entry, i) => {
                const isLast = i === monthly.length - 1
                return (
                  <Cell
                    key={i}
                    fill={isLast ? AMBER : `${AMBER}55`}
                    style={isLast ? { filter: `drop-shadow(0 0 6px ${AMBER_DIM})` } : {}}
                  />
                )
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
