import type { ProjectRecord } from "../../../types/projects.types";
import EmptyState from "./EmptyState";
import { ProjectCard } from "./ProjectCard";

const PROJECT_GRID_CLASS =
  "grid w-full gap-8 grid-cols-[repeat(auto-fill,minmax(320px,380px))]";
const SKELETON_CARD_COUNT = 6;

interface ProjectListProps {
  projects: ProjectRecord[];
  isLoading: boolean;
  onDelete: (project: ProjectRecord) => void;
  onCreateClick: () => void;
}

function SkeletonCard() {
  return (
    <div className="h-[220px] animate-pulse rounded-lg border border-panel-border bg-panel" />
  );
}

export default function ProjectList({
  projects,
  isLoading,
  onDelete,
  onCreateClick,
}: ProjectListProps) {
  if (isLoading) {
    return (
      <div className={PROJECT_GRID_CLASS}>
        {Array.from({ length: SKELETON_CARD_COUNT }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (projects.length === 0) {
    return <EmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <div className={PROJECT_GRID_CLASS}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
