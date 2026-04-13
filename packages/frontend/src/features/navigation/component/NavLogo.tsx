export default function NavLogo() {
  return (
    <div className="flex items-center gap-2.5 shrink-0">
      <div
        className="p-1.5 rounded-lg bg-linear-to-br from-accent to-muted"
      >
        <svg
          width="18" height="18" viewBox="0 0 24 24"
          fill="none" xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="2" y="7" width="14" height="10" rx="2" className="fill-primary" />
          <path d="M16 10l5-3v10l-5-3V10z" className="fill-primary" />
          <circle cx="9" cy="12" r="2" className="fill-card" />
        </svg>
      </div>
      <span
        className="text-base font-extrabold whitespace-nowrap tracking-tight text-primary"
      >
        CCTV Planner
      </span>
    </div>
  )
}
