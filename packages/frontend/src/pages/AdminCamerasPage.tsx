import { Link } from 'react-router'
import Navbar from '../features/navigation/component/Navbar'
import { useAdminCameras } from '../features/admin-cameras/hooks/useAdminCameras'
import CameraListHeader from '../features/admin-cameras/component/CameraListHeader'
import CameraSearchBar from '../features/admin-cameras/component/CameraSearchBar'
import CameraGrid from '../features/admin-cameras/component/CameraGrid'
import DeleteConfirmModal from '../features/admin-cameras/component/DeleteConfirmModal'

export default function AdminCamerasPage() {
  const { isLoading, filtered, search, setSearch, deleteTarget, setDeleteTarget, handleDelete, isDeleting } =
    useAdminCameras()

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="px-10 py-8">
        <Link
          to="/admin/manage"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Admin Dashboard
        </Link>

        <CameraListHeader />
        <CameraSearchBar search={search} onSearch={setSearch} count={filtered.length} isLoading={isLoading} />
        <CameraGrid cameras={filtered} isLoading={isLoading} search={search} onDelete={setDeleteTarget} />
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          camera={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
