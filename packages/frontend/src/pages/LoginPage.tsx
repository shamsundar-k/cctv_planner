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
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-sm bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-8">
        {/* Logo + title */}
        <div className="flex items-center gap-2.5 mb-8">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect x="2" y="7" width="14" height="10" rx="2" fill="#60a5fa" />
            <path d="M16 10l5-3v10l-5-3V10z" fill="#60a5fa" />
            <circle cx="9" cy="12" r="2" fill="#ffffff" />
          </svg>
          <h1 className="text-xl font-bold text-slate-100">CCTV Planner</h1>
        </div>

        <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
