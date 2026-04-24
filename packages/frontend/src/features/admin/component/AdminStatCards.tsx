import StatCard from './StatCard'

interface AdminStatCardsProps {
  usersValue: number | string
  projectsValue: number | string
  camerasValue: number | string
  invitesValue: number | string
}

export default function AdminStatCards({
  usersValue,
  projectsValue,
  camerasValue,
  invitesValue,
}: AdminStatCardsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
      <StatCard label="Total Users" value={usersValue} icon="👥" />
      <StatCard label="Total Projects" value={projectsValue} icon="📁" />
      <StatCard label="Active Invites" value={invitesValue} icon="✉️" />
    </div>
  )
}
