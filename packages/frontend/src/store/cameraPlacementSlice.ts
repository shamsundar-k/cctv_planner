import { create } from 'zustand'

export type PlacementMode = 'IDLE' | 'PLACING' | 'SELECTED' | 'EDITING'
export type LeftPanel = 'MODELS' | 'CAMERAS'

export interface SelectedModelRef {
  manufacturer: string
  model: string
}

interface CameraPlacementState {
  mode: PlacementMode
  selectedCameraId: string | null
  activePanelLeft: LeftPanel | null
  activePanelRight: boolean
  selectedModel: SelectedModelRef | null

  setMode: (mode: PlacementMode) => void
  setSelectedCameraId: (id: string | null) => void
  setActivePanelLeft: (panel: LeftPanel | null) => void
  setActivePanelRight: (open: boolean) => void
  setSelectedModel: (model: SelectedModelRef | null) => void
}

export const useCameraPlacementStore = create<CameraPlacementState>((set) => ({
  mode: 'IDLE',
  selectedCameraId: null,
  activePanelLeft: null,
  activePanelRight: false,
  selectedModel: null,

  setMode: (mode) => set({ mode }),
  setSelectedCameraId: (selectedCameraId) => set({ selectedCameraId }),
  setActivePanelLeft: (activePanelLeft) => set({ activePanelLeft }),
  setActivePanelRight: (activePanelRight) => set({ activePanelRight }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}))
