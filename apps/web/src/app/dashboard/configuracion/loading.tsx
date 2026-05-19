export default function ConfigLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-10 rounded-2xl bg-white/[0.04]" />
      <div className="space-y-3 pt-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  )
}
