import { create } from 'zustand'

interface CameraLayerState {
  selectedCameraId: string | null
  hiddenCameraIds: string[]
  selectCamera: (id: string | null) => void
  clearSelection: () => void
  toggleCameraVisibility: (id: string) => void
}

export const useCameraLayerStore = create<CameraLayerState>((set) => ({
  selectedCameraId: null,
  hiddenCameraIds: [],

  selectCamera: (id) => set({ selectedCameraId: id }),

  clearSelection: () => set({ selectedCameraId: null }),

  toggleCameraVisibility: (id) =>
    set((s) => ({
      hiddenCameraIds: s.hiddenCameraIds.includes(id)
        ? s.hiddenCameraIds.filter((x) => x !== id)
        : [...s.hiddenCameraIds, id],
    })),
}))
