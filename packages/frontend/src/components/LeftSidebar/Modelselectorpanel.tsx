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
 *   Shadow Grey   #4F2A63  — panel bg
 *   Vintage Grape #8C6E9E  — inputs / surfaces
 *   Stone Brown   #804A38  — borders / dividers
 *   Grey Olive    #9E9A5A  — secondary text / icons
 *   Khaki Beige   #CADBBD  — primary text
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
            className="flex w-full items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-bold tracking-wide transition-all duration-300 border"
            style={disabled ? {
                background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
                color: 'color-mix(in srgb, var(--theme-surface) 60%, transparent)',
                borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
                cursor: 'not-allowed',
            } : {
                background: 'var(--theme-accent)',
                color: 'var(--theme-accent-text)',
                borderColor: 'transparent',
            }}
            onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent-hover)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-base)' } }}
            onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-accent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-accent-text)' } }}
        >
            <PlaceCameraIcon />
            Place camera
        </button>
    )
}

function PlaceCameraIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
        <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
                <div
                    key={i}
                    className="h-10 w-full animate-pulse rounded-lg"
                    style={{ background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
                />
            ))}
        </div>
    )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
    return <div className="my-1.5 h-px w-full" style={{ background: `linear-gradient(to right, transparent, color-mix(in srgb, var(--theme-surface) 40%, transparent), transparent)` }} />
}

// ── Panel heading ─────────────────────────────────────────────────────────────

function PanelHeading() {
    return (
        <div className="flex items-center gap-2 mb-1">
            <div className="h-4 w-1 rounded-full" style={{ background: 'var(--theme-text-primary)' }} />
            <h2 className="text-xs font-black uppercase tracking-[0.2em] relative top-0.5" style={{ color: 'var(--theme-text-primary)' }}>
                Camera Setup
            </h2>
        </div>
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
            className="flex h-full flex-col shadow-xl"
            style={{ background: 'var(--theme-bg-card)', borderRight: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
        >
            {/* Fixed: heading + filters */}
            <div className="p-4 flex flex-col gap-4">
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