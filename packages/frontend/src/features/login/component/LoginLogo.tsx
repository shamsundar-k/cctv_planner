export default function LoginLogo() {
  return (
    <div className="flex flex-col items-center gap-4 mb-10">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 bg-accent" />
        <div className="relative p-4 rounded-2xl shadow-xl ring-1 ring-white/10 bg-gradient-to-br from-accent to-muted/80">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="7" width="14" height="10" rx="2" className="fill-primary" />
            <path d="M16 10l5-3v10l-5-3V10z" className="fill-primary" />
            <circle cx="9" cy="12" r="2" className="fill-card" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
        <p className="text-sm font-medium mt-1.5 tracking-wide text-muted">Welcome back — sign in to continue</p>
      </div>
    </div>
  )
}
