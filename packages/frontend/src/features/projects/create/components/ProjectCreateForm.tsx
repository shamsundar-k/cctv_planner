/*
 * FILE SUMMARY — src/features/projects/create/components/ProjectCreateForm.tsx
 *
 * Reusable form for creating a new CCTV survey project. Owns client-side
 * validation and the create-project mutation, while callers decide where to
 * navigate on cancel or successful creation.
 */
import { useEffect, useRef, useState } from "react";
import { useCreateProject } from "@/hooks/useProjects";
import { useToast } from "@/components/ui/Toast";
import type { ProjectRecord } from "@/types/projects.types";

interface ProjectCreateFormProps {
  onCancel: () => void;
  onCreated: (project: ProjectRecord) => void;
}

const inputCls = (invalid: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-primary bg-surface/10 placeholder-surface/50 outline-none transition-all ${
    invalid
      ? "border-red-500 ring-1 ring-red-500/30"
      : "border-surface/30 focus:border-primary/60 focus:ring-1 focus:ring-primary/20"
  }`;

export default function ProjectCreateForm({
  onCancel,
  onCreated,
}: ProjectCreateFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [zoom, setZoom] = useState("15");
  const [submitError, setSubmitError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: createProject, isPending } = useCreateProject();
  const showToast = useToast();

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const nameValid = name.trim().length >= 1 && name.trim().length <= 100;
  const descValid = description.length <= 500;
  const latNum = lat !== "" ? parseFloat(lat) : null;
  const lngNum = lng !== "" ? parseFloat(lng) : null;
  const zoomNum = zoom !== "" ? parseInt(zoom, 10) : 15;
  const latValid =
    lat === "" || (!isNaN(latNum!) && latNum! >= -90 && latNum! <= 90);
  const lngValid =
    lng === "" || (!isNaN(lngNum!) && lngNum! >= -180 && lngNum! <= 180);
  const zoomValid = !isNaN(zoomNum) && zoomNum >= 1 && zoomNum <= 22;
  const canSubmit =
    nameValid && descValid && latValid && lngValid && zoomValid && !isPending;

  const hasLocation = lat !== "" && lng !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError("");
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        center_lat: latNum,
        center_lng: lngNum,
        default_zoom: hasLocation ? zoomNum : null,
      });
      showToast("Project created successfully", "success");
      onCreated(project);
    } catch {
      setSubmitError("Failed to create project. Please try again.");
      showToast("Failed to create project", "error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card/90 border border-surface/30 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.35)] overflow-hidden"
    >
      <div className="px-6 py-6 flex flex-col gap-5">
        <div>
          <label
            htmlFor="create-name"
            className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5"
          >
            Project Name{" "}
            <span className="text-accent normal-case tracking-normal">*</span>
          </label>
          <input
            ref={nameRef}
            id="create-name"
            type="text"
            value={name}
            maxLength={100}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Parking Lot - Downtown"
            className={inputCls(name.length > 0 && !nameValid)}
          />
          <span className="text-xs text-muted/60 mt-1 block">
            1-100 characters (required)
          </span>
        </div>

        <div>
          <label
            htmlFor="create-desc"
            className="block text-xs font-bold text-muted uppercase tracking-widest mb-1.5"
          >
            Description{" "}
            <span className="text-surface/60 font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <textarea
            id="create-desc"
            value={description}
            maxLength={500}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the survey project..."
            rows={3}
            className="w-full px-3 py-2.5 border border-surface/30 focus:border-primary/60 focus:ring-1 focus:ring-primary/20 rounded-xl text-sm text-primary bg-surface/10 placeholder-surface/50 outline-none transition-all resize-y font-[inherit] leading-relaxed"
          />
          <span className="text-xs text-muted/60 mt-1 block">
            {description.length}/500 characters
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-widest mb-1">
            Base Map Location{" "}
            <span className="text-surface/60 font-normal normal-case tracking-normal">
              (optional)
            </span>
          </label>
          <span className="text-xs text-muted/60 block mb-2.5">
            Set the initial map view when this project is opened
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px] gap-2.5">
            <div>
              <label
                htmlFor="create-lat"
                className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1"
              >
                Latitude
              </label>
              <input
                id="create-lat"
                type="number"
                value={lat}
                step="any"
                min="-90"
                max="90"
                onChange={(e) => setLat(e.target.value)}
                placeholder="40.7128"
                className={inputCls(lat !== "" && !latValid)}
              />
            </div>
            <div>
              <label
                htmlFor="create-lng"
                className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1"
              >
                Longitude
              </label>
              <input
                id="create-lng"
                type="number"
                value={lng}
                step="any"
                min="-180"
                max="180"
                onChange={(e) => setLng(e.target.value)}
                placeholder="-74.0060"
                className={inputCls(lng !== "" && !lngValid)}
              />
            </div>
            <div>
              <label
                htmlFor="create-zoom"
                className="text-xs text-muted/70 font-bold uppercase tracking-wider block mb-1"
              >
                Zoom (1-22)
              </label>
              <input
                id="create-zoom"
                type="number"
                value={zoom}
                min="1"
                max="22"
                onChange={(e) => setZoom(e.target.value)}
                className={inputCls(!zoomValid)}
              />
            </div>
          </div>
        </div>

        {submitError && (
          <p className="text-sm text-red-300/80 m-0 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-2">
            {submitError}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 px-6 py-4 border-t border-surface/20 bg-surface/5">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 bg-surface/15 hover:bg-surface/30 text-primary/80 border border-surface/30 rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`h-9 px-5 border-none rounded-lg text-sm font-bold transition-all ${
            canSubmit
              ? "bg-accent hover:bg-accent-hover hover:text-card text-on-accent cursor-pointer shadow-md shadow-accent/20"
              : "bg-surface/20 text-surface/40 cursor-not-allowed"
          }`}
        >
          {isPending ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  );
}
