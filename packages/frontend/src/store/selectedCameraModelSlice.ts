import { create } from 'zustand'
import type { CameraSpecRecord } from '@/types/camera'

interface SelectedCameraModelState {
    selectedCameraModel: CameraSpecRecord | null
    setSelectedCameraModel: (model: CameraSpecRecord | null) => void
}

export const useSelectedCameraModelStore = create<SelectedCameraModelState>((set) => ({
    selectedCameraModel: null,
    setSelectedCameraModel: (model) => set({ selectedCameraModel: model }),
}))
