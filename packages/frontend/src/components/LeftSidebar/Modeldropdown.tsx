/**
 * ModelDropdown
 *
 * Controlled dropdown listing CameraModel options.
 * Emits the full CameraModel object (or null) via onSelect.
 */
import type { CameraModel } from '../../api/cameramodel.types'

interface ModelDropdownProps {
    models: CameraModel[]
    selected: CameraModel | null
    onSelect: (model: CameraModel | null) => void
}

export default function ModelDropdown({
    models,
    selected,
    onSelect,
}: ModelDropdownProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const model = models.find((m) => m.id === e.target.value) ?? null
        onSelect(model)
    }

    return (
        <div className="flex flex-col gap-1">
            <label
                style={{ color: '#7D7461' }}
                className="text-[10px] font-medium uppercase tracking-widest"
            >
                Model
            </label>
            <select
                value={selected?.id ?? ''}
                onChange={handleChange}
                disabled={models.length === 0}
                style={{
                    background: '#39304A',
                    border: '1px solid #635C51',
                    color: '#B0A990',
                }}
                className="
          w-full rounded px-2.5 py-1.5 text-[13px]
          outline-none transition-colors
          focus:border-[#7D7461] focus:ring-1 focus:ring-[#7D7461]
          disabled:cursor-not-allowed disabled:opacity-40
        "
            >
                <option value="" style={{ background: '#39304A' }}>
                    Select a model
                </option>
                {models.map((m) => (
                    <option key={m.id} value={m.id} style={{ background: '#39304A' }}>
                        {m.name}
                    </option>
                ))}
            </select>
        </div>
    )
}