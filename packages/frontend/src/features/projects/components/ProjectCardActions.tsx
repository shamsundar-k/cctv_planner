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
        className="flex-1 h-[34px] border-none rounded-lg text-sm font-bold cursor-pointer transition-all shadow-md bg-accent text-on-accent hover:bg-accent-hover hover:text-canvas"
      >
        Go to Map
      </button>
      <button
        onClick={() => navigate(`/project/manage/${projectId}`)}
        className="flex-1 h-[34px] rounded-lg text-sm font-semibold cursor-pointer transition-colors bg-surface/15 text-primary/80 border border-surface/30 hover:bg-surface/30"
      >
        Manage
      </button>
    </div>
  )
}
