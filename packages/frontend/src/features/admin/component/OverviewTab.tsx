import InviteGenerateCard from '../../invites/component/InviteGenerateCard'
import type { LatestInvite } from '../../invites/component/InviteGenerateCard'

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

      <InviteGenerateCard
        generateInvitePending={generateInvitePending}
        latestCreatedInvite={latestCreatedInvite}
        copiedId={copiedId}
        onGenerateInvite={onGenerateInvite}
        onCopyInvite={onCopyInvite}
      />
    </div>
  )
}
