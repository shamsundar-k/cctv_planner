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
    <section className="overflow-hidden rounded-xl border border-panel-border bg-panel shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between border-b border-panel-border bg-divider/60 px-5 py-3 text-left transition-colors hover:bg-divider focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary" aria-expanded={open}
      >
        <h2 className="text-[11px] font-semibold text-text-muted uppercase tracking-widest m-0">{title}</h2>
        <ChevronDown size={16} className={`text-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </section>
  )
}
