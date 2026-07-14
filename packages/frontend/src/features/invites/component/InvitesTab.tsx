import type { AdminInvite } from '../api/invites.types'
import InviteGenerateCard from './InviteGenerateCard'
import type { LatestInvite } from './InviteGenerateCard'
import { formatDate, getExpiryPercent, getExpiryLabel } from './utils'

interface InvitesTabProps {
  invites: AdminInvite[]
  isLoading: boolean
  generateInvitePending: boolean
  latestCreatedInvite: LatestInvite | null
  copiedId: string | null
  onGenerateInvite: (email: string) => Promise<void>
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
  generateInvitePending,
  latestCreatedInvite,
  copiedId,
  onGenerateInvite,
  onCopyInvite,
  onRevokeInvite,
}: InvitesTabProps) {
  return (
    <div className="flex flex-col gap-5">
      <InviteGenerateCard
        generateInvitePending={generateInvitePending}
        latestCreatedInvite={latestCreatedInvite}
        copiedId={copiedId}
        onGenerateInvite={onGenerateInvite}
        onCopyInvite={onCopyInvite}
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-panel-border bg-panel p-5" />
          ))}
        </div>
      ) : invites.length === 0 ? (
        <div className="py-16 text-center text-text-muted">
          <div className="text-[40px] mb-4">✉️</div>
          <p className="text-sm m-0">No active invites yet. Generate an invite link above to add one.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {invites.map((invite) => {
            const pct = getExpiryPercent(invite.expires_at, invite.created_at)
            const color = expiryBarColor(pct)

            return (
              <div key={invite.id} className="rounded-xl border border-panel-border bg-panel p-5 shadow-sm">
                <div className="mb-3 flex flex-col items-start justify-between gap-2 sm:flex-row">
                  <div>
                    <p className="m-0 mb-0.5 text-sm font-bold text-text-primary">{invite.email}</p>
                    <p className="m-0 text-xs text-text-muted">
                      Invited by <span className="text-text-primary">{invite.invited_by_email}</span>
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

                <div className="mb-3 h-1.5 overflow-hidden rounded-sm bg-divider">
                  <div
                    className="h-full rounded-sm transition-[width] duration-1000 ease-linear"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => onRevokeInvite(invite.id, invite.email)}
                    className="cursor-pointer rounded-lg border border-error/35 bg-error/10 px-3.5 py-1.5 text-[13px] font-semibold text-error transition-colors hover:bg-error/20"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
