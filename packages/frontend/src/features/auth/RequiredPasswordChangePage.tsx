import { Camera, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SecondaryButton } from '@/components/Buttons'
import LoginCard from './components/LoginCard'
import PasswordChangeForm from './components/PasswordChangeForm'
import { useAuthStore } from './stores/authStore'

export default function RequiredPasswordChangePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)

  function handleChanged(accessToken: string, refreshToken: string) {
    if (!user) return
    setAuth(
      { ...user, mustChangePassword: false },
      accessToken,
      refreshToken,
    )
    navigate('/', { replace: true })
  }

  function handleSignOut() {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-dvh bg-background p-4 font-sans text-text-primary sm:p-6">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-5xl flex-col sm:min-h-[calc(100dvh-3rem)]">
        <header className="flex items-center justify-between gap-4 py-2">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-camera-marker text-camera-marker-foreground">
              <Camera className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold">CCTV Planner</span>
          </div>
          <SecondaryButton
            type="button"
            variant="ghost"
            leadingIcon={<LogOut className="size-4" aria-hidden="true" />}
            onClick={handleSignOut}
          >
            Sign out
          </SecondaryButton>
        </header>

        <section className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-xl">
            <LoginCard>
              <div className="mb-7 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/25">
                  <KeyRound className="size-7" aria-hidden="true" />
                </span>
                <h1 className="mb-0 mt-5 text-3xl font-semibold tracking-tight">
                  Choose a new password
                </h1>
                <p className="mb-0 mt-3 text-base leading-7 text-text-secondary">
                  Your password was reset by an administrator. Set a private password before continuing.
                </p>
              </div>

              <div className="mb-6 flex gap-3 rounded-md border border-primary/30 bg-primary/10 p-4">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <p className="m-0 text-sm leading-6 text-text-secondary">
                  You cannot access projects or administration features until this password change is complete.
                </p>
              </div>

              <PasswordChangeForm onChanged={handleChanged} />
            </LoginCard>
          </div>
        </section>
      </div>
    </main>
  )
}
