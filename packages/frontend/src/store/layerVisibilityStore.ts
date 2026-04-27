import { create } from 'zustand'

export const LAYERS = [
  { key: 'cameras' as const, label: 'Cameras' },
  { key: 'draw' as const, label: 'Draw' },
] satisfies { key: string; label: string }[]

export type LayerKey = (typeof LAYERS)[number]['key']

interface LayerVisibilityState {
  visible: Record<LayerKey, boolean>
  toggleLayer: (key: LayerKey) => void
}

export const useLayerVisibilityStore = create<LayerVisibilityState>((set) => ({
  visible: {
    cameras: true,
    draw: true,
  },
  toggleLayer: (key) =>
    set((s) => ({ visible: { ...s.visible, [key]: !s.visible[key] } })),
}))
