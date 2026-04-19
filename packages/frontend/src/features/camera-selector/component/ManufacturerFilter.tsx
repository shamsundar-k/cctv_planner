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
            <label className="text-[10px] font-bold uppercase tracking-widest pl-1 text-muted">
                Manufacturer
            </label>
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-all backdrop-blur-sm cursor-pointer text-primary bg-surface/20 border border-surface/30"
            >
                <option value="" className="bg-card text-primary">All manufacturers</option>
                {manufacturers.map((m) => (
                    <option key={m} value={m} className="bg-card text-primary">
                        {m}
                    </option>
                ))}
            </select>
        </div>
    )
}
