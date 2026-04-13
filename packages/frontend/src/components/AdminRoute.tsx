import { Link, Outlet } from 'react-router'
import { useAuthStore } from '../store/authSlice'

function Forbidden() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="var(--theme-accent)" strokeWidth="1.5" />
              <path d="M12 7v6" stroke="var(--theme-accent)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.75" fill="var(--theme-accent)" />
            </svg>
          </div>
        </div>

        <p className="text-4xl font-bold text-primary mb-2">403</p>
        <p className="text-lg font-semibold text-primary mb-2">Access Denied</p>
        <p className="text-sm text-muted mb-8">
          You don't have permission to view this page. Admin access is required.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-on-accent text-sm font-medium hover:bg-accent-hover transition-colors no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function AdminRoute() {
  const user = useAuthStore((s) => s.user)

  if (!user || user.role !== 'admin') {
    return <Forbidden />
  }

  return <Outlet />
}
