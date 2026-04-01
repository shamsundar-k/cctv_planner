// src/context/MapContext.ts

import { createContext, useContext, type RefObject } from 'react';
import type L from 'leaflet';

type MapContextValue = RefObject<L.Map | null>;

export const MapContext = createContext<MapContextValue | null>(null);

export function useMapContext(): MapContextValue {
    const ctx = useContext(MapContext);
    if (!ctx) {
        throw new Error('useMapContext must be used within a Map component');
    }
    return ctx;
}