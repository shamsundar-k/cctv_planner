import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Navbar from '../components/layout/Navbar'
import { useAuthStore } from '../store/authSlice'
import { useAdminCameras, useDeleteCamera, type CameraModel } from '../api/cameras'
import { useToast } from '../components/ui/Toast'

function CameraTypeLabel({ type }: { type: CameraModel['camera_type'] }) {
  const map = { fixed_dome: 'Fixed Dome', ptz: 'PTZ', bullet: 'Bullet' }
  return <span>{map[type] ?? type}</span>
}

function LensTypeBadge({ type }: { type: CameraModel['lens_type'] }) {
  const map = { fixed: 'Fixed', varifocal: 'Varifocal', }
  return (
    <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-700 text-slate-300">
      {map[type] ?? type}
    </span>
  )
}

interface DeleteConfirmProps {
  camera: CameraModel
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}

function DeleteConfirmModal({ camera, onConfirm, onCancel, isDeleting }: DeleteConfirmProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-base font-semibold text-slate-100 m-0 mb-2">Delete Camera Model</h2>
        <p className="text-sm text-slate-400 mb-5">
          Are you sure you want to delete <span className="text-slate-200 font-medium">"{camera.name}"</span>? This
          cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-500 text-white rounded-lg border-none cursor-pointer transition-colors disabled:opacity-50"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminCamerasPage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const showToast = useToast()

  const { data: cameras = [], isLoading } = useAdminCameras()
  const deleteCamera = useDeleteCamera()

  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<CameraModel | null>(null)

  useEffect(() => {
    if (user && user.role !== 'admin') navigate('/', { replace: true })
  }, [user, navigate])

  if (!user || user.role !== 'admin') return null

  const filtered = cameras.filter((c) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      c.name.toLowerCase().includes(q) ||
      c.manufacturer.toLowerCase().includes(q) ||
      c.model_number.toLowerCase().includes(q)
    )
  })

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteCamera.mutateAsync(deleteTarget.id)
      showToast(`"${deleteTarget.name}" deleted`, 'success')
    } catch {
      showToast('Failed to delete camera model', 'error')
    } finally {
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="px-10 py-8">
        {/* Breadcrumb */}
        <Link
          to="/admin/manage"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4 no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Admin Dashboard
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-slate-100 m-0">Camera Models</h1>
            <p className="text-sm text-slate-500 mt-1.5 mb-0">
              Global camera hardware catalogue available to all users
            </p>
          </div>
          <Link
            to="/admin/manage/cameras/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg no-underline transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Add Camera Model
          </Link>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, manufacturer, model…"
            className="h-9 px-3 text-sm rounded-md bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors w-72"
          />
          <span className="text-sm text-slate-500">
            {isLoading ? '…' : `${filtered.length} model${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* Card grid */}
        {isLoading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-slate-800 rounded-xl border border-slate-700 p-5 animate-pulse">
                <div className="h-5 bg-slate-700 rounded w-3/5 mb-3" />
                <div className="h-3.5 bg-slate-700 rounded w-4/5 mb-2" />
                <div className="h-3.5 bg-slate-700 rounded w-2/5 mb-5" />
                <div className="h-8 bg-slate-700 rounded" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-600">
            {search ? 'No camera models match your search.' : 'No camera models yet. Add the first one.'}
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {filtered.map((camera) => (
              <div
                key={camera.id}
                className="bg-slate-800 border border-slate-700 rounded-xl p-5 flex flex-col gap-3 hover:border-slate-600 transition-colors"
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-100 m-0 truncate">{camera.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 m-0 truncate">
                      {[camera.manufacturer, camera.model_number].filter(Boolean).join(' · ') || '—'}
                    </p>
                  </div>
                  <LensTypeBadge type={camera.lens_type} />
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  <span className="text-slate-500">Type</span>
                  <span className="text-slate-300"><CameraTypeLabel type={camera.camera_type} /></span>

                  <span className="text-slate-500">Resolution</span>
                  <span className="text-slate-300">{camera.resolution_h}×{camera.resolution_v} ({camera.megapixels}MP)</span>

                  <span className="text-slate-500">H-FOV</span>
                  <span className="text-slate-300">
                    {camera.h_fov_min === camera.h_fov_max
                      ? `${camera.h_fov_min}°`
                      : `${camera.h_fov_min}°–${camera.h_fov_max}°`}
                  </span>

                  <span className="text-slate-500">Focal length</span>
                  <span className="text-slate-300">
                    {camera.focal_length_min === camera.focal_length_max
                      ? `${camera.focal_length_min} mm`
                      : `${camera.focal_length_min}–${camera.focal_length_max} mm`}
                  </span>

                  {camera.ir_range > 0 && (
                    <>
                      <span className="text-slate-500">IR range</span>
                      <span className="text-slate-300">{camera.ir_range} m</span>
                    </>
                  )}
                </div>

                {camera.notes && (
                  <p className="text-xs text-slate-500 italic m-0 line-clamp-2">{camera.notes}</p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-1">
                  <Link
                    to={`/admin/manage/cameras/${camera.id}`}
                    className="flex-1 text-center px-3 py-1.5 text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md no-underline transition-colors"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(camera)}
                    className="flex-1 px-3 py-1.5 text-xs font-medium bg-transparent text-red-500 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500 rounded-md cursor-pointer transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteConfirmModal
          camera={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteCamera.isPending}
        />
      )}
    </div>
  )
}
