// src/config/mapConfig.ts

export type BasemapStyle = 'alidade_smooth' | 'alidade_smooth_dark' | 'stamen_toner'

const TILE_ATTRIBUTION =
    '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> ' +
    '&copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> ' +
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

const STADIA_API_KEY = import.meta.env.VITE_STADIA_MAPS_API_KEY as string | undefined

export function buildTileUrl(style: BasemapStyle, apiKey: string | undefined): string {
    const r = '{r}'
    const base = `https://tiles.stadiamaps.com/tiles/${style}/{z}/{x}/{y}${r}.png`
    return apiKey ? `${base}?api_key=${apiKey}` : base
}

export const BASE_MAPS: Record<
    BasemapStyle,
    { label: string; attribution: string; get_url: () => string }
> = {
    alidade_smooth: {
        label: 'Smooth',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('alidade_smooth', STADIA_API_KEY),
    },
    alidade_smooth_dark: {
        label: 'Dark',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('alidade_smooth_dark', STADIA_API_KEY),
    },
    stamen_toner: {
        label: 'Toner',
        attribution: TILE_ATTRIBUTION,
        get_url: () => buildTileUrl('stamen_toner', STADIA_API_KEY),
    },
}

export type BaseMapKey = BasemapStyle

export const DEFAULT_BASE_MAP: BaseMapKey = 'alidade_smooth'