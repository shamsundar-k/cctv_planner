// src/config/mapConfig.ts
import smoothThumb from '../assets/basemap-thumbs/alidade_smooth.jpg'
import darkThumb from '../assets/basemap-thumbs/alidade_smooth_dark.jpg'
import tonerThumb from '../assets/basemap-thumbs/stamen_toner.jpg'
import satelliteThumb from '../assets/basemap-thumbs/alidade_satellite.jpg'
import offlineMapsThumb from '../assets/basemap-thumbs/offline-maps.svg'

export type BasemapStyle =
    | 'alidade_smooth'
    | 'alidade_smooth_dark'
    | 'stamen_toner'
    | 'alidade_satellite'
    | 'offline_maps'
export type BasemapLabelTone = 'light' | 'dark'
export interface BasemapDefinition {
    label: string
    attribution: string
    get_url: () => string
    image: string
    labelTone: BasemapLabelTone
}

const TILE_ATTRIBUTION =
    '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
    '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const STADIA_API_KEY = import.meta.env.VITE_STADIA_MAPS_API_KEY as string | undefined
const MARTIN_TILE_SERVER_URL =
    (import.meta.env.VITE_MARTIN_TILE_SERVER_URL as string | undefined)?.replace(/\/$/, '') ?? 'http://localhost:3000'

export function buildTileUrl(style: BasemapStyle, apiKey: string | undefined): string {
    const r = '{r}'
    const base = `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}${r}.png`
    return apiKey ? `${base}?api_key=${apiKey}` : base
}

export const BASE_MAPS: Record<
    BasemapStyle,
    BasemapDefinition
> = {
    alidade_smooth: {
        label: 'Smooth',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('alidade_smooth', STADIA_API_KEY),
        image: smoothThumb,
        labelTone: 'dark',
    },
    alidade_smooth_dark: {
        label: 'Dark',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('alidade_smooth_dark', STADIA_API_KEY),
        image: darkThumb,
        labelTone: 'light',
    },
    stamen_toner: {
        label: 'Toner',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('stamen_toner', STADIA_API_KEY),
        image: tonerThumb,
        labelTone: 'dark',
    },
    alidade_satellite: {
        label: 'Satellite',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('alidade_satellite', STADIA_API_KEY),
        image: satelliteThumb,
        labelTone: 'light',
    },
    offline_maps: {
        label: 'Offline maps',
        attribution: '&copy; OpenStreetMap contributors',
        get_url: () => `${MARTIN_TILE_SERVER_URL}/style/bangalore/{z}/{x}/{y}.png`,
        image: offlineMapsThumb,
        labelTone: 'dark',
    },
}

export type BaseMapKey = BasemapStyle

export const DEFAULT_BASE_MAP: BaseMapKey = 'alidade_smooth'
