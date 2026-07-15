import type { CameraSpecRecord } from '@/types/camera'

const CAMERA_TYPE_LABEL: Record<CameraSpecRecord['camera_type'], string> = {
    dome: 'Dome',
    ptz: 'PTZ',
    bullet: 'Bullet',
}

interface Props {
    model: CameraSpecRecord
}

export default function CameraBrief({ model }: Props) {
    const hFov = model.lens_spec.h_fov
    const focalLength = model.lens_spec.focal_length
    const resolution = model.sensor_spec.resolution
    const fovLabel =
        hFov.min === hFov.max
            ? `${hFov.min}°`
            : `${hFov.min}–${hFov.max}°`

    const focalLabel =
        focalLength.min === focalLength.max
            ? `${focalLength.min} mm`
            : `${focalLength.min} mm – ${focalLength.max} mm`

    return (
        <div className="overflow-hidden rounded-lg border border-panel-border bg-background">
            {/* Header strip */}
            <div className="flex items-center justify-between gap-2 border-b border-panel-border bg-panel px-4 py-2.5">
                <div className="flex items-center gap-2 min-w-0">

                    <span className="text-[11px] font-bold text-text-muted">
                        Manufacturer:
                    </span>
                    <span className="text-[11px] font-medium text-text-primary">
                        {model.manufacturer}
                    </span>
                </div>
                <span className="shrink-0 rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[8px] font-bold uppercase text-primary">
                    {CAMERA_TYPE_LABEL[model.camera_type]}
                </span>
            </div>

            {/* Model  */}
            <div className="px-4 pt-3 pb-2.5">
                <p className="truncate text-[13px] font-semibold leading-tight text-text-primary">
                    <span className="text-text-muted">Model:</span> {model.model}
                </p>

            </div>

            {/* Spec grid */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <Spec
                    label="Resolution"
                    value={`${resolution.horizontal}×${resolution.vertical}`}
                    sub={model.sensor_spec.megapixel ? `${model.sensor_spec.megapixel} MP` : undefined}
                />
                <Spec label="H-FOV" value={fovLabel} />
                <Spec label="Focal length" value={focalLabel} />
                <Spec label="IR range" value={`${model.ir_range} m`} />
            </div>
        </div>
    )
}

function Spec({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase text-text-muted">{label}</span>
            <span className="text-[12px] font-medium leading-tight text-text-primary">
                {value}
                {sub && <span className="ml-1 text-text-muted">({sub})</span>}
            </span>
        </div>
    )
}
