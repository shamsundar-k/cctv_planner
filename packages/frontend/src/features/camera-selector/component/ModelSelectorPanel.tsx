import { useState, useMemo } from 'react'
import { useAllCameraModels } from '../../../api/camerasModels'
import { useCameraLayerStore } from '../../../store/cameraLayerSlice'
import ManufacturerFilter from './ManufacturerFilter'
import ModelDropdown from './ModelDropdown'
import PlaceCameraButton from './PlaceCameraButton'
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

export default function ModelSelectorPanel() {
    const { data: models = [], isLoading } = useAllCameraModels()
    const selectedModel = useCameraLayerStore((s) => s.selectedModel)
    const setSelectedModel = useCameraLayerStore((s) => s.setSelectedModel)
    const [selectedManufacturer, setSelectedManufacturer] = useState('')

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
        setSelectedModel(null)
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
                            selected={selectedModel}
                            onSelect={setSelectedModel}
                        />
                        {selectedModel && <CameraBrief model={selectedModel} />}
                    </>
                )}
            </div>
            <div className="mt-auto p-3">
                <PlaceCameraButton />
            </div>
        </div>
    )
}
