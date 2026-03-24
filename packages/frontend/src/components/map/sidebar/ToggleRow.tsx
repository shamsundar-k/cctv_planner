import type { ToggleRowProps } from './types'

export default function ToggleRow({ label, checked, onChange }: ToggleRowProps) {
  return (
    <label className="flex items-center justify-between gap-2 h-8 px-1 rounded cursor-pointer hover:bg-slate-700/40 group">
      <span className="text-xs text-slate-300 group-hover:text-slate-100 select-none">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full border-none cursor-pointer transition-colors shrink-0 ${
          checked ? 'bg-blue-500' : 'bg-slate-600'
        }`}
      >
        <span
          className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
        />
      </button>
    </label>
  )
}
