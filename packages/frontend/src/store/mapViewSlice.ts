import { create } from 'zustand'

export type ActiveTool = 'pan' | 'select' | 'place-camera' | 'draw-polygon' | 'draw-line' | 'measure' | 'delete'

interface MapViewState {
  activeTool: ActiveTool
  setActiveTool: (tool: ActiveTool) => void
}

export const useMapViewStore = create<MapViewState>((set) => ({
  activeTool: 'pan',
  setActiveTool: (tool) => set({ activeTool: tool }),
}))
