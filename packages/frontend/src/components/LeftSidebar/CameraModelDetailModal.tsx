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
            className="rounded-xl px-4 py-3 shadow-sm"
            style={{ background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
        >
            <p className="font-bold uppercase tracking-wider mb-1 text-[11px] leading-none" style={{ color: 'var(--theme-text-secondary)' }}>
                {label}
            </p>
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--theme-text-primary)' }}>
                {value}
            </p>
        </div>
    )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-2 mt-2 text-xs font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-secondary)' }}>
            {children}
        </p>
    )
}

function CameraIcon() {
    return (
        <svg
            width="24"
            height="24"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999]"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div
                className="rounded-2xl shadow-2xl w-[520px] max-h-[90vh] overflow-y-auto flex flex-col m-4"
                style={{ background: `linear-gradient(135deg, var(--theme-bg-card), color-mix(in srgb, var(--theme-bg-base) 60%, var(--theme-bg-card)))`, border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)' }}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <div
                    className="flex items-center gap-4 p-6 border-b"
                    style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)', background: 'color-mix(in srgb, var(--theme-surface) 5%, transparent)' }}
                >
                    <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl shadow-inner"
                        style={{ background: 'color-mix(in srgb, var(--theme-accent) 90%, transparent)', color: 'var(--theme-text-primary)' }}
                    >
                        <CameraIcon />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xl font-bold leading-tight mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                            {model.name}
                        </p>
                        <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--theme-text-secondary)' }}>
                            {model.manufacturer}
                            <span className="mx-2" style={{ color: 'var(--theme-accent)' }}>·</span>
                            {capitalize(model.camera_type)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="transition-colors p-2 rounded-full"
                        style={{ color: 'var(--theme-text-secondary)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-text-secondary)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
                        aria-label="Close"
                    >
                        <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex flex-col gap-6">
                    {/* Optics */}
                    <div>
                        <SectionLabel>Optics</SectionLabel>
                        <div className="grid grid-cols-2 gap-3">
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
                        <div className="grid grid-cols-2 gap-3">
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
                            <div className="grid grid-cols-2 gap-3">
                                <SpecCell label="IR range" value={`${model.ir_range} m`} />
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {model.notes && (
                        <div>
                            <SectionLabel>Notes</SectionLabel>
                            <p
                                className="rounded-xl px-4 py-3 text-sm leading-relaxed shadow-sm"
                                style={{ background: 'color-mix(in srgb, var(--theme-surface) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)', color: 'var(--theme-text-primary)' }}
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
