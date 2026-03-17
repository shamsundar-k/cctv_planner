import { useState } from 'react'
import { useToast } from '../ui/Toast'
import Spinner from './Spinner'
import { formatDate } from './utils'

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
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-base font-semibold text-slate-100 mt-0 mb-5">System Summary</h2>
        <div className="flex flex-col">
          {summaryRows.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between py-2.5 border-b border-slate-700 last:border-0"
            >
              <span className="text-sm text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-100">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Invite */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-base font-semibold text-slate-100 mt-0 mb-2">Generate Invite Link</h2>
        <p className="text-[13px] text-slate-500 mb-5">
          Send a {/* TTL is configured server-side */}72-hour invite link to a new user's email address.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => { setInviteEmail(e.target.value); setInviteEmailError('') }}
              placeholder="user@example.com"
              className={`w-full h-10 px-3 text-sm bg-slate-900 rounded-lg text-slate-100 outline-none placeholder:text-slate-600 box-border border ${
                inviteEmailError ? 'border-red-500' : 'border-slate-700'
              }`}
            />
            {inviteEmailError && (
              <p className="text-xs text-red-500 mt-1 mb-0">{inviteEmailError}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={generateInvitePending}
            className="h-10 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-800 text-white border-none rounded-lg text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
          >
            {generateInvitePending ? <><Spinner /> Generating…</> : 'Generate Invite'}
          </button>
        </form>

        {latestCreatedInvite && (
          <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-xs text-slate-500 mb-2">
              Latest invite for{' '}
              <span className="text-slate-400">{latestCreatedInvite.email}</span>:
            </p>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-xs text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                {latestCreatedInvite.invite_url}
              </span>
              <button
                onClick={() => onCopyInvite(latestCreatedInvite.invite_url, latestCreatedInvite.id)}
                className={`px-2.5 py-1 text-xs text-white border-none rounded-md cursor-pointer shrink-0 transition-colors ${
                  copiedId === latestCreatedInvite.id
                    ? 'bg-emerald-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                {copiedId === latestCreatedInvite.id ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[11px] text-slate-600 mt-2 mb-0">
              Copy this link now — it won't be shown again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export type { LatestInvite }
