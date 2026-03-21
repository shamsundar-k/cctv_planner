/*
 * FILE SUMMARY — src/store/authSlice.ts
 *
 * Zustand auth store with localStorage persistence. Manages the currently
 * authenticated user's identity and JWT tokens.
 *
 * useAuthStore — The exported Zustand store hook. Holds the following state
 *   and actions:
 *
 *   State:
 *     user          — AuthUser | null. The logged-in user (id, email,
 *                     fullName, role). Null when unauthenticated.
 *     accessToken   — string | null. Short-lived JWT used in Authorization
 *                     headers.
 *     refreshToken  — string | null. Long-lived JWT used to obtain new access
 *                     tokens via the /auth/refresh endpoint.
 *
 *   Actions:
 *     setAuth(user, accessToken, refreshToken) — Sets all three auth fields at
 *       once. Called after a successful login or account creation.
 *     setAccessToken(accessToken) — Updates only the access token. Called
 *       after a silent refresh in the interceptor.
 *     setTokens(accessToken, refreshToken) — Updates both tokens. Called by
 *       the interceptor after a successful token refresh.
 *     clearAuth() — Resets user and both tokens to null. Called on logout or
 *       when a token refresh fails.
 *
 * Persistence: all three state fields are saved to localStorage under the key
 * "cctv-auth" via the Zustand persist middleware.
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void
  setAccessToken: (accessToken: string) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      clearAuth: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'cctv-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
)
