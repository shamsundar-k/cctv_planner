/// <reference types="vite/client" />

/** Declares the virtual CSS module injected at build-time by the injectTheme
 *  Vite plugin (see vite.config.ts). It exports nothing — it is imported
 *  purely for its side-effect of installing :root CSS custom properties. */
declare module 'virtual:theme-vars' {}
