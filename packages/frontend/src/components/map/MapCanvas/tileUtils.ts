import { type BasemapStyle } from '../../../store/mapViewSlice'
import type { ReactNode } from 'react'


export interface MapCanvasProps {
  centerLat?: number | null
  centerLng?: number | null
  defaultZoom?: number | null
  projectId: string
  children?: ReactNode
}

export function buildTileUrl(style: BasemapStyle, apiKey: string | undefined): string {
  const r = '{r}'
  const base = `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}${r}.png`
  return apiKey ? `${base}?api_key=${apiKey}` : base
}


const TILE_ATTRIBUTION =
  '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
  '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const CROSSHAIR_TOOLS = new Set(['place-camera'])

const DEFAULT_LAT = 12.9716
const DEFAULT_LNG = 77.5946
const DEFAULT_ZOOM = 13

export { TILE_ATTRIBUTION, CROSSHAIR_TOOLS, DEFAULT_LAT, DEFAULT_LNG, DEFAULT_ZOOM }