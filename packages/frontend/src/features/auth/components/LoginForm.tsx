import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { PrimaryButton } from '@/components/Buttons'
import { useAuthStore } from '../stores/authStore'
import FormField from './FormField'
import LoginErrorBanner from './LoginErrorBanner'
import ForgotPasswordDialog from './ForgotPasswordDialog'
import { loginUser } from '../api/login'

export default function LoginForm() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user, accessToken, refreshToken } = await loginUser(email, password)
      setAuth(user, accessToken, refreshToken)
      navigate(user.mustChangePassword ? '/change-password' : '/')
    } catch {
      setError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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

        <button
          type="button"
          onClick={() => setForgotPasswordOpen(true)}
          className="-mt-2 self-end cursor-pointer border-0 bg-transparent p-0 text-sm font-semibold text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Forgot password?
        </button>

        {error && <LoginErrorBanner message={error} />}

        <PrimaryButton
          type="submit"
          loading={loading}
          size="xlarge"
          fullWidth
          className="mt-1 tracking-wide shadow-lg shadow-black/10 active:bg-primary"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </PrimaryButton>
      </form>

      {forgotPasswordOpen && (
        <ForgotPasswordDialog
          initialEmail={email}
          onClose={() => setForgotPasswordOpen(false)}
        />
      )}
    </>
  )
}
