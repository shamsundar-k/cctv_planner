/*
 * FILE SUMMARY — src/pages/DashboardPage.tsx
 *
 * Main project dashboard page rendered at /. Lists all accessible projects
 * with filtering, sorting, searching, and create/delete capabilities.
 * All logic lives in useDashboard; all UI components live under features/.
 */
import { useCallback } from 'react'
import type { Project } from '../api/projects.types'
import Navbar from '../features/navigation/component/Navbar'
import { useDashboard } from '../features/dashboard/hooks/useDashboard'
import DashboardErrorBanner from '../features/dashboard/components/DashboardErrorBanner'
import ProjectToolbar from '../features/dashboard/components/ProjectToolbar'
import ProjectList from '../features/dashboard/components/ProjectList'
import CreateProjectModal from '../features/projects/components/CreateProjectModal'
import DeleteProjectModal from '../features/projects/components/DeleteProjectModal'

export default function DashboardPage() {
  const { filtered, isLoading, isError, isFetching, refetch, dataUpdatedAt, modal, setModal, isAdmin, pageTitle } = useDashboard()

  const handleOpenCreate = useCallback(() => setModal({ type: 'create' }), [setModal])
  const handleCloseModal = useCallback(() => setModal({ type: 'none' }), [setModal])
  const handleDelete = useCallback(
    (project: Project) => setModal({ type: 'delete', project }),
    [setModal],
  )
  return (
    <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-10 py-10">
        <ProjectToolbar
          pageTitle={pageTitle}
          filteredCount={filtered.length}
          isAdmin={isAdmin}
          onCreateClick={handleOpenCreate}
          onRefresh={refetch}
          isFetching={isFetching}
          dataUpdatedAt={dataUpdatedAt}
        />

        {isError && (
          <DashboardErrorBanner onRetry={refetch} />
        )}

        <ProjectList
          projects={filtered}
          isLoading={isLoading}
          onDelete={handleDelete}
          onCreateClick={handleOpenCreate}
        />
      </main>

      {modal.type === 'create' && (
        <CreateProjectModal onClose={handleCloseModal} />
      )}
      {modal.type === 'delete' && (
        <DeleteProjectModal project={modal.project} onClose={handleCloseModal} />
      )}
    </div>
  )
}
