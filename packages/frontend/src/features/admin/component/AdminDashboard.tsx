import { useAdminData } from '../hooks/useAdminData'
import { useAdminActions } from '../hooks/useAdminActions'
import { useInvites } from '../../invites/hooks/useInvites'
import AdminHeader from './AdminHeader'
import AdminStatCards from './AdminStatCards'
import AdminTabNav from './AdminTabNav'
import OverviewTab from './OverviewTab'
import UsersTab from './UsersTab'
import ProjectsTab from './ProjectsTab'
import DeleteModal from './DeleteModal'
import InvitesTab from '../../invites/component/InvitesTab'

export default function AdminDashboard() {
  const data = useAdminData()
  const actions = useAdminActions()
  const invites = useInvites()

  return (
    <div
      className="min-h-screen px-10 py-8 font-sans"
      style={{ background: `linear-gradient(135deg, var(--theme-bg-base) 0%, color-mix(in srgb, var(--theme-bg-card) 40%, var(--theme-bg-base)) 100%)` }}
    >
      <AdminHeader />

      <AdminStatCards
        usersValue={data.usersLoading ? '—' : data.filteredUsers.length}
        projectsValue={data.allProjects.length}
        camerasValue={data.totalCameras}
        invitesValue={data.invitesLoading ? '—' : data.adminInvites.length}
      />

      <AdminTabNav
        activeTab={actions.activeTab}
        onTabChange={actions.setActiveTab}
        inviteCount={data.adminInvites.length}
      />

      {actions.activeTab === 'overview' && (
        <OverviewTab
          usersLoading={data.usersLoading}
          projectsLoading={data.projectsLoading}
          usersCount={data.filteredUsers.length}
          projectsCount={data.allProjects.length}
          totalCameraModels={data.totalCameraModels}
          activeInviteCount={data.adminInvites.length}
          generateInvitePending={invites.generateInvitePending}
          latestCreatedInvite={invites.latestCreatedInvite}
          copiedId={invites.copiedId}
          onGenerateInvite={invites.handleGenerateInvite}
          onCopyInvite={invites.handleCopyInvite}
        />
      )}

      {actions.activeTab === 'users' && (
        <UsersTab
          users={data.filteredUsers}
          usersLoading={data.usersLoading}
          userSearch={data.userSearch}
          onSearchChange={data.setUserSearch}
          onDeleteUser={(id, name) => actions.setDeleteModal({ open: true, type: 'user', id, name })}
        />
      )}

      {actions.activeTab === 'projects' && (
        <ProjectsTab
          projects={data.filteredProjects}
          projectsLoading={data.projectsLoading}
          projectSearch={data.projectSearch}
          onSearchChange={data.setProjectSearch}
          onDeleteProject={(id, name) => actions.setDeleteModal({ open: true, type: 'project', id, name })}
        />
      )}

      {actions.activeTab === 'invites' && (
        <InvitesTab
          invites={data.adminInvites}
          isLoading={data.invitesLoading}
          copiedId={invites.copiedId}
          onCopyInvite={invites.handleCopyInvite}
          onRevokeInvite={(id, email) => actions.setDeleteModal({ open: true, type: 'invite', id, name: email })}
        />
      )}

      {actions.deleteModal.open && (
        <DeleteModal
          modal={actions.deleteModal}
          onClose={() => actions.setDeleteModal({ open: false })}
          onConfirm={actions.handleConfirmDelete}
          isDeleting={actions.isDeleting}
        />
      )}
    </div>
  )
}
