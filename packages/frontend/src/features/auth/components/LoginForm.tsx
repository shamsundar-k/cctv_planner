import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../stores/authStore'
import FormField from './FormField'
import LoginErrorBanner from './LoginErrorBanner'
import { loginUser } from '../api/login'

export default function LoginForm() {
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
      const { user, accessToken, refreshToken } = await loginUser(email, password)
      setAuth(user, accessToken, refreshToken)
      navigate('/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 xl:gap-6">
      <FormField
        id="email"
        label="Email Address"
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        placeholder="you@example.com"
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
        placeholder="password"
      />

      {error && <LoginErrorBanner message={error} />}

      <button
        type="submit"
        disabled={loading}
        className="mt-1 rounded-lg bg-accent px-4 py-4 text-base font-bold tracking-wide text-on-accent shadow-lg shadow-black/10 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-accent-hover active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
