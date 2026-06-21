/*
 * FILE SUMMARY - src/features/auth/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
 */
import LoginCard from './components/LoginCard'
import LoginForm from './components/LoginForm'

const featureItems = ['Project planning', 'Camera coverage', 'Secure admin access']

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas text-primary font-sans">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <section className="relative hidden overflow-hidden border-r border-border bg-card/60 px-10 py-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute left-10 right-10 top-24 h-px bg-border" />
            <div className="absolute bottom-24 left-10 right-10 h-px bg-border" />
            <div className="absolute bottom-0 left-28 top-0 w-px bg-border" />
            <div className="absolute bottom-0 right-24 top-0 w-px bg-border" />
          </div>

          <div className="relative z-10">
            <div className="mb-10 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-on-accent shadow-lg shadow-black/10">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <rect x="2" y="7" width="14" height="10" rx="2" className="fill-current" />
                <path d="M16 10l5-3v10l-5-3V10z" className="fill-current" />
                <circle cx="9" cy="12" r="2" className="fill-card" />
              </svg>
            </div>

            <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-muted">Operations Console</p>
            <h1 className="max-w-md text-5xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
            <p className="mt-5 max-w-md text-lg leading-8 text-muted">
              Secure project and camera coverage planning for controlled site deployments.
            </p>
          </div>

          <div className="relative z-10 rounded-2xl border border-border bg-canvas/70 p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">Workspace status</p>
                <p className="mt-1 text-sm font-semibold text-primary">Ready for secure access</p>
              </div>
              <span className="h-3 w-3 rounded-full bg-accent ring-4 ring-accent/15" />
            </div>

            <div className="grid gap-3">
              {featureItems.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-surface/50 px-4 py-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                  </span>
                  <span className="text-sm font-semibold text-primary">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center gap-4 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-on-accent shadow-lg shadow-black/10">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="2" y="7" width="14" height="10" rx="2" className="fill-current" />
                  <path d="M16 10l5-3v10l-5-3V10z" className="fill-current" />
                  <circle cx="9" cy="12" r="2" className="fill-card" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Operations Console</p>
                <h1 className="text-2xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
              </div>
            </div>

            <LoginCard>
              <div className="mb-8">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-accent">Secure access</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-primary">Welcome back</h2>
                <p className="mt-3 text-sm leading-6 text-muted">Sign in to continue to your workspace.</p>
              </div>

              <LoginForm />
            </LoginCard>

            <p className="mt-6 text-center text-xs font-medium tracking-wide text-muted">
              CCTV Planner - Secure Access Portal
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
