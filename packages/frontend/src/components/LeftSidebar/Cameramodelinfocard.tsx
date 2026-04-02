import type { CameraModel } from '../../api/cameramodel.types'

interface CameraModelInfoCardProps {
    model: CameraModel | null
    onMoreDetails: () => void
}

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
            style={{ background: '#202030', border: '1px solid #635C51' }}
            className="rounded-lg p-2.5"
        >
            {/* Header */}
            <div
                style={{ borderBottom: '1px solid #635C51' }}
                className="mb-2.5 flex items-center gap-2 pb-2.5"
            >
                <div
                    style={{ background: '#39304A', color: '#7D7461' }}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
                >
                    <CameraIcon />
                </div>
                <div className="min-w-0">
                    <p
                        style={{ color: '#B0A990' }}
                        className="truncate text-[12px] font-semibold leading-tight"
                    >
                        {model.name}
                    </p>
                    <p style={{ color: '#7D7461' }} className="text-[11px] leading-snug">
                        {model.manufacturer}
                        <span style={{ color: '#635C51' }}> · </span>
                        {capitalize(model.camera_type)}
                    </p>
                </div>
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-1 mb-2.5">
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
                style={{ color: '#7D7461', border: '1px solid #635C51' }}
                className="w-full rounded px-2 py-1 text-[11px] hover:text-[#B0A990] hover:border-[#7D7461] transition-colors text-center"
            >
                More details →
            </button>
        </div>
    )
}
