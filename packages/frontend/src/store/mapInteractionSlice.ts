import { create } from 'zustand'

export type MapInteractionMode = 'IDLE' | 'PLACING' | 'SELECTED' | 'EDITING'

interface MapInteractionState {
  mode: MapInteractionMode
  setMode: (mode: MapInteractionMode) => void
}

export const useMapInteractionStore = create<MapInteractionState>((set) => ({
  mode: 'IDLE',
  setMode: (mode) => set({ mode }),
}))
