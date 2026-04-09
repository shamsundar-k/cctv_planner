interface ProjectCardDescriptionProps {
  description: string | null | undefined
}

export default function ProjectCardDescription({ description }: ProjectCardDescriptionProps) {
  return description ? (
    <p className="text-sm text-primary/60 m-0 leading-relaxed line-clamp-2 grow">
      {description}
    </p>
  ) : (
    <p className="text-sm text-surface/40 m-0 italic grow">No description</p>
  )
}
