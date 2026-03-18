import { useState } from 'react'
import { Link } from 'react-router'
import { useAdminCameras } from '../../api/cameras'
import {
  useSearchUsers,
  useSearchProjects,
  useAdminProjects,
  useAdminInvites,
  useGenerateInvite,
  useDeleteUser,
  useDeleteProject,
  useRevokeInvite,
} from '../../api/admin'
import { useToast } from '../ui/Toast'
import type { Tab, DeleteModalState } from './types'
import type { LatestInvite } from './OverviewTab'
import StatCard from './StatCard'
import OverviewTab from './OverviewTab'
import UsersTab from './UsersTab'
import ProjectsTab from './ProjectsTab'
import InvitesTab from './InvitesTab'
import DeleteModal from './DeleteModal'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'projects', label: 'Projects' },
  { id: 'invites', label: 'Active Invites' },
]

export default function AdminDashboard() {
  const showToast = useToast()

  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [userSearch, setUserSearch] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({ open: false })
  const [latestCreatedInvite, setLatestCreatedInvite] = useState<LatestInvite | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { data: filteredUsers = [], isLoading: usersLoading } = useSearchUsers(userSearch)
  const { data: filteredProjects = [], isLoading: projectsLoading } = useSearchProjects(projectSearch)
  const { data: allProjects = [] } = useAdminProjects()
  const { data: adminInvites = [], isLoading: invitesLoading } = useAdminInvites()
  const { data: cameraModels = [] } = useAdminCameras()

  const generateInvite = useGenerateInvite()
  const deleteUser = useDeleteUser()
  const deleteProject = useDeleteProject()
  const revokeInvite = useRevokeInvite()

  const totalCameras = allProjects.reduce((sum, p) => sum + p.camera_count, 0)

  async function handleGenerateInvite(email: string): Promise<void> {
    const result = await generateInvite.mutateAsync(email)
    setLatestCreatedInvite({ id: result.id, invite_url: result.invite_url, email })
    showToast(`Invite generated for ${email}`, 'success')
  }

  async function handleConfirmDelete() {
    if (!deleteModal.open) return
    try {
      if (deleteModal.type === 'user') {
        await deleteUser.mutateAsync(deleteModal.id)
        showToast(`User "${deleteModal.name}" deleted`, 'success')
      } else if (deleteModal.type === 'project') {
        await deleteProject.mutateAsync(deleteModal.id)
        showToast(`Project "${deleteModal.name}" deleted`, 'success')
      } else {
        await revokeInvite.mutateAsync(deleteModal.id)
        showToast(`Invite for "${deleteModal.name}" revoked`, 'success')
      }
      setDeleteModal({ open: false })
    } catch {
      showToast('Action failed. Please try again.', 'error')
    }
  }

  async function handleCopyInvite(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      showToast('Invite URL copied to clipboard', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      showToast('Failed to copy URL', 'error')
    }
  }

  const isDeleting =
    deleteUser.isPending || deleteProject.isPending || revokeInvite.isPending

  return (
    <div className="min-h-screen bg-slate-900 px-10 py-8 font-sans">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-3 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-[28px] font-bold text-slate-100 m-0">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-0">
          Manage users, projects, and invitations
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={usersLoading ? '—' : filteredUsers.length}
          color="#3b82f6"
          icon="👥"
        />
        <StatCard label="Total Projects" value={allProjects.length} color="#06b6d4" icon="📁" />
        <StatCard label="Cameras Placed" value={totalCameras} color="#a855f7" icon="📷" />
        <StatCard label="Active Invites" value={invitesLoading ? '—' : adminInvites.length} color="#10b981" icon="✉️" />
        <Link
          to="/admin/manage/cameras"
          className="no-underline"
        >
          <StatCard label="Camera Models" value={cameraModels.length} color="#f59e0b" icon="🎥" />
        </Link>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-slate-800 mb-7 overflow-x-auto">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-5 py-2.5 text-sm font-medium bg-transparent border-none cursor-pointer whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'text-sky-400 border-sky-400'
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {label}
            {id === 'invites' && adminInvites.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-[11px] font-semibold bg-emerald-500/20 text-emerald-400 rounded-full">
                {adminInvites.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {activeTab === 'overview' && (
        <OverviewTab
          usersLoading={usersLoading}
          projectsLoading={projectsLoading}
          usersCount={filteredUsers.length}
          projectsCount={allProjects.length}
          totalCameras={totalCameras}
          activeInviteCount={adminInvites.length}
          generateInvitePending={generateInvite.isPending}
          latestCreatedInvite={latestCreatedInvite}
          copiedId={copiedId}
          onGenerateInvite={handleGenerateInvite}
          onCopyInvite={handleCopyInvite}
        />
      )}

      {activeTab === 'users' && (
        <UsersTab
          users={filteredUsers}
          usersLoading={usersLoading}
          userSearch={userSearch}
          onSearchChange={setUserSearch}
          onDeleteUser={(id, name) => setDeleteModal({ open: true, type: 'user', id, name })}
        />
      )}

      {activeTab === 'projects' && (
        <ProjectsTab
          projects={filteredProjects}
          projectsLoading={projectsLoading}
          projectSearch={projectSearch}
          onSearchChange={setProjectSearch}
          onDeleteProject={(id, name) => setDeleteModal({ open: true, type: 'project', id, name })}
        />
      )}

      {activeTab === 'invites' && (
        <InvitesTab
          invites={adminInvites}
          isLoading={invitesLoading}
          copiedId={copiedId}
          onCopyInvite={handleCopyInvite}
          onRevokeInvite={(id, email) => setDeleteModal({ open: true, type: 'invite', id, name: email })}
        />
      )}

      {/* Delete / Revoke confirmation modal */}
      {deleteModal.open && (
        <DeleteModal
          modal={deleteModal}
          onClose={() => setDeleteModal({ open: false })}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
