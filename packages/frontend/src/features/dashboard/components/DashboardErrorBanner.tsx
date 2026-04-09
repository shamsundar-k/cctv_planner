interface DashboardErrorBannerProps {
  onRetry: () => void
}

export default function DashboardErrorBanner({ onRetry }: DashboardErrorBannerProps) {
  return (
    <p className="text-sm text-red-300/80 mb-6 bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3">
      Failed to load projects.{' '}
      <button
        onClick={onRetry}
        className="text-primary hover:text-white cursor-pointer bg-transparent border-none text-sm p-0 font-semibold"
      >
        Retry
      </button>
    </p>
  )
}
