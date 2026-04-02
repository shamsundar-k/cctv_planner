/*
 * FILE SUMMARY — src/components/admin/OverviewTab.tsx
 *
 * Overview tab panel in the admin dashboard. Shows a system summary and an
 * invite generation form.
 *
 * OverviewTab(props) — Renders two side-by-side cards in a responsive grid:
 *   1. System Summary card: displays a table of key metrics (total users,
 *      total projects, total cameras, active invites) sourced from props.
 *      Shows "…" while the corresponding data is loading.
 *   2. Generate Invite Link card: provides an email input and a submit button.
 *      On successful invite generation, shows the new invite URL inline with a
 *      one-click copy button (which tracks copied state via `copiedId`).
 *
 * handleSubmit(e) — Validates the email input (non-empty, valid format), then
 *   calls the `onGenerateInvite` prop. Shows an error toast on failure and
 *   clears the input on success.
 *
 * Exports LatestInvite type (re-exported for use in AdminDashboard).
 */
import { useState } from 'react'
import { useToast } from '../ui/Toast'
import Spinner from './Spinner'

interface LatestInvite {
  id: string
  invite_url: string
  email: string
}

interface OverviewTabProps {
  usersLoading: boolean
  projectsLoading: boolean
  usersCount: number
  projectsCount: number
  totalCameras: number
  activeInviteCount: number
  generateInvitePending: boolean
  latestCreatedInvite: LatestInvite | null
  copiedId: string | null
  onGenerateInvite: (email: string) => Promise<void>
  onCopyInvite: (url: string, id: string) => void
}

export default function OverviewTab(props: OverviewTabProps) {
  const {
    usersLoading,
    projectsLoading,
    usersCount,
    projectsCount,
    totalCameras,
    activeInviteCount,
    generateInvitePending,
    latestCreatedInvite,
    copiedId,
    onGenerateInvite,
    onCopyInvite,
  } = props

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

  const summaryRows = [
    { label: 'Total Users', value: usersLoading ? '…' : usersCount },
    { label: 'Total Projects', value: projectsLoading ? '…' : projectsCount },
    { label: 'Total Cameras', value: totalCameras },
    { label: 'Active Invites', value: activeInviteCount },
  ]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6">
      {/* System Summary */}
      <div
        className="rounded-xl p-6"
        style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
      >
        <h2 className="text-base font-bold mt-0 mb-5" style={{ color: 'var(--theme-text-primary)' }}>System Summary</h2>
        <div className="flex flex-col">
          {summaryRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between py-3 border-b last:border-0"
              style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
            >
              <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{label}</span>
              <span className="text-sm font-bold" style={{ color: 'var(--theme-text-primary)' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Invite */}
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
    </div>
  )
}

export type { LatestInvite }

