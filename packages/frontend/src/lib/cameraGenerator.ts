import type { CameraInstance } from '../api/cameraInstances.types'
import { getCameraModelDetails } from '../api/projects'
import type { CameraType } from '../api/cameras.types'

type geo_position =
    {
        lat: number,
        lng: number

    }

const CAMERA_TYPE_LABELS: Record<CameraType, string> = {
    fixed_dome: 'Dome Camera',
    ptz: 'PTZ camera',
    bullet: 'Bullet camera',
};

export function generateDefaultCameraInstance(camera_model_id: string, position: geo_position, projectId: string) {

    const now = new Date().toISOString()
    const tempId = 'temp-' + crypto.randomUUID()

    const camera_model_data = getCameraModelDetails(camera_model_id)
    console.log("camera_model_data", camera_model_data);


    const localCamera: CameraInstance = {
        id: tempId,
        label: camera_model_data ? CAMERA_TYPE_LABELS[camera_model_data.camera_type] : 'Unknown',
        lat: position.lat,
        lng: position.lng,
        tilt_angle: 15,
        bearing: 0,
        height: 5,
        focal_length_chosen: camera_model_data ? camera_model_data.focal_length_min : 4,
        colour: '#3B82F6',

        fov_visible_geojson: null,
        fov_ir_geojson: null,
        target_distance: 50,
        target_height: 1.8,
        camera_model_id: camera_model_id,
        project_id: projectId,
        created_at: now,
        updated_at: now,
    }
    return localCamera

}