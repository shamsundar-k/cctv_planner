/**
 * ManufacturerFilter
 *
 * Palette:
 *   Shadow Grey   #202030  — deepest bg
 *   Vintage Grape #8C6E9E  — surface / input bg
 *   Stone Brown   #804A38  — borders
 *   Grey Olive    #9E9A5A  — secondary text / icons
 *   Khaki Beige   #CADBBD  — primary text
 */

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
            <label className="text-[10px] font-bold uppercase tracking-widest pl-1" style={{ color: 'var(--theme-text-secondary)' }}>
                Manufacturer
            </label>
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                className="w-full rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-all backdrop-blur-sm cursor-pointer"
                style={{
                    color: 'var(--theme-text-primary)',
                    background: 'color-mix(in srgb, var(--theme-surface) 20%, transparent)',
                    border: '1px solid color-mix(in srgb, var(--theme-surface) 30%, transparent)',
                }}
            >
                <option value="" style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}>All manufacturers</option>
                {manufacturers.map((m) => (
                    <option key={m} value={m} style={{ background: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)' }}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    )
}