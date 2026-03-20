import type { Project } from '../../api/projects'
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
