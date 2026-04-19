import { useCameraSelectorStore } from '../../../store/cameraSelectorSlice'
import { useMapInteractionStore } from '../../../store/mapInteractionSlice'

export default function PlaceCameraButton() {
    const selectedModel = useCameraSelectorStore((s) => s.selectedModel)
    const setMode = useMapInteractionStore((s) => s.setMode)

    return (
        <button
            disabled={selectedModel === null}
            onClick={() => setMode('PLACING')}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 border border-transparent bg-accent text-on-accent enabled:hover:bg-accent-hover enabled:hover:text-canvas disabled:bg-surface/20 disabled:text-surface/60 disabled:border-surface/20 disabled:cursor-not-allowed"
        >
            Place camera
        </button>
    )
}
