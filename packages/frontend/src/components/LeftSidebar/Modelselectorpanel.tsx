/**
 * ModelSelectorPanel
 *
 * Container for the camera model selection UI in the map sidebar (236px wide).
 * Owns manufacturer filter + model selection state.
 *
 * Props:
 *   models          — full admin-seeded CameraModel list (fetched by parent)
 *   isLoading       — true while parent is fetching
 *   onPlaceCamera   — called with the selected CameraModel when button clicked
 *
 * Palette:
 *   Shadow Grey   #202030  — panel bg
 *   Vintage Grape #39304A  — inputs / surfaces
 *   Stone Brown   #635C51  — borders / dividers
 *   Grey Olive    #7D7461  — secondary text / icons
 *   Khaki Beige   #B0A990  — primary text
 */
import { useState, useMemo } from 'react'
import type { CameraModel } from '../../api/cameramodel.types'

import ManufacturerFilter from './Manufacturerfilter'
import ModelDropdown from './Modeldropdown'
import CameraModelInfoCard from './Cameramodelinfocard'
import CameraModelDetailModal from './CameraModelDetailModal'

// ── Place camera button ────────────────────────────────────────────────────────

function PlaceCameraButton({
    disabled,
    onClick,
}: {
    disabled: boolean
    onClick: () => void
}) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={{
                background: disabled ? '#39304A' : '#635C51',
                border: '1px solid #635C51',
                color: disabled ? '#7D7461' : '#B0A990',
            }}
            className="
        flex w-full items-center justify-center gap-2
        rounded px-3 py-2 text-[13px] font-medium
        transition-all duration-150
        hover:enabled:brightness-110
        active:enabled:scale-[0.98]
        disabled:cursor-not-allowed
      "
        >
            <PlaceCameraIcon />
            Place camera
        </button>
    )
}

function PlaceCameraIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <path d="M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
    )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-2">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    style={{ background: '#39304A' }}
                    className="h-7 w-full animate-pulse rounded"
                />
            ))}
        </div>
    )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
    return <div style={{ borderTop: '1px solid #635C51' }} className="my-1" />
}

// ── Panel heading ─────────────────────────────────────────────────────────────

function PanelHeading() {
    return (
        <p
            style={{ color: '#7D7461' }}
            className="text-[10px] font-semibold uppercase tracking-widest"
        >
            Camera model
        </p>
    )
}

// ── Container ─────────────────────────────────────────────────────────────────

interface ModelSelectorPanelProps {
    models: CameraModel[]
    isLoading: boolean
    onPlaceCamera: (model: CameraModel) => void
}

export default function ModelSelectorPanel({
    models,
    isLoading,
    onPlaceCamera,
}: ModelSelectorPanelProps) {
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

    return (
        <div
            style={{ background: '#202030' }}
            className="flex h-full flex-col"
        >
            {/* Fixed: heading + filters */}
            <div className="p-3 flex flex-col gap-3">
                <PanelHeading />

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
                    </>
                )}
            </div>

            {/* Camera info card */}
            {selectedModel && (
                <div className="px-3">
                    <Divider />
                    <CameraModelInfoCard
                        model={selectedModel}
                        onMoreDetails={() => setShowDetailModal(true)}
                    />
                </div>
            )}

            {showDetailModal && selectedModel && (
                <CameraModelDetailModal
                    model={selectedModel}
                    onClose={() => setShowDetailModal(false)}
                />
            )}

            {/* Always-visible button pinned at bottom */}
            <div className="p-3">
                {selectedModel && <Divider />}
                <PlaceCameraButton
                    disabled={selectedModel === null}
                    onClick={() => selectedModel && onPlaceCamera(selectedModel)}
                />
            </div>
        </div>
    )
}