import { useEffect } from 'react'
import type { CameraModel } from '../../api/cameramodel.types'

interface CameraModelDetailModalProps {
    model: CameraModel
    onClose: () => void
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFocalLength(min: number, max: number): string {
    return min === max ? `${min} mm` : `${min}–${max} mm`
}

function formatFov(min: number, max: number): string {
    return min === max ? `${min}°` : `${min}°–${max}°`
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SpecCell({ label, value }: { label: string; value: string }) {
    return (
        <div
            style={{ background: '#39304A', border: '1px solid #635C51' }}
            className="rounded px-2 py-1.5"
        >
            <p style={{ color: '#7D7461' }} className="mb-0.5 text-[10px] leading-none">
                {label}
            </p>
            <p style={{ color: '#B0A990' }} className="text-[12px] font-medium leading-tight">
                {value}
            </p>
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p
            style={{ color: '#635C51' }}
            className="mb-1 text-[9px] font-semibold uppercase tracking-widest"
        >
            {children}
        </p>
    )
}

function CameraIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="2" y="7" width="15" height="10" rx="2" />
            <path d="M17 9.5l4-2.5v10l-4-2.5" />
            <circle cx="9.5" cy="12" r="2" />
        </svg>
    )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export default function CameraModelDetailModal({ model, onClose }: CameraModelDetailModalProps) {
    useEffect(() => {
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [onClose])

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                style={{ background: '#202030', border: '1px solid #635C51' }}
                className="rounded-xl shadow-2xl w-[380px] max-h-[90vh] overflow-y-auto flex flex-col"
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div
                    style={{ borderBottom: '1px solid #635C51' }}
                    className="flex items-center gap-3 p-4"
                >
                    <div
                        style={{ background: '#39304A', color: '#7D7461' }}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded"
                    >
                        <CameraIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p
                            style={{ color: '#B0A990' }}
                            className="truncate text-[13px] font-semibold leading-tight"
                        >
                            {model.name}
                        </p>
                        <p style={{ color: '#7D7461' }} className="text-[11px] leading-snug">
                            {model.manufacturer}
                            <span style={{ color: '#635C51' }}> · </span>
                            {capitalize(model.camera_type)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ color: '#7D7461' }}
                        className="hover:text-[#B0A990] transition-colors p-1 rounded"
                        aria-label="Close"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-3">
                    {/* Optics */}
                    <div>
                        <SectionLabel>Optics</SectionLabel>
                        <div className="grid grid-cols-2 gap-1">
                            <SpecCell
                                label="Focal length"
                                value={formatFocalLength(model.focal_length_min, model.focal_length_max)}
                            />
                            <SpecCell label="Lens type" value={capitalize(model.lens_type)} />
                            <SpecCell label="H-FOV" value={formatFov(model.h_fov_min, model.h_fov_max)} />
                            <SpecCell label="V-FOV" value={formatFov(model.v_fov_min, model.v_fov_max)} />
                        </div>
                    </div>

                    {/* Sensor */}
                    <div>
                        <SectionLabel>Sensor</SectionLabel>
                        <div className="grid grid-cols-2 gap-1">
                            <SpecCell
                                label="Resolution"
                                value={`${model.resolution_h}×${model.resolution_v}`}
                            />
                            <SpecCell label="Megapixels" value={`${model.megapixels} MP`} />
                            <SpecCell
                                label="Sensor"
                                value={[model.sensor_size, capitalize(model.sensor_type)]
                                    .filter(Boolean)
                                    .join(' ')}
                            />
                            <SpecCell label="Aspect ratio" value={model.aspect_ratio} />
                        </div>
                    </div>

                    {/* IR range */}
                    {model.ir_range > 0 && (
                        <div>
                            <SectionLabel>Illumination</SectionLabel>
                            <div className="grid grid-cols-2 gap-1">
                                <SpecCell label="IR range" value={`${model.ir_range} m`} />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {model.notes && (
                        <div>
                            <SectionLabel>Notes</SectionLabel>
                            <p
                                style={{ color: '#B0A990', background: '#39304A', border: '1px solid #635C51' }}
                                className="rounded px-2 py-1.5 text-[12px] leading-relaxed"
                            >
                                {model.notes}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
