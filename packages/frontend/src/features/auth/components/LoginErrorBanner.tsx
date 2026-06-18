interface LoginErrorBannerProps {
  message: string
}

export default function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  return (
    <p className="text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
      {message}
    </p>
  )
}
