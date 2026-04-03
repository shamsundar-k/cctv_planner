// src/context/MapContext.ts

import { createContext, useContext, type RefObject } from 'react'
import type L from 'leaflet'
import type { LayerName } from '../config/mapConfig'

export interface MapContextValue {
    mapRef: RefObject<L.Map | null>
    layersRef: RefObject<Partial<Record<LayerName, L.LayerGroup>>>
    visibleLayers: Record<LayerName, boolean>
    toggleLayer: (name: LayerName) => void
}

export const MapContext = createContext<MapContextValue | null>(null)

export function useMapContext(): MapContextValue {
    const ctx = useContext(MapContext)
    if (!ctx) throw new Error('useMapContext must be used within a Map component')
    return ctx
}