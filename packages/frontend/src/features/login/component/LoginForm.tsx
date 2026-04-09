import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuthStore } from '../../../store/authSlice'
import FormField from './FormField'
import LoginErrorBanner from './LoginErrorBanner'
import LoginSubmitButton from './LoginSubmitButton'
import { loginUser } from '../api/api'

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        placeholder="••••••••"
      />

      {error && <LoginErrorBanner message={error} />}

      <LoginSubmitButton loading={loading} />
    </form>
  )
}
