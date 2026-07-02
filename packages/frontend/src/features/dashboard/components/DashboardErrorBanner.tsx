interface DashboardErrorBannerProps {
  onRetry: () => void
}

export default function DashboardErrorBanner({ onRetry }: DashboardErrorBannerProps) {
  return (
    <p className="text-sm text-error mb-6 bg-error/10 border border-error/30 rounded-lg px-4 py-3">
      Failed to load projects.{' '}
      <button
        onClick={onRetry}
        className="text-primary hover:text-primary-hover cursor-pointer bg-transparent border-none text-sm p-0 font-semibold"
      >
        Retry
      </button>
    </p>
  )
}
