/*
 * FILE SUMMARY - src/features/auth/LoginPage.tsx
 *
 * Login page shown to unauthenticated users at /login. Accessible only via
 * the PublicOnlyRoute guard (authenticated users are redirected to /).
 */
import LoginCard from './components/LoginCard'
import LoginForm from './components/LoginForm'

const workflowItems = [
  { step: '01', title: 'Create project', detail: 'Define the site workspace and planning context.' },
  { step: '02', title: 'Place cameras', detail: 'Map camera positions and coverage intent.' },
  { step: '03', title: 'Analyse the coverage', detail: 'Review visibility and coverage decisions before deployment.' },
]

function WorkflowPanel() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-border bg-card/70 p-5 shadow-sm xl:p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">Planning workflow</p>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-primary xl:text-3xl">
        From site layout to coverage review.
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-6 text-muted xl:text-base xl:leading-7">
        Sign in to manage CCTV projects, camera placement, and coverage decisions from one secure workspace.
      </p>

      <div className="mt-5 grid gap-3 xl:mt-8">
        {workflowItems.map((item) => (
          <div key={item.step} className="grid grid-cols-[3.5rem_1fr] gap-4 rounded-xl border border-border bg-surface/35 p-3 xl:p-4">
            <span className="text-sm font-extrabold tracking-widest text-accent">{item.step}</span>
            <span>
              <span className="block text-sm font-bold text-primary">{item.title}</span>
              <span className="mt-1 block text-sm leading-6 text-muted">{item.detail}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="h-screen overflow-hidden bg-canvas p-3 text-primary font-sans sm:p-4 lg:p-6">
      <div className="grid h-full overflow-hidden rounded-2xl border border-border bg-card shadow-[0_24px_80px_rgba(15,23,42,0.08)] lg:grid-cols-[minmax(0,1fr)_minmax(500px,1fr)]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-canvas via-card to-surface/40 px-8 py-8 lg:flex lg:flex-col xl:px-10 xl:py-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--theme-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--theme-border)_1px,transparent_1px)] bg-[size:72px_72px] opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-b from-card/40 via-transparent to-card/80" />

          <div className="relative z-10">
            <h1 className="text-5xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
            <p className="mt-3 text-lg leading-7 text-muted xl:text-xl xl:leading-8">
              Secure project and camera coverage planning
            </p>
          </div>

          <div className="relative z-10 flex flex-1 items-center py-6">
            <WorkflowPanel />
          </div>
        </section>

        <section className="flex h-full items-center justify-center overflow-hidden bg-card px-5 py-6 sm:px-8 lg:border-l lg:border-border lg:px-10 xl:px-12">
          <div className="w-full max-w-xl">
            <div className="mb-5 flex items-center gap-4 lg:hidden">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Operations Console</p>
                <h1 className="text-2xl font-extrabold tracking-tight text-primary">CCTV Planner</h1>
              </div>
            </div>

            <LoginCard>
              <div className="mb-7 text-center xl:mb-9">
                <h2 className="text-3xl font-extrabold tracking-tight text-primary xl:text-4xl">Welcome back</h2>
                <p className="mt-3 text-base leading-7 text-muted xl:mt-4 xl:text-lg">Sign in to continue to your workspace.</p>
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
