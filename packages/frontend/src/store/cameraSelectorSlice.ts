import { create } from 'zustand'
import type { CameraModel } from '../api/cameramodel.types'

interface CameraSelectorState {
  selectedModel: CameraModel | null
  setSelectedModel: (model: CameraModel | null) => void
}

export const useCameraSelectorStore = create<CameraSelectorState>((set) => ({
  selectedModel: null,
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}))
