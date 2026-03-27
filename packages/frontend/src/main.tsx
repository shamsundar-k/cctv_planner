/*
 * FILE SUMMARY — src/main.tsx
 *
 * Application bootstrap entry point. Creates the React root and mounts the app
 * into the DOM element with id="root".
 *
 * Key responsibilities:
 *   - Instantiates a shared TanStack Query `QueryClient` used for all server-
 *     state caching throughout the app (default stale/retry settings apply).
 *   - Wraps the app in <StrictMode> to surface potential issues during
 *     development.
 *   - Wraps the app in <QueryClientProvider> so every component can access the
 *     shared QueryClient via hooks.
 *   - Imports `./api/interceptors` as a side-effect, which registers the Axios
 *     JWT request/response interceptors before any API call is made.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import './api/interceptors'
import App from './App.tsx'
import { queryClient } from './queryClient'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
