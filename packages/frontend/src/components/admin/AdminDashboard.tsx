/*
 * FILE SUMMARY — src/components/admin/AdminDashboard.tsx
 *
 * Main admin panel container. Orchestrates all admin data fetching, mutations,
 * and sub-tab rendering.
 *
 * AdminDashboard() — Top-level admin component that:
 *   - Fetches users (useSearchUsers), projects (useSearchProjects,
 *     useAllProjects), invites (useAllInvites), and camera models
 *     (useAllCameras) to populate stats and tab content.
 *   - Renders a row of <StatCard>s showing total users, projects, cameras
 *     placed, active invites, and camera models.
 *   - Renders a tab navigation bar (Overview | Users | Projects | Active
 *     Invites) and displays the matching tab component.
 *   - Manages state for: active tab, per-tab search strings, delete modal
 *     state, the most recently generated invite, and clipboard copy tracking.
 *
 * handleGenerateInvite(email) — Calls the useGenerateInvite mutation, stores
 *   the resulting invite URL in latestCreatedInvite state, and shows a success
 *   toast.
 *
 * handleConfirmDelete() — Reads the open delete modal state and dispatches the
 *   correct mutation (deleteUser, deleteProject, or revokeInvite). Shows a
 *   success or error toast and closes the modal.
 *
 * handleCopyInvite(url, id) — Writes the invite URL to the clipboard, sets
 *   the copiedId state for 2 s to show a "Copied" confirmation, and shows a
 *   toast.
 */
import { useState } from 'react'
import { Link } from 'react-router'
import {
  useSearchUsers,
  useSearchProjects,
  useAllProjects,
  useAllInvites,
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
  const { data: allProjects = [] } = useAllProjects()
  const { data: adminInvites = [], isLoading: invitesLoading } = useAllInvites()


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
    <div
      className="min-h-screen px-10 py-8 font-sans"
      style={{ background: `linear-gradient(135deg, var(--theme-bg-base) 0%, color-mix(in srgb, var(--theme-bg-card) 40%, var(--theme-bg-base)) 100%)` }}
    >
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm transition-colors mb-3 no-underline"
          style={{ color: 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--theme-text-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-[28px] font-extrabold m-0 tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>Admin Dashboard</h1>
        <p className="text-sm mt-1.5 mb-0" style={{ color: 'var(--theme-text-secondary)' }}>
          Manage users, projects, and invitations
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 mb-8">
        <StatCard
          label="Total Users"
          value={usersLoading ? '—' : filteredUsers.length}
          icon="👥"
        />
        <StatCard label="Total Projects" value={allProjects.length} icon="📁" />
        <StatCard label="Cameras Placed" value={totalCameras} icon="📷" />
        <StatCard label="Active Invites" value={invitesLoading ? '—' : adminInvites.length} icon="✉️" />
      </div>

      {/* Tab nav */}
      <div
        className="flex mb-7 overflow-x-auto border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="px-5 py-2.5 text-sm font-semibold bg-transparent border-none cursor-pointer whitespace-nowrap transition-all border-b-2 -mb-px"
            style={{
              color: activeTab === id ? 'var(--theme-accent-text)' : 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)',
              borderBottomColor: activeTab === id ? 'var(--theme-accent)' : 'transparent',
            }}
            onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.color = 'var(--theme-text-primary)' }}
            onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.color = 'color-mix(in srgb, var(--theme-text-secondary) 70%, transparent)' }}
          >
            {label}
            {id === 'invites' && adminInvites.length > 0 && (
              <span
                className="ml-2 px-1.5 py-0.5 text-[11px] font-bold rounded-full"
                style={{ background: 'color-mix(in srgb, var(--theme-accent) 20%, transparent)', color: 'var(--theme-accent-text)' }}
              >
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

