/*
 * FILE SUMMARY - src/features/auth/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
 */
import { Camera, ClipboardCheck, Layers3, Palette, TimerReset } from 'lucide-react'
import LoginCard from './components/LoginCard'
import LoginForm from './components/LoginForm'
import { themeOptions, type Theme } from '../../styles/theme'
import { useTheme } from '../../styles/useTheme'

const benefitItems = [
  {
    icon: Layers3,
    title: 'Organized projects',
    detail: 'Keep plans, camera details, and project context together for every site.',
  },
  {
    icon: TimerReset,
    title: 'Faster planning',
    detail: 'Move from project setup to camera placement with fewer manual steps.',
  },
  {
    icon: ClipboardCheck,
    title: 'Clear decisions',
    detail: 'Review layouts and planning notes in one place before handoff.',
  },
]

function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-text-secondary">
      <Palette className="h-4 w-4 text-primary" />
      <span className="sr-only">Theme</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as Theme)}
        className="h-10 w-40 max-w-[42vw] rounded-md border border-panel-border bg-background px-3 text-sm font-semibold text-text-primary outline-none transition-colors hover:border-primary focus:border-primary"
      >
        {themeOptions.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default function LoginPage() {
  return (
    <main className="h-dvh overflow-hidden bg-background p-3 font-sans text-foreground sm:p-4 lg:p-6">
      <div className="grid h-full overflow-hidden rounded-lg border border-panel-border bg-panel shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.8fr)]">
        <section className="relative hidden overflow-hidden bg-background px-8 py-8 lg:flex lg:flex-col lg:justify-between xl:px-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--app-divider)_1px,transparent_1px),linear-gradient(to_bottom,var(--app-divider)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60" />
          <div className="absolute left-[11%] top-[28%] h-72 w-72 rounded-full border border-primary/20" />
          <div className="absolute right-[8%] top-[17%] h-56 w-56 rounded-full border border-reference-point/20" />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_bottom,transparent,var(--app-panel))]" />

          <div className="relative z-10 flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-camera-marker text-camera-marker-foreground">
                  <Camera className="h-5 w-5" />
                </span>
                <h1 className="text-5xl font-semibold tracking-normal text-text-primary xl:text-6xl">CCTV Planner</h1>
              </div>
              <p className="mt-4 max-w-md text-lg leading-7 text-text-secondary">
                Sign in to continue to your workspace.
              </p>
            </div>
            <div className="hidden xl:block">
              <ThemeSelector />
            </div>
          </div>

          <div className="relative z-10 my-8 grid max-w-3xl gap-3 xl:grid-cols-3">
            {benefitItems.map((item) => {
              const Icon = item.icon

              return (
                <div key={item.title} className="rounded-md border border-panel-border bg-panel/85 p-4 shadow-sm backdrop-blur">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-base font-semibold text-text-primary">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{item.detail}</p>
                </div>
              )
            })}
          </div>

          <div className="relative z-10 max-w-xl rounded-md border border-panel-border bg-panel/75 p-4 shadow-sm backdrop-blur">
            <p className="text-sm font-semibold text-text-primary">Built for practical CCTV planning</p>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Work with a clean project workspace, consistent camera data, and a focused planning flow for daily operations.
            </p>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center bg-panel px-5 py-4 sm:px-8 lg:border-l lg:border-panel-border lg:px-10 xl:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-4 flex items-start justify-between gap-4 lg:hidden">
              <div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-camera-marker text-camera-marker-foreground">
                    <Camera className="h-5 w-5" />
                  </span>
                  <h1 className="text-2xl font-semibold tracking-normal text-text-primary">CCTV Planner</h1>
                </div>
                <p className="mt-1 text-sm text-text-secondary">Sign in to continue.</p>
              </div>
              <ThemeSelector />
            </div>
            <div className="mb-4 hidden justify-end lg:flex xl:hidden">
              <ThemeSelector />
            </div>

            <LoginCard>
              <div className="mb-6 text-center xl:mb-8">
                <h2 className="text-3xl font-semibold tracking-normal text-text-primary xl:text-4xl">Welcome back</h2>
                <p className="mt-3 text-base leading-7 text-text-secondary">
                  Sign in to continue to your workspace.
                </p>
              </div>

              <LoginForm />
            </LoginCard>

            <p className="mt-4 text-center text-xs font-medium tracking-wide text-text-muted">CCTV Planner</p>
          </div>
        </section>
      </div>
    </main>
  )
}
