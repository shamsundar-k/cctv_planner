import { Link, Outlet } from 'react-router'
import { Info, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../store/authSlice'

function Forbidden() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center">
            <Info size={32} stroke="var(--theme-accent)" />
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
          <ChevronLeft size={16} />
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
