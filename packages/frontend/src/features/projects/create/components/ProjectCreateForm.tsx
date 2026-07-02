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
import ProjectLocationPicker from "@/features/projects/components/ProjectLocationPicker";
import type { ProjectRecord } from "@/types/projects.types";

interface ProjectCreateFormProps {
  onCancel: () => void;
  onCreated: (project: ProjectRecord) => void;
}

const inputCls = (invalid: boolean) =>
  `w-full px-3 py-2.5 border rounded-xl text-sm text-text-primary bg-background placeholder:text-text-subtle outline-none transition-all ${
    invalid
      ? "border-red-500 ring-1 ring-red-500/30"
      : "border-panel-border focus:border-primary focus:ring-1 focus:ring-primary/20"
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
  const latNum = lat !== "" ? Number(lat) : null;
  const lngNum = lng !== "" ? Number(lng) : null;
  const zoomNum = zoom !== "" ? parseInt(zoom, 10) : 15;
  const latValid =
    latNum == null ||
    (Number.isFinite(latNum) && latNum >= -90 && latNum <= 90);
  const lngValid =
    lngNum == null ||
    (Number.isFinite(lngNum) && lngNum >= -180 && lngNum <= 180);
  const zoomValid = !isNaN(zoomNum) && zoomNum >= 1 && zoomNum <= 22;
  const hasLat = lat !== "";
  const hasLng = lng !== "";
  const hasLocation = hasLat && hasLng;
  const locationEmpty = !hasLat && !hasLng;
  const locationPairValid = locationEmpty || hasLocation;
  const pickerLat = hasLocation && latValid && lngValid ? latNum : null;
  const pickerLng = hasLocation && latValid && lngValid ? lngNum : null;
  const canSubmit =
    nameValid &&
    descValid &&
    latValid &&
    lngValid &&
    locationPairValid &&
    zoomValid &&
    !isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitError("");
    try {
      const project = await createProject({
        name: name.trim(),
        description: description.trim(),
        center_lat: hasLocation ? latNum : null,
        center_lng: hasLocation ? lngNum : null,
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
      className="bg-panel border border-panel-border rounded-xl shadow-[0_16px_48px_rgba(15,23,42,0.16)] overflow-hidden lg:flex-1 lg:min-h-0 flex flex-col"
    >
      <div className="px-5 py-5 lg:px-6 lg:py-5 grid grid-cols-1 lg:grid-cols-[minmax(320px,0.72fr)_minmax(560px,1.28fr)] gap-5 lg:gap-7 lg:flex-1 lg:min-h-0">
        <div className="flex flex-col gap-4 lg:min-h-0">
          <div>
            <label
              htmlFor="create-name"
              className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5"
            >
              Project Name{" "}
              <span className="text-primary normal-case tracking-normal">*</span>
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
            <span className="text-xs text-text-muted mt-1 block">
              1-100 characters (required)
            </span>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <label
              htmlFor="create-desc"
              className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1.5"
            >
              Description{" "}
              <span className="text-text-muted font-normal normal-case tracking-normal">
                (optional)
              </span>
            </label>
            <textarea
              id="create-desc"
              value={description}
              maxLength={500}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the survey project..."
              rows={8}
              className="w-full min-h-28 lg:flex-1 lg:min-h-0 px-3 py-2.5 border border-panel-border focus:border-primary focus:ring-1 focus:ring-primary/20 rounded-xl text-sm text-text-primary bg-background placeholder:text-text-subtle outline-none transition-all resize-y font-[inherit] leading-relaxed"
            />
            <span className="text-xs text-text-muted mt-1 block">
              {description.length}/500 characters
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:min-h-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 mb-3">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-widest mb-1">
                Base Map Location{" "}
                <span className="text-text-muted font-normal normal-case tracking-normal">
                  (optional)
                </span>
              </label>
              <span className="text-xs text-text-muted block">
                Click the map or drag the marker to set the initial project
                location.
              </span>
            </div>
            <span className="text-xs text-text-muted sm:text-right">
              Manual precision editing is available below.
            </span>
          </div>
          <div className="mb-3 h-80 lg:h-auto lg:flex-1 lg:min-h-0">
            <ProjectLocationPicker
              lat={pickerLat}
              lng={pickerLng}
              zoom={zoomValid ? zoomNum : null}
              height="100%"
              onChange={({ lat, lng, zoom }) => {
                setLat(String(lat));
                setLng(String(lng));
                setZoom(String(zoom));
              }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_90px] gap-2.5">
            <div>
              <label
                htmlFor="create-lat"
                className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1"
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
                className={inputCls(
                  (lat !== "" && !latValid) || (hasLng && !hasLat),
                )}
              />
            </div>
            <div>
              <label
                htmlFor="create-lng"
                className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1"
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
                className={inputCls(
                  (lng !== "" && !lngValid) || (hasLat && !hasLng),
                )}
              />
            </div>
            <div>
              <label
                htmlFor="create-zoom"
                className="text-xs text-text-muted font-bold uppercase tracking-wider block mb-1"
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
          {!locationPairValid && (
            <span className="text-xs text-red-300 mt-1.5 block">
              Latitude and longitude must be provided together.
            </span>
          )}
        </div>

        {submitError && (
          <p className="lg:col-span-2 text-sm text-red-300/80 m-0 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-2">
            {submitError}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 px-5 py-3 lg:px-6 border-t border-panel-border bg-background">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 bg-panel hover:bg-background text-text-secondary hover:text-text-primary border border-panel-border rounded-lg text-sm font-semibold cursor-pointer transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`h-9 px-5 border-none rounded-lg text-sm font-bold transition-all ${
            canSubmit
              ? "bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer shadow-md shadow-primary/20"
              : "bg-disabled text-disabled-foreground cursor-not-allowed"
          }`}
        >
          {isPending ? "Creating..." : "Create Project"}
        </button>
      </div>
    </form>
  );
}
