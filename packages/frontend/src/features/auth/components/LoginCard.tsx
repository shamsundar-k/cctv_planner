interface LoginCardProps {
  children: React.ReactNode
}

export default function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_64px_rgba(15,23,42,0.12)]">
      <div className="h-1 w-full bg-accent" />
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  )
}
