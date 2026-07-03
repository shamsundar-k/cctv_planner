/*
 * FILE SUMMARY — src/features/dashboard/DashboardPage.tsx
 *
 * Feature-owned dashboard screen rendered at /. Lists accessible projects with
 * filtering, sorting, searching, refresh, create, and delete capabilities.
 */
import { useCallback } from "react";
import { useNavigate } from "react-router";
import type { ProjectRecord } from "../../types/projects.types";
import Navbar from "../navigation/component/Navbar";
import { useDashboard } from "./hooks/useDashboard";
import DashboardErrorBanner from "./components/DashboardErrorBanner";
import Header from "./components/Header";
import ProjectList from "./components/ProjectList";
import DeleteProjectModal from "../projects/components/DeleteProjectModal";

export default function DashboardPage() {
  const navigate = useNavigate();
  const {
    filtered,
    isLoading,
    isError,
    isFetching,
    refetch,
    dataUpdatedAt,
    modal,
    setModal,
    pageTitle,
  } = useDashboard();

  const handleOpenCreate = useCallback(
    () => navigate("/projects/new"),
    [navigate],
  );
  const handleCloseModal = useCallback(
    () => setModal({ type: "none" }),
    [setModal],
  );
  const handleDelete = useCallback(
    (project: ProjectRecord) => setModal({ type: "delete", project }),
    [setModal],
  );

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navbar />

      <main className="mx-auto max-w-[1600px] px-6 py-8 sm:px-10 sm:py-10">
        <Header
          pageTitle={pageTitle}
          filteredCount={filtered.length}
          onCreateClick={handleOpenCreate}
          onRefresh={refetch}
          isFetching={isFetching}
          dataUpdatedAt={dataUpdatedAt}
        />

        {isError && <DashboardErrorBanner onRetry={refetch} />}

        <ProjectList
          projects={filtered}
          isLoading={isLoading}
          onDelete={handleDelete}
          onCreateClick={handleOpenCreate}
        />
      </main>

      {modal.type === "delete" && (
        <DeleteProjectModal
          project={modal.project}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
