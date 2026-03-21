/*
 * FILE SUMMARY — src/components/admin/SearchInput.tsx
 *
 * Controlled text input decorated with a search icon, used in admin tab panels.
 *
 * SearchInput({ value, onChange, placeholder }) — Renders a container div
 *   with a magnifying-glass emoji positioned absolutely on the left of the
 *   input field. The input itself is fully controlled:
 *   - `value` reflects the current search string from the parent.
 *   - `onChange(v)` is called with the new string on every keystroke,
 *     allowing the parent to debounce or filter as needed.
 *   - `placeholder` sets the hint text when the input is empty.
 *
 * Used in UsersTab (search by name/email) and ProjectsTab (search by project
 * name). The parent component is responsible for debouncing and filtering.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative max-w-[360px] w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base pointer-events-none">
        🔍
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-slate-100 outline-none placeholder:text-slate-600 box-border"
      />
    </div>
  )
}
