import { Palette } from 'lucide-react'
import { themeOptions, type Theme } from '../../../styles/theme'
import { useTheme } from '../../../styles/useTheme'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      <Palette size={17} aria-hidden="true" className="shrink-0 text-muted" />
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        aria-label="Select theme"
        className="h-9 w-36 cursor-pointer rounded-lg border border-surface/30 bg-surface/10 px-3 pr-8 text-sm font-medium text-primary outline-none transition-colors hover:bg-surface/20 hover:text-primary focus:border-accent focus:ring-1 focus:ring-accent"
      >
        {themeOptions.map((item) => (
          <option key={item.id} value={item.id} className="bg-card text-primary">
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
