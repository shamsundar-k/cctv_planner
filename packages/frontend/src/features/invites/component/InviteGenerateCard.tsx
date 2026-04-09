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
    <div
      className="rounded-xl p-6"
      style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
    >
      <h2 className="text-base font-bold mt-0 mb-2" style={{ color: 'var(--theme-text-primary)' }}>Generate Invite Link</h2>
      <p className="text-[13px] mb-5" style={{ color: 'var(--theme-text-secondary)' }}>
        Send a 72-hour invite link to a new user's email address.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => { setInviteEmail(e.target.value); setInviteEmailError('') }}
            placeholder="user@example.com"
            className="w-full h-10 px-3 text-sm rounded-lg outline-none box-border"
            style={{
              background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)',
              border: `1px solid ${inviteEmailError ? '#ef4444' : 'color-mix(in srgb, var(--theme-surface) 30%, transparent)'}`,
              color: 'var(--theme-text-primary)',
            }}
          />
          {inviteEmailError && (
            <p className="text-xs text-red-400 mt-1 mb-0">{inviteEmailError}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={generateInvitePending}
          className="h-10 border-none rounded-lg text-sm font-bold cursor-pointer flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'var(--theme-accent)', color: 'var(--theme-accent-text)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' }}
        >
          {generateInvitePending ? <><Spinner /> Generating…</> : 'Generate Invite'}
        </button>
      </form>

      {latestCreatedInvite && (
        <div
          className="mt-4 p-4 rounded-xl"
          style={{ background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'var(--theme-text-secondary)' }}>
            Latest invite for{' '}
            <span style={{ color: 'var(--theme-text-primary)' }}>{latestCreatedInvite.email}</span>:
          </p>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs overflow-hidden text-ellipsis whitespace-nowrap font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
              {latestCreatedInvite.invite_url}
            </span>
            <button
              onClick={() => onCopyInvite(latestCreatedInvite.invite_url, latestCreatedInvite.id)}
              className="px-2.5 py-1 text-xs border-none rounded-lg cursor-pointer shrink-0 transition-all font-semibold"
              style={{
                background: copiedId === latestCreatedInvite.id ? 'color-mix(in srgb, var(--theme-accent-hover) 60%, transparent)' : 'color-mix(in srgb, var(--theme-surface) 25%, transparent)',
                color: 'var(--theme-text-primary)',
              }}
            >
              {copiedId === latestCreatedInvite.id ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] mt-2 mb-0 opacity-60" style={{ color: 'var(--theme-text-secondary)' }}>
            Copy this link now — it won't be shown again.
          </p>
        </div>
      )}
    </div>
  )
}
