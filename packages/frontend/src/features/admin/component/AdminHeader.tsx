import { Link } from 'react-router'

export default function AdminHeader() {
  return (
    <div className="mb-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm transition-colors mb-3 no-underline"
        style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Dashboard
      </Link>
      <h1 className="text-[28px] font-extrabold m-0 tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>Admin Dashboard</h1>
      <p className="text-sm mt-1.5 mb-0" style={{ color: 'var(--theme-text-secondary)' }}>
        Manage users, projects, and invitations
      </p>
    </div>
  )
}
