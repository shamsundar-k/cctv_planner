import { memo } from 'react'
import type { ProjectRecord } from '../../../types/projects.types'
import ProjectCardHeader from './ProjectCardHeader'
import ProjectCardMeta from './ProjectCardMeta'
import ProjectCardDescription from './ProjectCardDescription'
import ProjectCardTimestamps from './ProjectCardTimestamps'
import ProjectCardActions from './ProjectCardActions'

interface ProjectCardProps {
  project: ProjectRecord
  onDelete: (project: ProjectRecord) => void
}

function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="rounded-lg p-6 flex flex-col gap-2.5 shadow-md hover:shadow-[0_8px_32px_rgba(15,23,42,0.18)] hover:-translate-y-1 transition-all duration-200 cursor-default bg-panel border border-panel-border">
      <ProjectCardHeader project={project} onDelete={onDelete} />

      <ProjectCardMeta
        cameraCount={project.camera_count}
        centerLat={project.center_lat}
        centerLng={project.center_lng}
      />
      <ProjectCardDescription description={project.description} />
      <ProjectCardTimestamps createdAt={project.created_at} updatedAt={project.updated_at} />

      <ProjectCardActions projectId={project.id} />
    </div>
  )
}

export default memo(ProjectCard)
