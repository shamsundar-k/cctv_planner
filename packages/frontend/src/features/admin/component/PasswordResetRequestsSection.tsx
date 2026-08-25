import { useEffect, useState } from 'react'
import { KeyRound, RotateCcw, X } from 'lucide-react'
import { PrimaryButton, SecondaryButton } from '@/components/Buttons'
import type { AdminPasswordResetRequest } from '../api/admin.types'
import { usePasswordResetActions } from '../hooks/usePasswordResetActions'
import { formatDate } from './utils'

interface PasswordResetRequestsSectionProps {
  requests: AdminPasswordResetRequest[]
  isLoading: boolean
}

interface ResetConfirmDialogProps {
  request: AdminPasswordResetRequest
  isResetting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function ResetConfirmDialog({
  request,
  isResetting,
  onCancel,
  onConfirm,
}: ResetConfirmDialogProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isResetting) onCancel()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isResetting, onCancel])

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isResetting) onCancel()
      }}
    >
      <section
        className="w-full max-w-md rounded-xl border border-panel-border bg-panel p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-password-title"
        aria-describedby="reset-password-description"
      >
        <header className="flex items-start justify-between gap-4">
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <RotateCcw className="size-5" aria-hidden="true" />
          </span>
          <button
            type="button"
            onClick={onCancel}
            disabled={isResetting}
            aria-label="Close reset confirmation"
            className="grid size-9 cursor-pointer place-items-center rounded-md border-0 bg-transparent text-text-muted transition-colors hover:bg-primary/10 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </header>

        <h2 id="reset-password-title" className="mb-0 mt-5 text-xl font-semibold text-text-primary">
          Reset this password?
        </h2>
        <p id="reset-password-description" className="mb-0 mt-2 text-sm leading-6 text-text-muted">
          The password for <strong className="text-text-primary">{request.email}</strong> will be reset to{' '}
          <code className="rounded bg-background px-1.5 py-0.5 font-mono text-text-primary">login@123</code>.
          Existing sessions will be invalidated, and the user must choose a new password after signing in.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <SecondaryButton type="button" onClick={onCancel} disabled={isResetting}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" loading={isResetting} onClick={onConfirm}>
            {isResetting ? 'Resetting...' : 'Reset password'}
          </PrimaryButton>
        </div>
      </section>
    </div>
  )
}

export default function PasswordResetRequestsSection({
  requests,
  isLoading,
}: PasswordResetRequestsSectionProps) {
  const [resetTarget, setResetTarget] = useState<AdminPasswordResetRequest | null>(null)
  const actions = usePasswordResetActions()

  async function confirmReset() {
    if (!resetTarget) return
    const completed = await actions.handleReset(resetTarget)
    if (completed) setResetTarget(null)
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-panel-border bg-panel shadow-sm">
        <div className="flex items-center justify-between gap-4 border-b border-divider px-5 py-4 sm:px-6">
          <div>
            <h2 className="m-0 text-base font-semibold text-text-primary">Pending requests</h2>
            <p className="mb-0 mt-1 text-sm text-text-muted">Review requests before changing account credentials.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
            {isLoading ? '—' : requests.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="bg-background/60">
                <th className="border-b border-divider px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted sm:px-6">Account</th>
                <th className="border-b border-divider px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Requested</th>
                <th className="border-b border-divider px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-text-muted sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border-b border-divider px-5 py-5 sm:px-6"><span className="block h-4 w-48 animate-pulse rounded bg-divider" /></td>
                    <td className="border-b border-divider px-5 py-5"><span className="block h-4 w-28 animate-pulse rounded bg-divider" /></td>
                    <td className="border-b border-divider px-5 py-5 sm:px-6"><span className="ml-auto block h-8 w-36 animate-pulse rounded bg-divider" /></td>
                  </tr>
                ))
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-14 text-center">
                    <KeyRound className="mx-auto size-8 text-text-subtle" aria-hidden="true" />
                    <p className="mb-0 mt-3 text-sm font-semibold text-text-secondary">No pending password reset requests</p>
                    <p className="mb-0 mt-1 text-sm text-text-muted">New requests submitted from the login page will appear here.</p>
                  </td>
                </tr>
              ) : (
                requests.map((request) => {
                  const resetting = actions.resetPendingId === request.id
                  const rejecting = actions.rejectPendingId === request.id

                  return (
                    <tr key={request.id} className="transition-colors hover:bg-background/60">
                      <td className="border-b border-divider px-5 py-4 sm:px-6">
                        <span className="block text-sm font-semibold text-text-primary">{request.email}</span>
                        <span className="mt-1 block text-xs text-text-muted">User ID: {request.user_id}</span>
                      </td>
                      <td className="border-b border-divider px-5 py-4 text-sm text-text-muted">{formatDate(request.created_at)}</td>
                      <td className="border-b border-divider px-5 py-4 sm:px-6">
                        <div className="flex justify-end gap-2">
                          <SecondaryButton
                            type="button"
                            size="small"
                            tone="danger"
                            onClick={() => actions.handleReject(request)}
                            loading={rejecting}
                            disabled={actions.actionPending}
                          >
                            {rejecting ? 'Rejecting...' : 'Reject'}
                          </SecondaryButton>
                          <PrimaryButton
                            type="button"
                            size="small"
                            onClick={() => setResetTarget(request)}
                            disabled={actions.actionPending}
                          >
                            {resetting ? 'Resetting...' : 'Reset'}
                          </PrimaryButton>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {resetTarget && (
        <ResetConfirmDialog
          request={resetTarget}
          isResetting={actions.resetPendingId === resetTarget.id}
          onCancel={() => setResetTarget(null)}
          onConfirm={confirmReset}
        />
      )}
    </>
  )
}
