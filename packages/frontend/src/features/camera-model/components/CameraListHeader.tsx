import { Link } from 'react-router'
import { Plus } from 'lucide-react'

export default function CameraListHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-[28px] font-bold text-slate-100 m-0">Camera Models</h1>
        <p className="text-sm text-slate-500 mt-1.5 mb-0">
          Camera  catalogue
        </p>
      </div>
      <Link
        to="/admin/manage/cameras/new"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg no-underline transition-colors"
      >
        <Plus size={16} />
        Add Camera Model
      </Link>
    </div>
  )
}
