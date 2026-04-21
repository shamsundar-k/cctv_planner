import { Link } from 'react-router'

export default function CameraListHeader() {
  return (
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
  )
}
