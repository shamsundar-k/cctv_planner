import type { CameraInstance } from '../api/cameraInstances.types'
import { FOV_DEFAULTS } from './fovCalculations'
import { cameraKeys } from '../api/cameras'
import { getCameraModelDetails } from '../api/cameras'
type geo_position =
    {
        lat: number,
        lng: number

    }

async function generateDefaultCameraInstance(camera_model: string, position: geo_position) {

    const now = new Date().toISOString()
    const tempId = 'temp-' + crypto.randomUUID()
    const cameraModelData = await getCameraModelDetails(camera_model)


    const localCamera: CameraInstance = {
        id: tempId,
        label: '',
        lat: position.lat,
        lng: position.lng,
        bearing: 0,
        height: FOV_DEFAULTS.height,
        focal_length_chosen: null,
        colour: '#3B82F6',
        visible: true,
        fov_visible_geojson: null,
        fov_ir_geojson: null,
        target_distance: FOV_DEFAULTS.targetDistance,
        target_height: FOV_DEFAULTS.targetHeight,
        camera_model_id: selectedModelId,
        project_id: projectId,
        created_at: now,
        updated_at: now,
    }

}