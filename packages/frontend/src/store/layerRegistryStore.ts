import { create } from 'zustand'

interface LayerEntry {
  label: string
  visible: boolean
}

interface LayerRegistryState {
  layers: Record<string, LayerEntry>
  registerLayer: (name: string, label: string) => void
  unregisterLayer: (name: string) => void
  toggleLayer: (name: string) => void
}

export const useLayerRegistryStore = create<LayerRegistryState>((set) => ({
  layers: {},

  registerLayer: (name, label) =>
    set((s) => ({ layers: { ...s.layers, [name]: { label, visible: true } } })),

  unregisterLayer: (name) =>
    set((s) => {
      const { [name]: _, ...rest } = s.layers
      return { layers: rest }
    }),

  toggleLayer: (name) =>
    set((s) => {
      const entry = s.layers[name]
      if (!entry) return s
      return { layers: { ...s.layers, [name]: { ...entry, visible: !entry.visible } } }
    }),
}))
