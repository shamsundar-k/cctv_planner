export default function InputWithUnit({ unit, children }: { unit: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted pointer-events-none">
        {unit}
      </span>
    </div>
  )
}
