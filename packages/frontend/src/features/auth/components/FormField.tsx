interface FormFieldProps {
  id: string
  label: string
  type: string
  autoComplete: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}

export default function FormField({ id, label, type, autoComplete, value, onChange, placeholder }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-surface/40 px-4 py-3.5 text-sm text-primary outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-accent focus:bg-card focus:ring-2 focus:ring-accent/15"
        placeholder={placeholder}
      />
    </div>
  )
}
