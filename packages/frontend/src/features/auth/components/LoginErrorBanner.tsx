import { AlertTriangle } from 'lucide-react'

interface LoginErrorBannerProps {
  message: string
}

export default function LoginErrorBanner({ message }: LoginErrorBannerProps) {
  return (
    <p className="flex items-center gap-2 rounded-md border border-error bg-error/10 px-4 py-3 text-sm font-medium text-error">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      {message}
    </p>
  )
}
