import type { CameraSpecRecord } from '@/types/camera'

interface ModelDropdownProps {
    models: CameraSpecRecord[]
    selected: CameraSpecRecord | null
    onSelect: (model: CameraSpecRecord | null) => void
}

export default function ModelDropdown({ models, selected, onSelect }: ModelDropdownProps) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const model = models.find((m) => m.id === e.target.value) ?? null
        onSelect(model)
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label className="pl-1 text-[10px] font-bold uppercase text-text-muted">
                Model
            </label>
            <select
                value={selected?.id ?? ''}
                onChange={handleChange}
                disabled={models.length === 0}
                className="w-full cursor-pointer rounded-lg border border-panel-border bg-background px-3 py-2 text-[13px] font-medium text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-foreground"
            >
                <option value="" className="bg-panel text-text-primary">Select a model</option>
                {models.map((m) => (
                    <option key={m.id} value={m.id} className="bg-panel text-text-primary">
                        {m.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
