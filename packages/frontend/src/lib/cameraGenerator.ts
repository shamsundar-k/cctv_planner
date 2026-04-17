import type { CameraInstance } from '../api/cameraInstances.types'
import { getCameraModelDetails } from '../api/projects'
import type { CameraType } from '../api/cameramodel.types'
import type { fov_input_params, FovCartesian } from './fovCalculations'
import { computeFovCartesian, computeFovGeoCorners } from './fovCalculations'

type geo_position = {
    lat: number,
    lng: number
}

const CAMERA_TYPE_LABELS: Record<CameraType, string> = {
    fixed_dome: 'Dome Camera',
    ptz: 'PTZ camera',
    bullet: 'Bullet camera',
}

export function generateDefaultCameraInstance(camera_model_id: string, position: geo_position, projectId: string): CameraInstance | null {
    const uid = crypto.randomUUID()

    const camera_model_data = getCameraModelDetails(camera_model_id)
    console.log("camera_model_data", camera_model_data)

    if (!camera_model_data) {
        return null
    }

    const tempCamera: CameraInstance = {
        uid,
        label: CAMERA_TYPE_LABELS[camera_model_data.camera_type] ?? 'Unknown',
        lat: position.lat,
        lng: position.lng,
        tilt_angle: 15,
        bearing: 0,
        camera_height: 5,
        focal_length_chosen: camera_model_data.focal_length_min,
        colour: '#3B82F6',
        visible: true,
        fov_visible_geojson: null,
        fov_ir_geojson: null,
        target_distance: 50,
        target_height: 1.8,
        camera_model_id,
    }

    const fov_calc_input_data: fov_input_params = {
        camera_height: tempCamera.camera_height,
        target_distance: tempCamera.target_distance!,
        target_height: tempCamera.target_height,
        focal_length_min: camera_model_data.focal_length_min,
        focal_length_max: camera_model_data.focal_length_max,
        h_fov_wide: camera_model_data.h_fov_max,
        h_fov_tele: camera_model_data.h_fov_min,
        v_fov_wide: camera_model_data.v_fov_max,
        v_fov_tele: camera_model_data.v_fov_min,
        focal_length_chosen: tempCamera.focal_length_chosen!,
    }

    const result: FovCartesian = computeFovCartesian(fov_calc_input_data)
    const geo_fov = computeFovGeoCorners(result, tempCamera.lat, tempCamera.lng, tempCamera.bearing)

    tempCamera.fov_visible_geojson = geo_fov
    tempCamera.tilt_angle = result.tilt_angle

    // suppress unused projectId warning — callers may pass it for context
    void projectId

    return tempCamera
}
