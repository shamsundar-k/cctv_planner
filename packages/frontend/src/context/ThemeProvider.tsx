/**
 * ThemeProvider.tsx
 *
 * Reads ACTIVE_THEME from the themes config and injects all palette colours
 * as CSS custom properties on <html> so every component can reference them
 * via var(--theme-*) in Tailwind arbitrary-value classes.
 *
 * CSS variables injected:
 *   --theme-bg-base        deepest page background
 *   --theme-bg-card        card / panel background
 *   --theme-surface        input / muted surface (used as bg with opacity)
 *   --theme-border         border colour (used with opacity)
 *   --theme-text-primary   primary heading / value text
 *   --theme-text-secondary secondary / muted text
 *   --theme-accent         CTA button background
 *   --theme-accent-hover   CTA button hover background
 *   --theme-accent-text    text colour on top of CTA button
 *
 * Usage in components:
 *   className="bg-[var(--theme-bg-card)] text-[var(--theme-text-primary)]"
 *   style={{ borderColor: 'var(--theme-border)' }}
 */
import { useEffect } from 'react'
import { THEMES, ACTIVE_THEME } from '../config/themes'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const { colors } = THEMES[ACTIVE_THEME]
    const root = document.documentElement

    root.style.setProperty('--theme-bg-base',        colors.bgBase)
    root.style.setProperty('--theme-bg-card',        colors.bgCard)
    root.style.setProperty('--theme-surface',        colors.surface)
    root.style.setProperty('--theme-border',         colors.border)
    root.style.setProperty('--theme-text-primary',   colors.textPrimary)
    root.style.setProperty('--theme-text-secondary', colors.textSecondary)
    root.style.setProperty('--theme-accent',         colors.accent)
    root.style.setProperty('--theme-accent-hover',   colors.accentHover)
    root.style.setProperty('--theme-accent-text',    colors.accentText)
  }, [])

  return <>{children}</>
}
