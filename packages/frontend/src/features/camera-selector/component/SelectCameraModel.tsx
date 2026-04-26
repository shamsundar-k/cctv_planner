import { useCameraLayerStore } from '../../../store/cameraLayerSlice'

export default function SelectCameraModel() {
    const selectedModel = useCameraLayerStore((s) => s.selectedModel)
    const setSelectedModel = useCameraLayerStore((s) => s.setSelectedModel)

    return (
        <button
            disabled={selectedModel === null}
            onClick={() => setSelectedModel(selectedModel)}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 border border-transparent bg-accent text-on-accent enabled:hover:bg-accent-hover enabled:hover:text-canvas disabled:bg-surface/20 disabled:text-surface/60 disabled:border-surface/20 disabled:cursor-not-allowed"
        >
            Place camera
        </button>
    )
}
