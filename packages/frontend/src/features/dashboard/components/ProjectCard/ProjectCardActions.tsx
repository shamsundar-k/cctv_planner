import { useNavigate } from 'react-router'

interface ProjectCardActionsProps {
  projectId: string
}

export default function ProjectCardActions({ projectId }: ProjectCardActionsProps) {
  const navigate = useNavigate()

  return (
    <div className="flex gap-2 pt-1">
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        className="flex-1 h-[34px] border-none rounded-lg text-sm font-bold cursor-pointer transition-colors shadow-md bg-primary text-primary-foreground hover:bg-primary-hover"
      >
        Go to Map
      </button>
      <button
        onClick={() => navigate(`/project/manage/${projectId}`)}
        className="flex-1 h-[34px] rounded-lg text-sm font-semibold cursor-pointer transition-colors bg-panel text-text-secondary border border-panel-border hover:bg-divider/60 hover:text-text-primary"
      >
        Manage
      </button>
    </div>
  )
}
