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
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="text-sm font-semibold text-primary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-14 rounded-lg border border-border bg-card px-4 text-base text-primary outline-none transition-all duration-200 placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/15"
        placeholder={placeholder}
      />
    </div>
  )
}
