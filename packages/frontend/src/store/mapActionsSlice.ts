import { create } from 'zustand'

export type ActiveTool = 'pan' | 'select' | 'place-camera' | 'draw-polygon' | 'draw-line' | 'measure' | 'delete'

interface MapActionsState {
  activeTool: ActiveTool
  setActiveTool: (tool: ActiveTool) => void
}

export const useMapActionsStore = create<MapActionsState>((set) => ({
  activeTool: 'pan',
  setActiveTool: (tool) => set({ activeTool: tool }),
}))
