import { type SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export default function SelectField({ className = '', children, ...props }: Props) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`h-10 w-full appearance-none rounded-lg border border-panel-border bg-background px-3 pr-8 text-sm text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-text-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
