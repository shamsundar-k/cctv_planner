/*
 * FILE SUMMARY — src/features/dashboard/components/ProjectList.tsx
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
import type { ProjectRecord } from '../../../types/projects.types'
import type { CSSProperties } from 'react'
import ProjectCard from '../../projects/components/ProjectCard'
import EmptyState from './EmptyState'

interface ProjectListProps {
  projects: ProjectRecord[]
  isLoading: boolean
  onDelete: (project: ProjectRecord) => void
  onCreateClick: () => void
}

function SkeletonCard() {
  return (
    <div className="h-[220px] animate-pulse rounded-lg border border-panel-border bg-panel" />
  )
}

export default function ProjectList({
  projects,
  isLoading,
  onDelete,
  onCreateClick,
}: ProjectListProps) {
  const gridCls = 'grid gap-8 w-full'
  const gridStyle: CSSProperties = {
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 380px))',
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
