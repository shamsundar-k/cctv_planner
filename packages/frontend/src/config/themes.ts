/**
 * themes.ts — Central colour-theme configuration for CCTV Planner.
 *
 * ─── HOW TO USE ───────────────────────────────────────────────────────────
 *  1. Pick an existing theme from THEMES below, or add a new one.
 *  2. Set ACTIVE_THEME to the theme key you want (e.g. 'vintage').
 *  3. Components never import colours directly — they use CSS custom
 *     properties (var(--theme-*)) that ThemeProvider injects at runtime.
 *
 * ─── HOW TO ADD A NEW THEME ───────────────────────────────────────────────
 *  1. Add an entry to the THEMES object with a unique key.
 *  2. Fill in all 8 colour slots (see Theme type below).
 *  3. Change ACTIVE_THEME to your new key.
 * ────────────────────────────────────────────────────────────────────────────
 */

export interface Theme {
  /** Human-readable label shown in UI pickers */
  label: string
  colors: {
    /** Deepest page background */
    bgBase: string
    /** Card / panel background (slightly lighter than bgBase) */
    bgCard: string
    /** Input / surface background (semi-transparent overlay) */
    surface: string
    /** Border colour for cards, inputs, dividers */
    border: string
    /** Primary readable text (headings, values) */
    textPrimary: string
    /** Secondary / muted text (labels, metadata, placeholders) */
    textSecondary: string
    /** Primary call-to-action / accent colour (buttons, highlights) */
    accent: string
    /** Accent colour on hover (often a lighter sibling of accent) */
    accentHover: string
    /** Text colour placed ON TOP of the accent button */
    accentText: string
  }
}

export type ThemeKey = keyof typeof THEMES

// ── Theme definitions ──────────────────────────────────────────────────────────

export const THEMES = {
  /** Purple / Sage / Terracotta — current default */
  vintage: {
    label: 'Vintage Dusk',
    colors: {
      bgBase: '#2a1535',
      bgCard: '#4F2A63',
      surface: '#8C6E9E',
      border: '#8C6E9E',
      textPrimary: '#CADBBD',
      textSecondary: '#9E9A5A',
      accent: '#804A38',
      accentHover: '#9E9A5A',
      accentText: '#CADBBD',
    },
  },

  /** Ocean blues — cool professional feel */
  ocean: {
    label: 'Ocean Depth',
    colors: {
      bgBase: '#0d1b2a',
      bgCard: '#1b2e45',
      surface: '#2e4a68',
      border: '#2e4a68',
      textPrimary: '#d4eaf7',
      textSecondary: '#7eb8d4',
      accent: '#1a6fa3',
      accentHover: '#4e9fd4',
      accentText: '#d4eaf7',
    },
  },

  /** Forest greens — earthy and calm */
  forest: {
    label: 'Forest Mist',
    colors: {
      bgBase: '#0d1f12',
      bgCard: '#1a3320',
      surface: '#2d5037',
      border: '#3a6645',
      textPrimary: '#c8e6c4',
      textSecondary: '#87b88a',
      accent: '#4a7c59',
      accentHover: '#6ea87e',
      accentText: '#c8e6c4',
    },
  },

  /** Warm amber / charcoal — rich dark mode */
  ember: {
    label: 'Ember & Ash',
    colors: {
      bgBase: '#1a1208',
      bgCard: '#2d2010',
      surface: '#4a3520',
      border: '#6b4d28',
      textPrimary: '#f2e0bc',
      textSecondary: '#c4974a',
      accent: '#c4740a',
      accentHover: '#e89030',
      accentText: '#1a1208',
    },
  },

  /** Slate / Rose — modern minimal with a pop of colour */
  rose: {
    label: 'Moonrise Rose',
    colors: {
      bgBase: '#141018',
      bgCard: '#221a2e',
      surface: '#3a2d4a',
      border: '#4a3860',
      textPrimary: '#f0e8f5',
      textSecondary: '#c4a8d8',
      accent: '#a0406a',
      accentHover: '#d46090',
      accentText: '#f0e8f5',
    },
  },
} satisfies Record<string, Theme>

// ── Active theme ───────────────────────────────────────────────────────────────
/**
 * Change this string to switch the entire app's colour scheme.
 * Must be one of the keys in THEMES above.
 */
export const ACTIVE_THEME: ThemeKey = 'vintage'
