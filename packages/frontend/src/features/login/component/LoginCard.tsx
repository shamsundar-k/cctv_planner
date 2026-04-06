interface LoginCardProps {
  children: React.ReactNode
}

export default function LoginCard({ children }: LoginCardProps) {
  return (
    <div className="backdrop-blur-2xl rounded-[2rem] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden bg-card/60 border border-surface/30">
      <div className="h-1.5 w-full bg-gradient-to-r from-accent via-muted to-surface" />
      <div className="p-10">{children}</div>
    </div>
  )
}
