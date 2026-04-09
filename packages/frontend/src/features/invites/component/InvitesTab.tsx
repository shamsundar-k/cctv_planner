import type { AdminInvite } from '../api/invites.types'
import { formatDate, getExpiryPercent, getExpiryLabel } from './utils'

interface InvitesTabProps {
  invites: AdminInvite[]
  isLoading: boolean
  copiedId: string | null
  onCopyInvite: (url: string, id: string) => void
  onRevokeInvite: (id: string, email: string) => void
}

function expiryBarColor(pct: number): string {
  if (pct > 50) return '#10b981'
  if (pct > 20) return '#f59e0b'
  return '#ef4444'
}

export default function InvitesTab({
  invites,
  isLoading,
  onRevokeInvite,
}: InvitesTabProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl p-5 h-24 animate-pulse"
            style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
          />
        ))}
      </div>
    )
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 40%, transparent)' }}>
        <div className="text-[40px] mb-4">✉️</div>
        <p className="text-sm m-0">No active invites. Use the Overview tab to generate invite links.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {invites.map((invite) => {
        const pct = getExpiryPercent(invite.expires_at, invite.created_at)
        const color = expiryBarColor(pct)

        return (
          <div
            key={invite.id}
            className="rounded-xl p-5"
            style={{ background: 'color-mix(in srgb, var(--theme-bg-card) 80%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 25%, transparent)' }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-bold m-0 mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>{invite.email}</p>
                <p className="text-xs m-0" style={{ color: 'var(--theme-text-secondary)' }}>
                  Invited by <span style={{ color: 'var(--theme-text-primary)' }}>{invite.invited_by_email}</span>
                  {' · '}Generated {formatDate(invite.created_at)}
                  {' · '}Expires {formatDate(invite.expires_at)}
                </p>
              </div>
              <span
                className="text-xs font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap ml-3"
                style={{ color, background: `${color}22`, borderColor: `${color}44` }}
              >
                {getExpiryLabel(invite.expires_at)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 rounded-sm mb-3 overflow-hidden" style={{ background: 'color-mix(in srgb, var(--theme-surface) 15%, transparent)' }}>
              <div
                className="h-full rounded-sm transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onRevokeInvite(invite.id, invite.email)}
                className="px-3.5 py-1.5 text-[13px] bg-transparent border rounded-lg cursor-pointer transition-colors font-semibold"
                style={{ color: 'var(--theme-accent)', borderColor: 'color-mix(in srgb, var(--theme-accent) 30%, transparent)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'color-mix(in srgb, var(--theme-accent) 10%, transparent)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                Revoke
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
