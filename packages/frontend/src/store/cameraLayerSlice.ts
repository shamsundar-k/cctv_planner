import { create } from 'zustand'

interface CameraLayerState {
  selectedCameraId: string | null
  selectCamera: (id: string | null) => void
  clearSelection: () => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  selectCamera: (id) => set({ selectedCameraId: id }),
  clearSelection: () => set({ selectedCameraId: null }),
}))
