import type { TabButtonProps } from './types'

export default function TabButton({ id, label, icon: Icon, active, collapsed, onClick }: TabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-2.5 h-9 px-2 rounded-md border-none cursor-pointer text-sm font-medium transition-colors whitespace-nowrap overflow-hidden ${
        active
          ? 'bg-slate-700 text-slate-100'
          : 'bg-transparent text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
      }`}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span>{label}</span>}
    </button>
  )
}
