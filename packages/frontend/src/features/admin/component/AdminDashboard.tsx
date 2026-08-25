import { ChevronLeft, FolderKanban } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import { useAdminData } from '../hooks/useAdminData'
import { useAdminActions } from '../hooks/useAdminActions'
import { useInvites } from '../../invites/hooks/useInvites'
import AdminHeader from './AdminHeader'
import AdminStatCards from './AdminStatCards'
import UsersTab from './UsersTab'
import DeleteModal from './DeleteModal'
import InvitesTab from '../../invites/component/InvitesTab'
import PasswordResetRequestsSection from './PasswordResetRequestsSection'

export default function AdminDashboard() {
  const { pathname } = useLocation()
  const data = useAdminData()
  const actions = useAdminActions()
  const invites = useInvites()

  const section = pathname.split('/').filter(Boolean).at(-1)

  const sectionHeader = (title: string, description: string) => (
    <header className="mb-8 border-b border-divider pb-6">
      <Link
        to="/admin/manage"
        className="mb-4 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-text-muted no-underline transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        Admin Dashboard
      </Link>
      <h1 className="m-0 text-2xl font-bold tracking-tight text-text-primary sm:text-[28px]">{title}</h1>
      <p className="mb-0 mt-1.5 text-sm text-text-muted">{description}</p>
    </header>
  )

  let content: React.ReactNode

  if (section === 'users') {
    content = (
      <>
        {sectionHeader('User Management', 'Review accounts, roles, and platform access.')}
        <UsersTab
          users={data.filteredUsers}
          usersLoading={data.usersLoading}
          userSearch={data.userSearch}
          onSearchChange={data.setUserSearch}
          onDeleteUser={(id, name) => actions.setDeleteModal({ open: true, type: 'user', id, name })}
        />
      </>
    )
  } else if (section === 'invites') {
    content = (
      <>
        {sectionHeader('Invitation Management', 'Invite new users and monitor active invitation links.')}
        <InvitesTab
          invites={data.adminInvites}
          isLoading={data.invitesLoading}
          generateInvitePending={invites.generateInvitePending}
          latestCreatedInvite={invites.latestCreatedInvite}
          copiedId={invites.copiedId}
          onGenerateInvite={invites.handleGenerateInvite}
          onCopyInvite={invites.handleCopyInvite}
          onRevokeInvite={(id, email) => actions.setDeleteModal({ open: true, type: 'invite', id, name: email })}
        />
      </>
    )
  } else if (section === 'projects') {
    content = (
      <>
        {sectionHeader('Project Overview', 'A focused view of project activity across the application.')}
        <section className="rounded-2xl border border-panel-border bg-panel p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-5">
            <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
              <FolderKanban size={23} aria-hidden="true" />
            </div>
            <div>
              <p className="m-0 text-sm font-medium text-text-muted">Total projects</p>
              <p className="mb-3 mt-1 text-4xl font-bold tabular-nums text-text-primary">
                {data.projectStatsLoading ? '—' : (data.projectStats?.total_projects ?? 0)}
              </p>
              <p className="m-0 max-w-xl text-sm leading-6 text-text-muted">
                Projects currently created by users across CCTV Planner.
              </p>
            </div>
          </div>
        </section>
      </>
    )
  } else if (section === 'password-resets') {
    content = (
      <>
        {sectionHeader(
          'Password Reset Requests',
          'Review user requests and either reset the account to its temporary password or reject the request.',
        )}
        <PasswordResetRequestsSection
          requests={data.passwordResetRequests}
          isLoading={data.passwordResetRequestsLoading}
        />
      </>
    )
  } else {
    content = (
      <>
        <AdminHeader />
        <AdminStatCards
          usersValue={data.usersLoading ? '—' : data.filteredUsers.length}
          projectsValue={data.projectStatsLoading ? '—' : (data.projectStats?.total_projects ?? 0)}
          camerasValue={data.totalCameraModels}
          invitesValue={data.invitesLoading ? '—' : data.adminInvites.length}
          passwordResetsValue={data.passwordResetRequestsLoading ? '—' : data.passwordResetRequests.length}
        />
      </>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 font-sans sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto w-full max-w-[1440px]">{content}</div>

      {actions.deleteModal.open && (
        <DeleteModal
          modal={actions.deleteModal}
          onClose={() => actions.setDeleteModal({ open: false })}
          onConfirm={actions.handleConfirmDelete}
          isDeleting={actions.isDeleting}
        />
      )}
    </main>
  )
}
