/*
 * FILE SUMMARY — src/features/dashboard/components/EmptyState.tsx
 *
 * Illustrated empty-state panel shown when the user has no projects (or no
 * projects match the current filter/search).
 *
 * EmptyState({ onCreateClick }) — Renders a centred card containing:
 *   - A decorative SVG target/crosshair icon at reduced opacity.
 *   - A heading "No Projects Yet" and a descriptive paragraph explaining the
 *     purpose of the application.
 *   - A "+" Create Project button that calls the `onCreateClick` prop to open
 *     the CreateProjectModal in DashboardPage.
 *   - A "View Documentation" link (currently a placeholder "#" href).
 */
import { Target } from 'lucide-react'

interface EmptyStateProps {
  onCreateClick: () => void
}

export default function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-10 bg-card border border-border rounded-xl text-center">
      {/* Target icon */}
      <Target size={64} aria-hidden="true" className="mb-6 opacity-30 text-blue-400" />

      <h2 className="text-2xl font-bold text-primary mb-3">No Projects Yet</h2>
      <p className="text-sm text-muted mb-8 max-w-[400px] leading-relaxed">
        Create your first CCTV survey project to get started. Plan camera placements, define coverage
        zones, and generate reports.
      </p>

      <div className="flex gap-4">
        <button
          onClick={onCreateClick}
          className="h-10 px-5 bg-accent hover:bg-accent-hover text-on-accent border-none rounded-md text-sm font-semibold cursor-pointer transition-colors"
        >
          + Create Project
        </button>
        <a
          href="#"
          className="h-10 px-5 bg-transparent hover:bg-surface/20 text-accent border border-accent/50 rounded-md text-sm font-semibold cursor-pointer no-underline flex items-center transition-colors"
        >
          View Documentation
        </a>
      </div>
    </div>
  )
}
