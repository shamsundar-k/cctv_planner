import { type SelectHTMLAttributes } from 'react'

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

export default function SelectField({ className = '', children, ...props }: Props) {
  return (
    <div className="relative w-full">
      <select
        {...props}
        className={`w-full h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors appearance-none ${className}`}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-muted">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
