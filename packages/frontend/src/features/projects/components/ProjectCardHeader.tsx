import type { ProjectRecord } from '../../../types/projects.types'
import ProjectCardMenu from './ProjectCardMenu'

interface ProjectCardHeaderProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
}

export default function ProjectCardHeader({ project, onDelete }: ProjectCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <h3
        className="text-lg font-bold text-text-primary m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1"
        title={project.name}
      >
        {project.name}
      </h3>
      <ProjectCardMenu project={project} onDelete={onDelete} />
    </div>
  )
}
