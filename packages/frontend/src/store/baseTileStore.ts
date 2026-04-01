// src/store/baseTileStore.ts

import { create } from 'zustand';
import { BASE_MAPS, DEFAULT_BASE_MAP, type BaseMapKey } from '../config/mapConfig';

interface BaseTileState {
    activeBaseMap: BaseMapKey;
    setBaseMap: (key: BaseMapKey) => void;
}

export const useBaseTileStore = create<BaseTileState>((set) => ({
    activeBaseMap: DEFAULT_BASE_MAP,
    setBaseMap: (key) => set({ activeBaseMap: key }),
}));