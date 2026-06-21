interface LoginCardProps {
  children: React.ReactNode
}

export default function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-[0_24px_64px_rgba(15,23,42,0.08)]">
      <div className="p-6 sm:p-8 lg:p-10 xl:p-12">{children}</div>
    </div>
  )
}
