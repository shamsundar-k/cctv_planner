import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

export default function CollapsibleSection({ title, children, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3 bg-surface hover:bg-border/30 transition-colors border-b border-border"
      >
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-widest m-0">{title}</h2>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </section>
  )
}
