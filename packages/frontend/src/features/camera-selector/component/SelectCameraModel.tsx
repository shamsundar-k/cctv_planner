import type { CameraSpecRecord } from '@/types/camera'
import { useSelectedCameraModelStore } from '../../../store/selectedCameraModelSlice'

interface SelectCameraModelProps {
    model: CameraSpecRecord | null
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
            className="flex min-h-11 w-full items-center justify-center gap-2.5 rounded-lg border border-primary bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors enabled:hover:bg-primary-hover disabled:cursor-not-allowed disabled:border-disabled disabled:bg-disabled disabled:text-disabled-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
            Select Camera Model
        </button>
    )
}
