import type { CameraModel } from '../../../types/cameramodel.types'
import { useSelectedCameraModelStore } from '../../../store/selectedCameraModelSlice'

interface SelectCameraModelProps {
    model: CameraModel | null
    onClose: () => void
}

export default function SelectCameraModel({ model, onClose }: SelectCameraModelProps) {
    const setSelectedCameraModel = useSelectedCameraModelStore((s) => s.setSelectedCameraModel)

    const handleClick = () => {
        setSelectedCameraModel(model)
        onClose()
    }

    return (
        <button
            disabled={model === null}
            onClick={handleClick}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 border border-transparent bg-accent text-on-accent enabled:hover:bg-accent-hover  disabled:bg-surface/20 disabled:text-surface/60 disabled:border-surface/20 disabled:cursor-not-allowed"
        >
            Select Camera Model
        </button>
    )
}
