import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { useAllCameraSpecs } from '@/hooks/useCameraSpecs'
import type { CameraSpecRecord } from '@/types/camera'
import { useSelectedCameraModelStore } from '@/store/selectedCameraModelSlice'
import ManufacturerFilter from './ManufacturerFilter'
import ModelDropdown from './ModelDropdown'
import SelectCameraModel from './SelectCameraModel'
import PanelHeader from './PanelHeader'
import CameraBrief from './CameraBrief'

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-lg border border-panel-border bg-background" />
            ))}
        </div>
    )
}

interface ModelSelectorPanelProps {
    onClose: () => void
}

export default function ModelSelectorPanel({ onClose }: ModelSelectorPanelProps) {
    const { data: models = [], isLoading } = useAllCameraSpecs()
    const { selectedCameraModel } = useSelectedCameraModelStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedManufacturer, setSelectedManufacturer] = useState(selectedCameraModel?.manufacturer ?? '')
    const [draftModel, setDraftModel] = useState<CameraSpecRecord | null>(selectedCameraModel)

    const manufacturers = useMemo(
        () => Array.from(new Set(models.map((m) => m.manufacturer))).sort(),
        [models]
    )

    const filteredModels = useMemo(
        () => {
            const query = searchQuery.trim().toLowerCase()
            return models.filter((model) => {
                if (selectedManufacturer && model.manufacturer !== selectedManufacturer) return false
                if (!query) return true
                return [model.name, model.model, model.manufacturer].some((value) => value.toLowerCase().includes(query))
            })
        },
        [models, searchQuery, selectedManufacturer]
    )

    const handleManufacturerSelect = (manufacturer: string) => {
        setSelectedManufacturer(manufacturer)
        setDraftModel(null)
    }

    return (
        <div className="flex h-full flex-col bg-panel">
            <div className="p-4 flex flex-col gap-4">
                <PanelHeader />
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        <label className="flex flex-col gap-1.5">
                            <span className="pl-1 text-[10px] font-bold uppercase text-text-muted">Search catalog</span>
                            <span className="relative block">
                                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden />
                                <input
                                    type="search"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    placeholder="Manufacturer or model"
                                    className="h-10 w-full rounded-lg border border-panel-border bg-background pl-9 pr-3 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-muted hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
                                />
                            </span>
                        </label>
                        <ManufacturerFilter
                            manufacturers={manufacturers}
                            selected={selectedManufacturer}
                            onSelect={handleManufacturerSelect}
                        />
                        <ModelDropdown
                            models={filteredModels}
                            selected={draftModel}
                            onSelect={setDraftModel}
                        />
                        {filteredModels.length === 0 && (
                            <p className="text-xs text-text-muted">No camera models match these filters.</p>
                        )}
                        {draftModel && <CameraBrief model={draftModel} />}
                    </>
                )}
            </div>
            <div className="mt-auto p-3">
                <SelectCameraModel model={draftModel} onClose={onClose} />
            </div>
        </div>
    )
}
