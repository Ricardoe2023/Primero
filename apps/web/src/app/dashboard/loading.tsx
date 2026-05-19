export default function DashboardLoading() {
  return (
    <div className="px-8 py-8 max-w-4xl animate-pulse">
      <div className="mb-8">
        <div className="h-3 w-24 rounded bg-white/[0.06] mb-2" />
        <div className="h-7 w-56 rounded bg-white/[0.08] mb-2" />
        <div className="h-3 w-40 rounded bg-white/[0.04]" />
      </div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-4">
            <div className="h-3 w-20 rounded bg-white/[0.05] mb-3" />
            <div className="h-7 w-24 rounded bg-white/[0.07]" />
          </div>
        ))}
      </div>
      <div className="space-y-4 mb-8">
        <div className="h-3 w-16 rounded bg-white/[0.05]" />
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 h-44 rounded-2xl bg-white/[0.03]" />
          <div className="col-span-2 h-44 rounded-2xl bg-white/[0.03]" />
        </div>
        <div className="h-44 rounded-2xl bg-white/[0.03]" />
      </div>
      <div className="h-4 w-12 rounded bg-white/[0.05] mb-3" />
      <div className="space-y-2">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  )
}
