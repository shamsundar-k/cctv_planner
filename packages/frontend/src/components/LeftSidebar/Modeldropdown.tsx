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
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-secondary)' }}>
                Model
            </label>
            <select
                value={selected?.id ?? ''}
                onChange={handleChange}
                disabled={models.length === 0}
                className="w-full rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-all backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed enabled:cursor-pointer"
                style={{
                    color: 'var(--theme-text-primary)',
                    background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                }}
            >
                <option value="" style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}>
                    Select a model
                </option>
                {models.map((m) => (
                    <option key={m.id} value={m.id} style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}>
                        {m.name}
                    </option>
                ))}
            </select>
        </div>
    )
}