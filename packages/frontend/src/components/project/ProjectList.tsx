/*
 * FILE SUMMARY — src/components/project/ProjectList.tsx
 *
 * Responsive grid of project cards with loading skeleton and empty state.
 *
 * ProjectList({ projects, isLoading, onDelete, onCreateClick }) — Renders one
 *   of three states:
 *   - Loading: a grid of 6 <SkeletonCard> components (pulsing placeholder
 *     boxes) while the project data is being fetched.
 *   - Empty: the <EmptyState> component when the filtered project array has no
 *     entries. Passes `onCreateClick` so the empty state can offer a create
 *     button.
 *   - Populated: a CSS grid with `auto-fill` columns (min 450 px) containing
 *     one <ProjectCard> per project. Each card receives the project data and
 *     the `onDelete` callback.
 *
 * SkeletonCard() — Internal component that renders a fixed-height animated
 *   skeleton placeholder matching the approximate dimensions of a ProjectCard.
 */
import type { Project } from '../../api/projects.types'
import ProjectCard from './ProjectCard'
import EmptyState from './EmptyState'

interface ProjectListProps {
  projects: Project[]
  isLoading: boolean
  onDelete: (project: Project) => void
  onCreateClick: () => void
}

function SkeletonCard() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl h-[220px] animate-pulse" />
  )
}

export default function ProjectList({
  projects,
  isLoading,
  onDelete,
  onCreateClick,
}: ProjectListProps) {
  const gridCls = 'grid gap-8 w-full'
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
  }

  if (isLoading) {
    return (
      <div className={gridCls} style={gridStyle}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  return (
    <div className={gridCls} style={gridStyle}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
