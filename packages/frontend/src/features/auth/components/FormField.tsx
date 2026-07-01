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
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-14 rounded-md border border-panel-border bg-panel px-4 text-base text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:border-panel-border disabled:bg-disabled disabled:text-disabled-foreground"
        placeholder={placeholder}
      />
    </div>
  )
}
