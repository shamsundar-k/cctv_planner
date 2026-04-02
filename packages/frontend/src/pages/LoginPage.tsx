/*
 * FILE SUMMARY — src/pages/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
 *
 * LoginPage() — Renders a centred card with:
 *   - App logo and brand name.
 *   - Email and password inputs with autocomplete hints.
 *   - An inline error message when credentials are invalid.
 *   - A "Sign in" button that is disabled while the request is in flight.
 *
 * handleSubmit(e) — Submits the credentials to POST /auth/login via the Axios
 *   client. On success:
 *     • Decodes the returned access_token using decodeJwt() to extract the
 *       user's id and role without an extra API call.
 *     • Calls setAuth() on the Zustand auth store to persist the user and both
 *       tokens.
 *     • Navigates to the dashboard (/).
 *   On failure, sets an "Invalid email or password." error message.
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import client from '../api/interceptors'
import { useAuthStore } from '../store/authSlice'
import { decodeJwt } from '../utils/jwt'
import type { AuthUser } from '../store/authSlice'

interface TokenResponse {
  access_token: string
  refresh_token: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data } = await client.post<TokenResponse>('/auth/login', {
        email,
        password,
      })

      const payload = decodeJwt(data.access_token)
      const user: AuthUser = {
        id: payload.sub,
        email,
        fullName: '',
        role: payload.role as AuthUser['role'],
      }

      setAuth(user, data.access_token, data.refresh_token)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#336293] via-[#4B4DAD] to-[#4E8AC6] font-sans">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20 p-10 m-4">
        {/* Logo + title */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="p-4 bg-gradient-to-tr from-[#4E8AC6] to-[#7DB9DB] rounded-2xl shadow-lg ring-1 ring-white/30">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect x="2" y="7" width="14" height="10" rx="2" fill="#C5ECF0" />
              <path d="M16 10l5-3v10l-5-3V10z" fill="#C5ECF0" />
              <circle cx="9" cy="12" r="2" fill="#336293" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#C5ECF0] to-[#ffffff] tracking-tight">CCTV Planner</h1>
          <p className="text-[#C5ECF0]/80 text-sm font-medium">Welcome back, please sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-semibold text-[#C5ECF0]">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-[#336293]/40 border border-[#7DB9DB]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-[#7DB9DB]/60 focus:outline-none focus:border-[#C5ECF0] focus:ring-1 focus:ring-[#C5ECF0] transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-[#C5ECF0]">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-[#336293]/40 border border-[#7DB9DB]/40 rounded-xl px-4 py-3 text-sm text-white placeholder-[#7DB9DB]/60 focus:outline-none focus:border-[#C5ECF0] focus:ring-1 focus:ring-[#C5ECF0] transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-100 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-3 backdrop-blur-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 bg-[#C5ECF0] hover:bg-white text-[#336293] disabled:opacity-70 disabled:cursor-not-allowed font-bold rounded-xl px-4 py-3.5 text-base shadow-[0_4px_14px_0_rgba(197,236,240,0.39)] hover:shadow-[0_6px_20px_rgba(197,236,240,0.5)] hover:-translate-y-0.5 transition-all duration-200 ease-in-out"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

