import StatCard from './StatCard'
import { Camera, FolderKanban, Mail, UsersRound } from 'lucide-react'

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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Users"
        value={usersValue}
        description="Review accounts, roles, and access across the platform."
        icon={<UsersRound size={23} aria-hidden="true" />}
        to="/admin/manage/users"
      />
      <StatCard
        label="Projects"
        value={projectsValue}
        description="See the current project inventory and planning activity."
        icon={<FolderKanban size={23} aria-hidden="true" />}
        to="/admin/manage/projects"
      />
      <StatCard
        label="Camera Models"
        value={camerasValue}
        description="Maintain the camera specification catalogue used in plans."
        icon={<Camera size={23} aria-hidden="true" />}
        to="/admin/manage/camera-models"
      />
      <StatCard
        label="Active Invites"
        value={invitesValue}
        description="Create, copy, and revoke invitations for new users."
        icon={<Mail size={23} aria-hidden="true" />}
        to="/admin/manage/invites"
      />
    </div>
  )
}
