import type { CameraModel } from '../../api/cameramodel.types'

interface CameraModelInfoCardProps {
    model: CameraModel | null
    onMoreDetails: () => void
}

function SpecCell({ label, value }: { label: string; value: string }) {
    return (
        <div
            className="rounded-lg px-2.5 py-2"
            style={{
                background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
                border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)',
            }}
        >
            <p className="font-bold uppercase tracking-wider mb-0.5 text-[9px] leading-none" style={{ color: 'var(--theme-text-secondary)' }}>
                {label}
            </p>
            <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--theme-text-primary)' }}>
                {value}
            </p>
        </div>
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

function formatFocalLength(min: number, max: number): string {
    return min === max ? `${min} mm` : `${min}–${max} mm`
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function CameraModelInfoCard({ model, onMoreDetails }: CameraModelInfoCardProps) {
    if (!model) return null

    return (
        <div
            className="rounded-xl p-3 shadow-lg"
            style={{
                background: `linear-gradient(to bottom, color-mix(in srgb, var(--theme-surface) 10%, transparent), transparent)`,
                border: '1px solid color-mix(in srgb, var(--theme-surface) 20%, transparent)',
            }}
        >
            {/* Header */}
            <div
                className="mb-3 flex items-center gap-3 pb-3 border-b"
                style={{ borderColor: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
            >
                <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-inner"
                    style={{ background: 'color-mix(in srgb, var(--theme-accent) 80%, transparent)', color: 'var(--theme-text-primary)' }}
                >
                    <CameraIcon />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold leading-tight" style={{ color: 'var(--theme-text-primary)' }}>
                        {model.name}
                    </p>
                    <p className="text-[11px] font-semibold leading-snug tracking-wide mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
                        {model.manufacturer}
                        <span className="mx-1" style={{ color: 'var(--theme-accent)' }}>·</span>
                        {capitalize(model.camera_type)}
                    </p>
                </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
                <SpecCell
                    label="Resolution"
                    value={`${model.resolution_h}×${model.resolution_v}`}
                />
                <SpecCell label="Megapixels" value={`${model.megapixels} MP`} />
                <SpecCell
                    label="Focal length"
                    value={formatFocalLength(model.focal_length_min, model.focal_length_max)}
                />
            </div>

            {/* More details */}
            <button
                onClick={onMoreDetails}
                className="w-full text-center font-bold tracking-wider rounded-lg px-3 py-2 transition-all text-[11px] uppercase shadow-sm"
                style={{ color: 'var(--theme-text-primary)', background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--theme-text-primary)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-bg-card)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'color-mix(in srgb, var(--theme-surface) 20%, transparent)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--theme-text-primary)' }}
            >
                More details →
            </button>
        </div>
    )
}

