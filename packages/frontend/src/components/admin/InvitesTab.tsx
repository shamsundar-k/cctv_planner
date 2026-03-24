/*
 * FILE SUMMARY — src/components/admin/InvitesTab.tsx
 *
 * Invites tab panel in the admin dashboard. Displays all active invite links
 * with their expiry status and a revoke action.
 *
 * InvitesTab({ invites, isLoading, copiedId, onCopyInvite, onRevokeInvite })
 *   — Renders one of three states:
 *   - Loading: three pulsing skeleton cards.
 *   - Empty: a centred envelope icon with a hint to use the Overview tab.
 *   - List: for each invite, a card showing:
 *       • Recipient email and invited-by email.
 *       • Generated date and expiry date (formatted via formatDate).
 *       • A colour-coded time-remaining badge (green > 50 %, amber > 20 %,
 *         red ≤ 20 %) using getExpiryLabel / getExpiryPercent from utils.
 *       • A horizontal progress bar whose width and colour reflect the
 *         remaining lifetime percentage.
 *       • A "Revoke" button that calls `onRevokeInvite(id, email)` to open the
 *         confirmation modal in AdminDashboard.
 *
 * expiryBarColor(pct) — Internal helper; maps a percentage value to a CSS
 *   colour string (green / amber / red) used by the progress bar and badge.
 */
import type { AdminInvite } from '../../api/admin.types'
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
          <div key={i} className="bg-slate-800 rounded-xl p-5 border border-slate-700 h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-20 text-slate-600">
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
          <div key={invite.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm font-semibold text-slate-100 m-0 mb-0.5">{invite.email}</p>
                <p className="text-xs text-slate-500 m-0">
                  Invited by <span className="text-slate-400">{invite.invited_by_email}</span>
                  {' · '}Generated {formatDate(invite.created_at)}
                  {' · '}Expires {formatDate(invite.expires_at)}
                </p>
              </div>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border whitespace-nowrap ml-3"
                style={{ color, background: `${color}22`, borderColor: `${color}44` }}
              >
                {getExpiryLabel(invite.expires_at)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-slate-900 rounded-sm mb-3 overflow-hidden">
              <div
                className="h-full rounded-sm transition-[width] duration-1000 ease-linear"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => onRevokeInvite(invite.id, invite.email)}
                className="px-3.5 py-1.5 text-[13px] bg-transparent text-red-500 border border-red-500/20 rounded-md cursor-pointer transition-colors hover:bg-red-500/10 hover:border-red-500"
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
