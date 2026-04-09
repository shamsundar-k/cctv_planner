import { formatRelativeTime } from '../utils/projectCardFormat'

interface ProjectCardTimestampsProps {
  createdAt: string
  updatedAt: string
}

export default function ProjectCardTimestamps({ createdAt, updatedAt }: ProjectCardTimestampsProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted/60">Created: {formatRelativeTime(createdAt)}</span>
      <span className="text-xs text-muted/60">Modified: {formatRelativeTime(updatedAt)}</span>
    </div>
  )
}
