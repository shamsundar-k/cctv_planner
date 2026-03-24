import { createContext, useContext } from 'react'
import type { Map as LeafletMap, LayerGroup } from 'leaflet'

interface MapContextValue {
  map: LeafletMap | null
  cameraLayer: LayerGroup | null
  fovLayer: LayerGroup | null
}

const MapContext = createContext<MapContextValue>({
  map: null,
  cameraLayer: null,
  fovLayer: null,
})

export default MapContext

export function useLeafletMap(): LeafletMap | null {
  return useContext(MapContext).map
}

export function useCameraLayer(): LayerGroup | null {
  return useContext(MapContext).cameraLayer
}

export function useFovLayer(): LayerGroup | null {
  return useContext(MapContext).fovLayer
}
