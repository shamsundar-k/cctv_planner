import { X } from 'lucide-react'
import { useMapActionsStore } from '@/store/mapActionsSlice'

interface MapToolBannerProps {
    title: string
    instructions: string
}

export default function MapToolBanner({ title, instructions }: MapToolBannerProps) {
    const setActiveTool = useMapActionsStore((state) => state.setActiveTool)

    return (
        <div className="absolute left-1/2 top-4 z-[1000] flex -translate-x-1/2 items-center gap-3 whitespace-nowrap rounded-lg border border-primary/40 bg-panel/90 px-4 py-2 text-sm shadow-lg backdrop-blur-md">
            <span className="font-semibold text-text-primary">{title}</span>
            <span className="text-xs text-text-secondary">{instructions}</span>
            <button
                type="button"
                onClick={() => setActiveTool('select')}
                aria-label={`Exit ${title.toLowerCase()}`}
                className="ml-1 flex items-center justify-center rounded-md p-1 text-text-secondary transition-colors hover:bg-background hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
                <X size={14} aria-hidden />
            </button>
        </div>
    )
}
