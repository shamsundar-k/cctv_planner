import { createContext, useContext } from 'react'
import type { Map as LeafletMap } from 'leaflet'

const MapContext = createContext<LeafletMap | null>(null)

export default MapContext

export function useLeafletMap(): LeafletMap | null {
  return useContext(MapContext)
}
