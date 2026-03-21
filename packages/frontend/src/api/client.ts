/*
 * FILE SUMMARY — src/api/client.ts
 *
 * Creates and exports the shared Axios HTTP client instance used throughout
 * the application.
 *
 * client (default export) — An Axios instance configured with:
 *   - baseURL: resolved from the VITE_API_BASE_URL environment variable, or
 *     falls back to "/api/v1" (which the Vite dev-server proxy forwards to the
 *     FastAPI backend on port 8000).
 *   - Default Content-Type header set to "application/json".
 *
 * All API hooks and service functions import this client and call methods on it
 * (client.get, client.post, etc.). The interceptors module attaches JWT
 * Authorization headers and the token-refresh logic on top of this instance.
 */
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default client
