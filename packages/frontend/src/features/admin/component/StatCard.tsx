import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  description: string
  icon: ReactNode
  to: string
}

export default function StatCard({ label, value, description, icon, to }: StatCardProps) {
  return (
    <article className="group flex min-h-64 flex-col rounded-2xl border border-panel-border bg-panel p-6 shadow-sm transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-primary/45 hover:shadow-xl hover:shadow-primary/5">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          {icon}
        </div>
        <span className="text-3xl font-bold tabular-nums tracking-tight text-text-primary">
          {value}
        </span>
      </div>

      <h2 className="m-0 text-lg font-semibold text-text-primary">{label}</h2>
      <p className="mb-6 mt-2 text-sm leading-6 text-text-muted">{description}</p>

      <Link
        to={to}
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-primary no-underline transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        View details
        <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
      </Link>
    </article>
  )
}
