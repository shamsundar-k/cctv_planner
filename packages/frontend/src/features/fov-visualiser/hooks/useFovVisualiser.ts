import { useCallback, useMemo, useState } from "react";
import { useAllCameraSpecs } from "@/hooks/useCameraSpecs";
import {
  computeFovCartesian,
  type FovCartesian,
} from "@/lib/fovCalculations";
import type { CameraSpecRecord } from "@/types/camera";
import type {
  CoverageResults,
  InstallationField,
  InstallationValues,
  NumericBounds,
  ProjectionDomains,
  ProjectionGeometry,
} from "../types";
import { deriveDoriOverlayGeometry } from "../utils/doriGeometry";
import { deriveVerticalTargetGeometry } from "../utils/projectionGeometry";
import { deriveProjectionDomains } from "../utils/projectionDomains";

const DEFAULT_INSTALLATION: InstallationValues = {
  focalLength: 4,
  mountingHeight: 3,
  targetDistance: 12,
  targetHeight: 1.7,
};

export const INSTALLATION_BOUNDS: Record<
  Exclude<InstallationField, "focalLength">,
  NumericBounds
> = {
  mountingHeight: { min: 0.5, max: 20, step: 0.1 },
  targetDistance: { min: 0.5, max: 150, step: 0.5 },
  targetHeight: { min: 0, max: 3, step: 0.1 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function normalize(value: number, fallback: number, bounds: NumericBounds): number {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, bounds.min, bounds.max);
}

function calculateFov(
  camera: CameraSpecRecord,
  installation: InstallationValues,
  focalLength = installation.focalLength,
): FovCartesian {
  const focal = camera.lens_spec.focal_length;

  return computeFovCartesian({
    camera_height: installation.mountingHeight,
    target_distance: installation.targetDistance,
    target_height: installation.targetHeight,
    focal_length_min: focal.min,
    focal_length_max: focal.max,
    h_fov_wide: camera.lens_spec.h_fov.max,
    h_fov_tele: camera.lens_spec.h_fov.min,
    v_fov_wide: camera.lens_spec.v_fov.max,
    v_fov_tele: camera.lens_spec.v_fov.min,
    focal_length_chosen: focalLength,
  });
}

function buildProjectionGeometry(
  calculation: FovCartesian,
  installation: InstallationValues,
): ProjectionGeometry | null {
  if (calculation.status === "invalid_both_rays_up") return null;
  const verticalTarget = deriveVerticalTargetGeometry(
    calculation,
    installation,
  );
  return verticalTarget ? { calculation, verticalTarget } : null;
}

export function useFovVisualiser() {
  const cameraQuery = useAllCameraSpecs();
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedModelId, setSelectedModelId] = useState("");
  const [installation, setInstallation] = useState(DEFAULT_INSTALLATION);
  const [showDoriRegions, setShowDoriRegions] = useState(true);

  const bulletCameras = useMemo(
    () =>
      (cameraQuery.data ?? [])
        .filter((camera) => camera.camera_type === "bullet")
        .sort((left, right) =>
          `${left.manufacturer} ${left.name}`.localeCompare(
            `${right.manufacturer} ${right.name}`,
          ),
        ),
    [cameraQuery.data],
  );

  const manufacturers = useMemo(
    () =>
      Array.from(
        new Set(bulletCameras.map((camera) => camera.manufacturer)),
      ).sort((left, right) => left.localeCompare(right)),
    [bulletCameras],
  );

  const availableCameras = useMemo(
    () =>
      selectedManufacturer
        ? bulletCameras.filter(
            (camera) => camera.manufacturer === selectedManufacturer,
          )
        : bulletCameras,
    [bulletCameras, selectedManufacturer],
  );

  const selectedModel = useMemo(
    () =>
      bulletCameras.find((camera) => camera.id === selectedModelId) ?? null,
    [bulletCameras, selectedModelId],
  );

  const focalBounds: NumericBounds = useMemo(() => {
    const focal = selectedModel?.lens_spec.focal_length;
    return focal
      ? { min: focal.min, max: focal.max, step: 0.1 }
      : { min: 1, max: 100, step: 0.1 };
  }, [selectedModel]);

  const handleManufacturerChange = useCallback(
    (manufacturer: string) => {
      setSelectedManufacturer(manufacturer);
      setSelectedModelId((currentId) => {
        const current = bulletCameras.find((camera) => camera.id === currentId);
        return current && manufacturer && current.manufacturer !== manufacturer
          ? ""
          : currentId;
      });
    },
    [bulletCameras],
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      const model = bulletCameras.find((camera) => camera.id === modelId);
      setSelectedModelId(model?.id ?? "");

      if (model) {
        setInstallation((current) => ({
          ...current,
          focalLength: model.lens_spec.focal_length.min,
        }));
      }
    },
    [bulletCameras],
  );

  const handleInstallationChange = useCallback(
    (field: InstallationField, value: number) => {
      setInstallation((current) => {
        const bounds =
          field === "focalLength" ? focalBounds : INSTALLATION_BOUNDS[field];
        const nextValue = normalize(value, current[field], bounds);

        return nextValue === current[field]
          ? current
          : { ...current, [field]: nextValue };
      });
    },
    [focalBounds],
  );

  const calculation = useMemo(() => {
    if (!selectedModel) return null;
    return calculateFov(selectedModel, installation);
  }, [installation, selectedModel]);

  const projectionGeometry: ProjectionGeometry | null = useMemo(() => {
    return calculation
      ? buildProjectionGeometry(calculation, installation)
      : null;
  }, [calculation, installation]);

  const horizontalResolution =
    selectedModel?.sensor_spec.resolution.horizontal ?? null;
  const horizontalFov = projectionGeometry?.calculation.h_angle ?? null;
  const doriGeometry = useMemo(
    () => deriveDoriOverlayGeometry(horizontalResolution, horizontalFov),
    [horizontalFov, horizontalResolution],
  );

  const coverageResults: CoverageResults | null = useMemo(() => {
    if (
      !projectionGeometry ||
      projectionGeometry.calculation.d_near == null ||
      projectionGeometry.calculation.w_target == null
    ) {
      return null;
    }

    return {
      horizontalFov: projectionGeometry.calculation.h_angle,
      verticalFov: projectionGeometry.calculation.v_angle,
      sceneWidth: projectionGeometry.calculation.w_target,
      sceneHeight: projectionGeometry.verticalTarget.sceneHeight,
      deadZone: projectionGeometry.calculation.d_near,
    };
  }, [projectionGeometry]);

  const projectionDomains: ProjectionDomains | null = useMemo(
    () =>
      projectionGeometry
        ? deriveProjectionDomains(
            [projectionGeometry],
            installation,
            doriGeometry,
          )
        : null,
    [doriGeometry, installation, projectionGeometry],
  );

  const handleDoriVisibilityChange = useCallback((visible: boolean) => {
    setShowDoriRegions(visible);
  }, []);

  return {
    bulletCameras,
    manufacturers,
    availableCameras,
    selectedManufacturer,
    selectedModelId,
    selectedModel,
    installation,
    focalBounds,
    calculation,
    projectionGeometry,
    projectionDomains,
    doriGeometry,
    showDoriRegions,
    coverageResults,
    isLoading: cameraQuery.isLoading,
    isError: cameraQuery.isError,
    isEmpty: !cameraQuery.isLoading && !cameraQuery.isError && bulletCameras.length === 0,
    isGeometryInvalid:
      calculation?.status === "invalid_both_rays_up" ||
      (calculation != null && projectionGeometry == null),
    onManufacturerChange: handleManufacturerChange,
    onModelChange: handleModelChange,
    onInstallationChange: handleInstallationChange,
    onDoriVisibilityChange: handleDoriVisibilityChange,
    retry: cameraQuery.refetch,
  };
}
