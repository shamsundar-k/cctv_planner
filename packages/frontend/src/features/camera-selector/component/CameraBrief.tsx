import type { CameraModel } from '../../../types/cameramodel.types'

const CAMERA_TYPE_LABEL: Record<CameraModel['camera_type'], string> = {
    fixed_dome: 'Fixed Dome',
    ptz: 'PTZ',
    bullet: 'Bullet',
}

interface Props {
    model: CameraModel
}

export default function CameraBrief({ model }: Props) {
    const fovLabel =
        model.h_fov_min === model.h_fov_max
            ? `${model.h_fov_min}°`
            : `${model.h_fov_min}–${model.h_fov_max}°`

    const focalLabel =
        model.focal_length_min === model.focal_length_max
            ? `${model.focal_length_min} mm`
            : `${model.focal_length_min} mm – ${model.focal_length_max} mm`

    return (
        <div className="rounded-xl border-2 border-border bg-surface/10 backdrop-blur-sm overflow-hidden">
            {/* Header strip */}
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-surface/20 bg-surface/10">
                <div className="flex items-center gap-2 min-w-0">

                    <span className="text-[11px] font-bold  tracking-[0.15em] text-muted ">
                        Manufacturer:
                    </span>
                    <span className="text-[11px] font-medium text-primary">
                        {model.manufacturer}
                    </span>
                </div>
                <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary shadow-sm">
                    {CAMERA_TYPE_LABEL[model.camera_type]}
                </span>
            </div>

            {/* Model  */}
            <div className="px-4 pt-3 pb-2.5">
                <p className="text-[13px] font-semibold text-primary leading-tight truncate">
                    <span className="text-muted">Model:</span> {model.model_number}
                </p>

            </div>

            {/* Spec grid */}
            <div className="px-4 pb-4 grid grid-cols-2 gap-x-4 gap-y-3">
                <Spec label="Resolution" value={`${model.resolution_h}×${model.resolution_v}`} sub={`${model.megapixels} MP`} />
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
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted">{label}</span>
            <span className="text-[12px] font-medium text-primary leading-tight">
                {value}
                {sub && <span className="text-muted ml-1">({sub})</span>}
            </span>
        </div>
    )
}
