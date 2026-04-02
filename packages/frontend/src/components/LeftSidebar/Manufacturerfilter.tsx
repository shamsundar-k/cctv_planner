/**
 * ManufacturerFilter
 *
 * Palette:
 *   Shadow Grey   #202030  — deepest bg
 *   Vintage Grape #39304A  — surface / input bg
 *   Stone Brown   #635C51  — borders
 *   Grey Olive    #7D7461  — secondary text / icons
 *   Khaki Beige   #B0A990  — primary text
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
        <div className="flex flex-col gap-1">
            <label
                style={{ color: '#7D7461' }}
                className="text-[10px] font-medium uppercase tracking-widest"
            >
                Manufacturer
            </label>
            <select
                value={selected}
                onChange={(e) => onSelect(e.target.value)}
                style={{
                    background: '#39304A',
                    border: '1px solid #635C51',
                    color: '#B0A990',
                }}
                className="
          w-full rounded px-2.5 py-1.5 text-[13px]
          outline-none transition-colors
          focus:border-[#7D7461] focus:ring-1 focus:ring-[#7D7461]
        "
            >
                <option value="">All manufacturers</option>
                {manufacturers.map((m) => (
                    <option key={m} value={m} style={{ background: '#39304A' }}>
                        {m}
                    </option>
                ))}
            </select>
        </div>
    )
}