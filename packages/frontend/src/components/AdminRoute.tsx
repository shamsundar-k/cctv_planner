import { ChevronLeft, Info } from 'lucide-react'
import { Link, Outlet } from 'react-router'
import { useAuthStore } from '../features/auth'

function Forbidden() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-panel-border bg-panel p-10 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full border border-panel-border bg-background text-primary">
            <Info size={32} aria-hidden />
          </div>
        </div>

        <p className="mb-2 text-4xl font-bold text-text-primary">403</p>
        <p className="mb-2 text-lg font-semibold text-text-primary">Access Denied</p>
        <p className="mb-8 text-sm text-text-muted">You don't have permission to view this page. Admin access is required.</p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground no-underline transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ChevronLeft size={16} aria-hidden />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user)
  return !user || user.role !== 'admin' ? <Forbidden /> : <Outlet />
}
