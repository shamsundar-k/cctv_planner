export default function StatCard({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: number | string
  color: string
  icon: string
}) {
  return (
    <div
      className="bg-slate-800 rounded-xl px-6 py-5 flex flex-col gap-2"
      style={{ border: `1px solid ${color}33` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span
          className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
          style={{ background: `${color}22` }}
        >
          {icon}
        </span>
      </div>
      <div className="text-[2rem] font-bold text-slate-100 leading-none">{value}</div>
    </div>
  )
}
