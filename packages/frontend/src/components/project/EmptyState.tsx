interface EmptyStateProps {
  onCreateClick: () => void
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-10 bg-slate-800 border border-slate-700 rounded-xl text-center">
      {/* Target icon */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-6 opacity-30"
      >
        <circle cx="32" cy="32" r="28" stroke="#60a5fa" strokeWidth="3" />
        <circle cx="32" cy="32" r="18" stroke="#60a5fa" strokeWidth="3" />
        <circle cx="32" cy="32" r="8" fill="#60a5fa" />
        <line x1="32" y1="4" x2="32" y2="14" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <line x1="32" y1="50" x2="32" y2="60" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <line x1="4" y1="32" x2="14" y2="32" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="32" x2="60" y2="32" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
      </svg>

      <h2 className="text-2xl font-bold text-slate-100 mb-3">No Projects Yet</h2>
      <p className="text-sm text-slate-400 mb-8 max-w-[400px] leading-relaxed">
        Create your first CCTV survey project to get started. Plan camera placements, define coverage
        zones, and generate reports.
      </p>

      <div className="flex gap-4">
        <button
          onClick={onCreateClick}
          className="h-10 px-5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
        >
          + Create Project
        </button>
        <a
          href="#"
          className="h-10 px-5 bg-transparent hover:bg-slate-700 text-sky-400 border border-sky-500/50 rounded-md text-sm font-semibold cursor-pointer no-underline flex items-center transition-colors"
        >
          View Documentation
        </a>
      </div>
    </div>
  )
}
