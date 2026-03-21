/*
 * FILE SUMMARY — src/components/admin/StatCard.tsx
 *
 * Simple metric display card used in the admin dashboard header row.
 *
 * StatCard({ label, value, color, icon }) — Renders a compact card with:
 *   - A text label (e.g. "Total Users") and a large bold numeric or string
 *     value displayed prominently.
 *   - A square icon badge in the top-right corner, tinted with a semi-
 *     transparent version of the `color` prop.
 *   - A border whose colour is also derived from the `color` prop at 20 %
 *     opacity, giving each card a distinct accent.
 *
 * Props:
 *   label  — Descriptive metric name shown above the value.
 *   value  — The metric value to display (number | string). Can be "—" while
 *            the data is loading.
 *   color  — Hex colour string used for the border and icon background tint.
 *   icon   — Emoji string rendered inside the icon badge.
 */
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
