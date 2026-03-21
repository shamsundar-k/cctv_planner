import { create } from 'zustand'

interface MapViewState {
  isDirty: boolean
  lastSavedAt: Date | null
  markDirty: () => void
  markSaved: () => void
}

export const useMapViewStore = create<MapViewState>((set) => ({
  isDirty: false,
  lastSavedAt: null,
  markDirty: () => set({ isDirty: true }),
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date() }),
}))
