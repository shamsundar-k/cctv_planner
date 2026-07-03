/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { THEMES, ACTIVE_THEME } from './src/config/themes';
import path from 'path';
/** Injects the active theme's colour values as CSS custom properties on :root
 *  directly into the HTML <head> as an inline <style> tag so no virtual module
 *  is needed. This avoids conflicts with @tailwindcss/vite's internal CSS resolver. */
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
function injectTheme() {
  const {
    colors
  } = THEMES[ACTIVE_THEME];
  const css = `:root {
  --theme-bg-base:        ${colors.bgBase};
  --theme-bg-card:        ${colors.bgCard};
  --theme-surface:        ${colors.surface};
  --theme-border:         ${colors.border};
  --theme-text-primary:   ${colors.textPrimary};
  --theme-text-secondary: ${colors.textSecondary};
  --theme-accent:         ${colors.accent};
  --theme-accent-hover:   ${colors.accentHover};
  --theme-accent-text:    ${colors.accentText};
}`;
  return {
    name: 'inject-theme',
    enforce: 'pre' as const,
    transformIndexHtml() {
      return [{
        tag: 'style',
        attrs: {
          id: 'theme-vars'
        },
        children: css,
        injectTo: 'head-prepend' as const
      }];
    }
  };
}
export default defineConfig({
  plugins: [injectTheme(), react(), tailwindcss()],
  resolve: {
    alias: {
      // Maps '@' to the 'src' directory relative to the config file
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true
      }
    }
  },
  test: {
    projects: [{
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});