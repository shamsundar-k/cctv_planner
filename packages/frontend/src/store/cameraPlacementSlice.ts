import { create } from 'zustand'

export interface SelectedModelRef {
  manufacturer: string
  model: string
}

interface CameraPlacementState {
  selectedCameraId: string | null
  selectedModel: SelectedModelRef | null

  setSelectedCameraId: (id: string | null) => void
  setSelectedModel: (model: SelectedModelRef | null) => void
}

export const useCameraPlacementStore = create<CameraPlacementState>((set) => ({
  selectedCameraId: null,
  selectedModel: null,

  setSelectedCameraId: (selectedCameraId) => set({ selectedCameraId }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}))
