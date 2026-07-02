import { Link, useNavigate } from "react-router";
import { ChevronLeft } from "lucide-react";
import Navbar from "@/features/navigation/component/Navbar";
import ProjectCreateForm from "./components/ProjectCreateForm";
import type { ProjectRecord } from "@/types/projects.types";

export default function ProjectCreatePage() {
  const navigate = useNavigate();

  function handleCreated(project: ProjectRecord) {
    navigate(`/projects/${project.id}`);
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />
      <main className="w-full px-4 py-3 lg:px-8 lg:py-4 lg:h-[calc(100vh-4rem)] flex flex-col">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary
              transition-colors mb-2 no-underline"
            >
              <ChevronLeft size={16} />
              Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-primary m-0">
              Create New Project
            </h1>
          </div>
          <p className="text-sm text-text-secondary m-0 sm:text-right">
            Set up the project workspace and initial map view.
          </p>
        </div>

        <ProjectCreateForm
          onCancel={() => navigate("/")}
          onCreated={handleCreated}
        />
      </main>
    </div>
  );
}
