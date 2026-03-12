import type { Project } from '../../api/projects'
import ProjectCard from './ProjectCard'
import EmptyState from './EmptyState'

interface ProjectListProps {
  projects: Project[]
  isLoading: boolean
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onCreateClick: () => void
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#f5f5f5',
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 24,
        height: 220,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  )
}

export default function ProjectList({
  projects,
  isLoading,
  onEdit,
  onDelete,
  onCreateClick,
}: ProjectListProps) {
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: 32,
    width: '100%',
  }

  if (isLoading) {
    return (
      <>
        <style>{`@keyframes pulse { 0%,100% { opacity:0.5 } 50% { opacity:1 } }`}</style>
        <div style={gridStyle}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </>
    )
  }

  if (projects.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />
  }

  return (
    <div style={gridStyle}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
