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
  icon,
}: {
  label: string
  value: number | string
  icon: string
}) {
  return (
    <div
      className="rounded-xl px-6 py-5 flex flex-col gap-2 transition-all hover:-translate-y-0.5"
      style={{
        background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)',
        border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>{label}</span>
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: 'color-mix(in srgb, var(--theme-accent) 15%, transparent)' }}
        >
          {icon}
        </span>
      </div>
      <div className="text-[2rem] font-extrabold leading-none" style={{ color: 'var(--theme-text-primary)' }}>{value}</div>
    </div>
  )
}

