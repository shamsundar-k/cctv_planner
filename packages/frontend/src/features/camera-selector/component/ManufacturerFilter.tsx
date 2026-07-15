interface ManufacturerFilterProps {
    manufacturers: string[]
    selected: string
    onSelect: (manufacturer: string) => void
}

export default function ManufacturerFilter({
    manufacturers,
    selected,
    onSelect,
}: ManufacturerFilterProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="pl-1 text-[10px] font-bold uppercase text-text-muted">
                Manufacturer
            </label>
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full cursor-pointer rounded-lg border border-panel-border bg-background px-3 py-2 text-[13px] font-medium text-text-primary outline-none transition-colors hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
                <option value="" className="bg-panel text-text-primary">All manufacturers</option>
                {manufacturers.map((m) => (
                    <option key={m} value={m} className="bg-panel text-text-primary">
                        {m}
                    </option>
                ))}
            </select>
        </div>
    )
}
