import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import client from '../api/interceptors'
import { useAuthStore } from '../store/authSlice'
import { decodeJwt } from '../utils/jwt'
import type { AuthUser } from '../store/authSlice'

interface InvitePreview {
  email: string
  expires_at: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
}

type Stage = 'loading' | 'invalid' | 'form' | 'submitting'

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const token = searchParams.get('token') ?? ''

  const [stage, setStage] = useState<Stage>('loading')
  const [preview, setPreview] = useState<InvitePreview | null>(null)
  const [invalidMsg, setInvalidMsg] = useState('')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  // Step 1 — validate token on mount
  useEffect(() => {
    if (!token) {
      setInvalidMsg('No invite token found in the URL.')
      setStage('invalid')
      return
    }

    client
      .get<InvitePreview>(`/auth/accept-invite?token=${encodeURIComponent(token)}`)
      .then(({ data }) => {
        setPreview(data)
        setStage('form')
      })
      .catch(() => {
        setInvalidMsg('This invite link is invalid or has expired.')
        setStage('invalid')
      })
  }, [token])

  // Step 2 — submit registration
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }

    setStage('submitting')

    try {
      const { data } = await client.post<TokenResponse>('/auth/accept-invite', {
        token,
        full_name: fullName,
        password,
      })

      const payload = decodeJwt(data.access_token)
      const user: AuthUser = {
        id: payload.sub,
        email: preview!.email,
        fullName,
        role: payload.role as AuthUser['role'],
      }

      setAuth(user, data.access_token, data.refresh_token)
      navigate('/')
    } catch {
      setFormError('Registration failed. The invite may have already been used.')
      setStage('form')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Create your account
        </h1>

        {stage === 'loading' && (
          <p className="text-sm text-gray-500 mt-4">Validating invite…</p>
        )}

        {stage === 'invalid' && (
          <p className="text-sm text-red-600 mt-4">{invalidMsg}</p>
        )}

        {(stage === 'form' || stage === 'submitting') && preview && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={preview.email}
                disabled
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}

            <button
              type="submit"
              disabled={stage === 'submitting'}
              className="mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg px-4 py-2 text-sm transition-colors"
            >
              {stage === 'submitting' ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
