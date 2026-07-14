import { useState } from 'react'
import { useToast } from '../../../components/ui/Toast'
import Spinner from '../../admin/component/Spinner'

export interface LatestInvite {
  id: string
  invite_url: string
  email: string
}

interface InviteGenerateCardProps {
  generateInvitePending: boolean
  latestCreatedInvite: LatestInvite | null
  copiedId: string | null
  onGenerateInvite: (email: string) => Promise<void>
  onCopyInvite: (url: string, id: string) => void
}

export default function InviteGenerateCard({
  generateInvitePending,
  latestCreatedInvite,
  copiedId,
  onGenerateInvite,
  onCopyInvite,
}: InviteGenerateCardProps) {
  const showToast = useToast()
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteEmailError, setInviteEmailError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const email = inviteEmail.trim()
    if (!email) {
      setInviteEmailError('Email is required')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteEmailError('Please enter a valid email address')
      return
    }
    setInviteEmailError('')
    try {
      await onGenerateInvite(email)
      setInviteEmail('')
    } catch {
      showToast('Failed to generate invite. Please try again.', 'error')
    }
  }

  return (
    <div className="rounded-xl border border-panel-border bg-panel p-6 shadow-sm">
      <h2 className="mb-2 mt-0 text-base font-bold text-text-primary">Generate Invite Link</h2>
      <p className="mb-5 text-[13px] text-text-muted">
        Send a 72-hour invite link to a new user's email address.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => { setInviteEmail(e.target.value); setInviteEmailError('') }}
            placeholder="user@example.com"
            className={`box-border h-10 w-full rounded-lg border bg-background px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-subtle focus:ring-2 ${inviteEmailError ? 'border-error focus:border-error focus:ring-error/20' : 'border-panel-border hover:border-primary/50 focus:border-primary focus:ring-primary/20'}`}
          />
          {inviteEmailError && (
            <p className="mb-0 mt-1 text-xs text-error">{inviteEmailError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={generateInvitePending}
          className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
        >
          {generateInvitePending ? <><Spinner /> Generating…</> : 'Generate Invite'}
        </button>
      </form>

      {latestCreatedInvite && (
        <div className="mt-4 rounded-xl border border-panel-border bg-background p-4">
          <p className="mb-2 text-xs text-text-muted">
            Latest invite for{' '}
            <span className="text-text-primary">{latestCreatedInvite.email}</span>:
          </p>
          <div className="flex items-center gap-2">
            <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-text-muted">
              {latestCreatedInvite.invite_url}
            </span>
            <button
              onClick={() => onCopyInvite(latestCreatedInvite.invite_url, latestCreatedInvite.id)}
              className={`shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${copiedId === latestCreatedInvite.id ? 'border-success/30 bg-success/15 text-success' : 'border-panel-border bg-divider text-text-primary hover:border-primary/40'}`}
            >
              {copiedId === latestCreatedInvite.id ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="mb-0 mt-2 text-[11px] text-text-muted">
            Copy this link now — it won't be shown again.
          </p>
        </div>
      )}
    </div>
  )
}
