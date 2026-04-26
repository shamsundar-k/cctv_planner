import { create } from 'zustand'
import type { CameraModel } from '../types/cameramodel.types'

interface SelectedCameraModelState {
    selectedCameraModel: CameraModel | null
    setSelectedCameraModel: (model: CameraModel | null) => void
}

export const useSelectedCameraModelStore = create<SelectedCameraModelState>((set) => ({
    selectedCameraModel: null,
    setSelectedCameraModel: (model) => set({ selectedCameraModel: model }),
}))
