import { Link } from 'react-router'
import { ChevronLeft } from 'lucide-react'

export default function AdminHeader() {
  return (
    <div className="mb-8">
      <Link
        to="/"
        className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Back to Dashboard
      </Link>
      <h1 className="m-0 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">Admin Dashboard</h1>
      <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-text-muted">
        A quick overview of your application. Open a section when you need to manage its details.
      </p>
    </div>
  )
}
