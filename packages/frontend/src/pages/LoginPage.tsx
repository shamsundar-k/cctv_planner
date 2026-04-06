/*
 * FILE SUMMARY — src/pages/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
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
    <div className="min-h-screen flex items-center justify-center bg-canvas font-sans bg-gradient-to-br from-canvas via-card/60 to-canvas">

      {/* Decorative background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-30 bg-surface" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 bg-accent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-5 bg-muted" />
      </div>

      <div className="relative w-full max-w-md m-4">
        {/* Card */}
        <div className="backdrop-blur-2xl rounded-[2rem] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden bg-card/60 border border-surface/30">

          {/* Top accent stripe */}
          <div className="h-1.5 w-full bg-gradient-to-r from-accent via-muted to-surface" />

          <div className="p-10">
            {/* Logo + title */}
            <div className="flex flex-col items-center gap-4 mb-10">
              <div className="relative">
                <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 bg-accent" />
                <div className="relative p-4 rounded-2xl shadow-xl ring-1 ring-white/10 bg-gradient-to-br from-accent to-muted/80">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <rect x="2" y="7" width="14" height="10" rx="2" className="fill-primary" />
                    <path d="M16 10l5-3v10l-5-3V10z" className="fill-primary" />
                    <circle cx="9" cy="12" r="2" className="fill-card" />
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
                <p className="text-sm font-medium mt-1.5 tracking-wide text-muted">Welcome back — sign in to continue</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest pl-1 text-muted">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 bg-surface/10 border border-surface/30 text-primary focus:border-primary/60 focus:bg-surface/20"
                  placeholder="you@example.com"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-xs font-bold uppercase tracking-widest pl-1 text-muted">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 bg-surface/10 border border-surface/30 text-primary focus:border-primary/60 focus:bg-surface/20"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl px-4 py-4 text-base tracking-wide shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out bg-accent text-on-accent hover:bg-accent-hover hover:text-canvas"
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs mt-6 tracking-wide opacity-50 text-surface">
          CCTV Planner · Secure Access Portal
        </p>
      </div>
    </div>
  )
}

