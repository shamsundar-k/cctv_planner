import { useState, useMemo } from 'react'
import type { CameraModel } from '../../../api/cameramodel.types'

export function useCameraSelector(models: CameraModel[]) {
    const [selectedManufacturer, setSelectedManufacturer] = useState<string>('')
    const [selectedModel, setSelectedModel] = useState<CameraModel | null>(null)
    const [showDetailModal, setShowDetailModal] = useState(false)

    const manufacturers = useMemo<string[]>(() => {
        return Array.from(new Set(models.map((m) => m.manufacturer))).sort()
    }, [models])

    const filteredModels = useMemo<CameraModel[]>(() => {
        if (!selectedManufacturer) return models
        return models.filter((m) => m.manufacturer === selectedManufacturer)
    }, [models, selectedManufacturer])

    const handleManufacturerSelect = (manufacturer: string) => {
        setSelectedManufacturer(manufacturer)
        setSelectedModel(null)
    }

    return {
        manufacturers,
        filteredModels,
        selectedManufacturer,
        selectedModel,
        showDetailModal,
        handleManufacturerSelect,
        setSelectedModel,
        setShowDetailModal,
    }
}
