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

  /** Ocean blues — cool professional feel */
  ocean: {
    label: 'Ocean Depth',
    colors: {
      bgBase: '#0d1b2a',
      bgCard: '#1b2e45',
      surface: '#243d58',
      border: '#2e4a68',
      textPrimary: '#d4eaf7',
      textSecondary: '#7eb8d4',
      accent: '#1a6fa3',
      accentHover: '#4e9fd4',
      accentText: '#d4eaf7',
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


  /** Northern lights — dark navy with shimmering teal/cyan */
  aurora: {
    label: 'Aurora Borealis',
    colors: {
      bgBase: '#080e1a',
      bgCard: '#0d1e30',
      surface: '#163040',
      border: '#1e4d5c',
      textPrimary: '#c4f0e4',
      textSecondary: '#6ecfb8',
      accent: '#1e9e7a',
      accentHover: '#3ecfa0',
      accentText: '#080e1a',
    },
  },

  /** Warm sandy dunes & dark plum — huemint.com/gradient-9 palette 1 */
  desertRose: {
    label: 'Desert Rose',
    colors: {
      bgBase: '#3a1520',
      bgCard: '#572d1f',
      surface: '#6d4528',
      border: '#8c5b42',
      textPrimary: '#efded1',
      textSecondary: '#c59f8d',
      accent: '#a36a42',
      accentHover: '#bb8067',
      accentText: '#efded1',
    },
  },

  /** Muted mauve & smoky slate — huemint.com/gradient-9 palette 2 */
  smokyMauve: {
    label: 'Smoky Mauve',
    colors: {
      bgBase: '#262725',
      bgCard: '#4b3e42',
      surface: '#4f434d',
      border: '#706b67',
      textPrimary: '#dcdad2',
      textSecondary: '#b09b97',
      accent: '#a2675a',
      accentHover: '#a37f7e',
      accentText: '#dcdad2',
    },
  },

  /** Dark teal depths with terracotta fire — custom 9-colour palette */
  spiceAndTide: {
    label: 'Spice & Tide',
    colors: {
      bgBase: '#004343',
      bgCard: '#006464',
      surface: '#008585',
      border: '#74a892',
      textPrimary: '#fbf2c4',
      textSecondary: '#e5c185',
      accent: '#963e20',
      accentHover: '#c7522a',
      accentText: '#fbf2c4',
    },
  },
  /** Deep navy & teal with magenta/violet accent — cosmic 9-colour palette */
  nebula: {
    label: 'Nebula',
    colors: {
      bgBase: '#192a51',
      bgCard: '#0f4066',
      surface: '#0f5266',
      border: '#0f6466',
      textPrimary: '#ededed',
      textSecondary: '#e8c587',
      accent: '#660f64',
      accentHover: '#4b0f66',
      accentText: '#ededed',
    },
  },

  /** Charcoal, steel, and signal green — crisp control-room theme */
  graphiteSignal: {
    label: 'Graphite Signal',
    colors: {
      bgBase: '#101418',
      bgCard: '#1b2329',
      surface: '#263039',
      border: '#3a4852',
      textPrimary: '#edf2f4',
      textSecondary: '#9fb1bc',
      accent: '#20a46b',
      accentHover: '#39c685',
      accentText: '#07120d',
    },
  },

  /** Deep forest and mineral teal with clear mint actions */
  forestGrid: {
    label: 'Forest Grid',
    colors: {
      bgBase: '#071512',
      bgCard: '#12241f',
      surface: '#1d3730',
      border: '#31564c',
      textPrimary: '#e4f3ec',
      textSecondary: '#94c7b4',
      accent: '#2fb284',
      accentHover: '#5dd6aa',
      accentText: '#06130f',
    },
  },

  /** Ink black and violet-gray with an electric blue operator accent */
  midnightCircuit: {
    label: 'Midnight Circuit',
    colors: {
      bgBase: '#0b0d17',
      bgCard: '#171b2b',
      surface: '#242a42',
      border: '#3b4362',
      textPrimary: '#edf0ff',
      textSecondary: '#a2abc9',
      accent: '#4f8cff',
      accentHover: '#77a7ff',
      accentText: '#071026',
    },
  },

  /** Warm concrete neutrals with copper action states */
  copperStone: {
    label: 'Copper Stone',
    colors: {
      bgBase: '#181716',
      bgCard: '#282522',
      surface: '#37322d',
      border: '#574d43',
      textPrimary: '#f0e7dc',
      textSecondary: '#b9a795',
      accent: '#c66a31',
      accentHover: '#e18a55',
      accentText: '#1a0d06',
    },
  },

  /** Dark olive and slate with amber highlights for dense dashboards */
  oliveTerminal: {
    label: 'Olive Terminal',
    colors: {
      bgBase: '#10140f',
      bgCard: '#1d241b',
      surface: '#2b3328',
      border: '#46503e',
      textPrimary: '#edf2df',
      textSecondary: '#b4c09d',
      accent: '#d0a22f',
      accentHover: '#e6bd52',
      accentText: '#171204',
    },
  },

  /** High-contrast light theme for bright offices and print-like reports */
  daylightOps: {
    label: 'Daylight Ops',
    colors: {
      bgBase: '#f4f7f8',
      bgCard: '#ffffff',
      surface: '#e8eef1',
      border: '#c8d4da',
      textPrimary: '#172129',
      textSecondary: '#5c6f7a',
      accent: '#116d8c',
      accentHover: '#1687ad',
      accentText: '#ffffff',
    },
  },
} satisfies Record<string, Theme>

// ── Active theme ───────────────────────────────────────────────────────────────
/**
 * Change this string to switch the entire app's colour scheme.
 * Must be one of the keys in THEMES above.
 */
export const ACTIVE_THEME: ThemeKey = 'daylightOps'
