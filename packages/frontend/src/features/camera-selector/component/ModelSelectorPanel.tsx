import { useState, useMemo } from 'react'
import { useAllCameraModels } from '../../../api/camerasModels'
import type { CameraModel } from '../../../types/cameramodel.types'
import ManufacturerFilter from './ManufacturerFilter'
import ModelDropdown from './ModelDropdown'
import SelectCameraModel from './SelectCameraModel'
import PanelHeader from './PanelHeader'
import CameraBrief from './CameraBrief'

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
                <div key={i} className="h-10 w-full animate-pulse rounded-lg bg-surface/20" />
            ))}
        </div>
    )
}

interface ModelSelectorPanelProps {
    onClose: () => void
}

export default function ModelSelectorPanel({ onClose }: ModelSelectorPanelProps) {
    const { data: models = [], isLoading } = useAllCameraModels()
    const [selectedManufacturer, setSelectedManufacturer] = useState('')
    const [draftModel, setDraftModel] = useState<CameraModel | null>(null)

    const manufacturers = useMemo(
        () => Array.from(new Set(models.map((m) => m.manufacturer))).sort(),
        [models]
    )

    const filteredModels = useMemo(
        () => selectedManufacturer ? models.filter((m) => m.manufacturer === selectedManufacturer) : models,
        [models, selectedManufacturer]
    )

    const handleManufacturerSelect = (manufacturer: string) => {
        setSelectedManufacturer(manufacturer)
        setDraftModel(null)
    }

    return (
        <div className="flex h-full flex-col shadow-xl bg-card border-r border-surface/20">
            <div className="p-4 flex flex-col gap-4">
                <PanelHeader />
                {isLoading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
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
