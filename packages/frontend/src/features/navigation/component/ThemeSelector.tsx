import { ChevronDown, Palette } from 'lucide-react'
import { themeOptions, type Theme } from '../../../styles/theme'
import { useTheme } from '../../../styles/useTheme'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-2 text-sm text-text-muted">
      <Palette size={17} aria-hidden="true" className="shrink-0 text-text-muted" />
      <span className="sr-only">Theme</span>
      <span className="relative block">
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
          aria-label="Select theme"
          className="h-9 w-36 cursor-pointer appearance-none rounded-lg border border-panel-border bg-background px-3 pr-9 text-sm font-medium text-text-primary outline-none transition-colors hover:border-primary focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          {themeOptions.map((item) => (
            <option key={item.id} value={item.id} className="bg-panel text-text-primary">
              {item.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </span>
    </label>
  )
}
