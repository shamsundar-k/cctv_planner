interface ProjectTitleProps {
  name: string
}

export function ProjectTitle({ name }: ProjectTitleProps) {
  return (
    <span
      className="text-sm font-medium truncate max-w-xs"
      style={{ color: 'color-mix(in srgb, var(--theme-text-primary) 85%, transparent)' }}
    >
      {name}
    </span>
  )
}
