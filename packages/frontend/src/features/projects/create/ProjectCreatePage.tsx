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
    <div className="min-h-screen bg-gradient-to-br from-canvas to-card/40">
      <Navbar />
      <main className="px-10 py-8 max-w-3xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-4 no-underline"
        >
          <ChevronLeft size={16} />
          Dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-primary m-0">
            Create New Project
          </h1>
          <p className="text-sm text-muted/70 mt-1 m-0">
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
