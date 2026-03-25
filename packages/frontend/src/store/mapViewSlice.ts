import { create } from 'zustand'

export type BasemapStyle = 'alidade_smooth' | 'alidade_smooth_dark' | 'stamen_toner'
export type ActiveTool = 'pan' | 'select' | 'place-camera' | 'draw-polygon' | 'draw-line' | 'measure' | 'delete'

// Leaflet Map type — imported lazily so we keep this file framework-agnostic
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LeafletMap = any

interface MapViewState {
  // Map instance
  leafletMap: LeafletMap | null

  // Active tool
  activeTool: ActiveTool

  // Layer visibility
  showFovPolygons: boolean
  showZonePolygons: boolean

  // Basemap
  basemapStyle: BasemapStyle

  // Actions
  setLeafletMap: (map: LeafletMap | null) => void
  setActiveTool: (tool: ActiveTool) => void
  setShowFovPolygons: (show: boolean) => void
  setShowZonePolygons: (show: boolean) => void
  setBasemapStyle: (style: BasemapStyle) => void
}

export const useMapViewStore = create<MapViewState>((set) => ({
  leafletMap: null,

  activeTool: 'pan',

  showFovPolygons: true,
  showZonePolygons: true,

  basemapStyle: 'alidade_smooth',

  setLeafletMap: (map) => set({ leafletMap: map }),
  setActiveTool: (tool) => {
    console.log('Setting active tool to:', tool)
    set({ activeTool: tool })
  },

  setShowFovPolygons: (show) => set({ showFovPolygons: show }),
  setShowZonePolygons: (show) => set({ showZonePolygons: show }),

  setBasemapStyle: (style) => set({ basemapStyle: style }),
}))
