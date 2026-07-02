import { formatRelativeTime } from '../utils/projectCardFormat'

interface ProjectCardTimestampsProps {
  createdAt: string
  updatedAt: string
}

export default function ProjectCardTimestamps({ createdAt, updatedAt }: ProjectCardTimestampsProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-text-subtle">Created: {formatRelativeTime(createdAt)}</span>
      <span className="text-xs text-text-subtle">Modified: {formatRelativeTime(updatedAt)}</span>
    </div>
  )
}
