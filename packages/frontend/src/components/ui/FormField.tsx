import Tooltip from '@/components/ui/Tooltip'

interface Props {
  label: string
  children: React.ReactNode
  hint?: string
  tooltip?: string
}

const labelClass = 'block text-xs font-medium text-muted mb-1'

export default function FormField({ label, children, hint, tooltip }: Props) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      {children}
      {hint && <p className="text-[11px] text-muted mt-1 mb-0">{hint}</p>}
    </div>
  )
}
