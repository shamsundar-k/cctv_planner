import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CheckCircle2, KeyRound, X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '@/components/Buttons'
import { requestPasswordReset } from '../api/passwordReset'
import LoginErrorBanner from './LoginErrorBanner'

interface ForgotPasswordDialogProps {
  initialEmail: string
  onClose: () => void
}

export default function ForgotPasswordDialog({
  initialEmail,
  onClose,
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState(initialEmail)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !submitting) onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, submitting])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const message = await requestPasswordReset(email)
      setSuccessMessage(message)
    } catch {
      setError('Unable to send the request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) onClose()
      }}
    >
      <section
        className="w-full max-w-md rounded-lg border border-panel-border bg-panel p-6 shadow-2xl sm:p-7"
        role="dialog"
        aria-modal="true"
        aria-labelledby="forgot-password-title"
        aria-describedby="forgot-password-description"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2 id="forgot-password-title" className="m-0 text-xl font-semibold text-text-primary">
                Request password reset
              </h2>
              <p id="forgot-password-description" className="mb-0 mt-1 text-sm leading-5 text-text-muted">
                Send a request for an administrator to reset your password.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close password reset request"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        {successMessage ? (
          <div className="mt-6" aria-live="polite">
            <div className="flex gap-3 rounded-md border border-primary/40 bg-primary/10 p-4 text-text-primary">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="m-0 text-sm font-semibold">Request received</p>
                <p className="mb-0 mt-1 text-sm leading-6 text-text-secondary">{successMessage}</p>
              </div>
            </div>
            <PrimaryButton type="button" fullWidth className="mt-5" onClick={onClose}>
              Done
            </PrimaryButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="reset-email" className="text-sm font-semibold text-text-primary">
                Email Address
              </label>
              <input
                ref={inputRef}
                id="reset-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="min-h-12 rounded-md border border-panel-border bg-background px-4 text-base text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <p className="m-0 text-sm leading-6 text-text-muted">
              If your account exists, the request will appear in Admin App Management for review.
            </p>

            {error && <LoginErrorBanner message={error} />}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <SecondaryButton type="button" onClick={onClose} disabled={submitting}>
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit" loading={submitting}>
                {submitting ? 'Sending...' : 'Send request'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
