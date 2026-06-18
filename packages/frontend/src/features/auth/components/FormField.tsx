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
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest pl-1 text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 bg-surface/10 border border-surface/30 text-primary focus:border-primary/60 focus:bg-surface/20"
        placeholder={placeholder}
      />
    </div>
  )
}
