import { Info } from 'lucide-react'

export default function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group ml-1 inline-flex items-center">
      <Info size={14} className="cursor-help text-text-muted" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded border border-panel-border bg-panel px-2 py-1 text-[11px] text-text-primary opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  )
}
