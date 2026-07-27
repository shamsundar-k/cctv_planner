import type { CameraPlacement, CoverageArea } from '@/types/camera'
import type { CameraSpecRecord, CameraType } from '@/types/camera'
import type { fov_input_params } from './fovCalculations'
import { computeFovCartesian, computeFovGeoCorners } from './fovCalculations'

type geo_position = {
    lat: number,
    lng: number
}

const CAMERA_TYPE_LABELS: Record<CameraType, string> = {
    dome: 'Dome Camera',
    ptz: 'PTZ camera',
    bullet: 'Bullet camera',
}

function buildCoverageArea(camera: CameraPlacement, cameraSpec: CameraSpecRecord): CoverageArea | null {
    const targetDistance = camera.target_data.distance
    if (targetDistance <= 0) return null

    const params: fov_input_params = {
        camera_height: camera.height,
        target_distance: targetDistance,
        target_height: camera.target_data.height,
        focal_length_min: cameraSpec.lens_spec.focal_length.min,
        focal_length_max: cameraSpec.lens_spec.focal_length.max,
        h_fov_wide: cameraSpec.lens_spec.h_fov.max,
        h_fov_tele: cameraSpec.lens_spec.h_fov.min,
        v_fov_wide: cameraSpec.lens_spec.v_fov.max,
        v_fov_tele: cameraSpec.lens_spec.v_fov.min,
        focal_length_chosen: camera.target_data.focal_length ?? cameraSpec.lens_spec.focal_length.min,
    }

    const result = computeFovCartesian(params)
    const corners = computeFovGeoCorners(
        result,
        camera.location.latitude,
        camera.location.longitude,
        camera.bearing,
    )
    if (!corners) return null

    return {
        points: corners.map((corner) => ({
            latitude: corner.lat,
            longitude: corner.lng,
        })),
    }
}

export function generateDefaultCamera(cameraSpec: CameraSpecRecord, position: geo_position, projectId: string): CameraPlacement {
    const uid = crypto.randomUUID()

    const camera: CameraPlacement = {
        uid,
        camera_spec_id: cameraSpec.id,
        location: {
            latitude: position.lat,
            longitude: position.lng,
        },
        height: 3,
        bearing: 0,
        label: CAMERA_TYPE_LABELS[cameraSpec.camera_type] ?? 'Unknown camera',
        color: '#3B82F6',
        coverage_area: null,
        target_data: {
            distance: cameraSpec.ir_range > 0 ? cameraSpec.ir_range : 40,
            height: 1.5,
            focal_length: cameraSpec.lens_spec.focal_length.min,
        },
    }

    camera.coverage_area = buildCoverageArea(camera, cameraSpec)

    // suppress unused projectId warning — callers may pass it for context
    void projectId

    return camera
}
