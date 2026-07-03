import { create } from 'zustand'

interface CameraLayerState {
  selectedCameraId: string | null
  hiddenCameraIds: string[]
  selectCamera: (id: string | null) => void
  toggleCameraVisibility: (id: string) => void
  clearSelection: () => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  hiddenCameraIds: [],
  selectCamera: (id) => set({ selectedCameraId: id }),
  toggleCameraVisibility: (id) =>
    set((state) => ({
      hiddenCameraIds: state.hiddenCameraIds.includes(id)
        ? state.hiddenCameraIds.filter((cameraId) => cameraId !== id)
        : [...state.hiddenCameraIds, id],
    })),
  clearSelection: () => set({ selectedCameraId: null }),
}))
