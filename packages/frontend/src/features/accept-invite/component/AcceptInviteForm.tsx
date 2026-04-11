import type { FormEvent } from 'react'

interface Props {
  email: string
  fullName: string
  setFullName: (v: string) => void
  password: string
  setPassword: (v: string) => void
  confirmPassword: string
  setConfirmPassword: (v: string) => void
  formError: string | null
  submitting: boolean
  onSubmit: (e: FormEvent) => void
}

const labelClass = 'text-xs font-bold uppercase tracking-widest pl-1 text-muted'
const inputClass =
  'rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 bg-surface/10 border border-surface/30 text-primary focus:border-primary/60 focus:bg-surface/20'

export default function AcceptInviteForm({
  email,
  fullName,
  setFullName,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  formError,
  submitting,
  onSubmit,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className={labelClass}>Email</label>
        <input
          type="email"
          value={email}
          disabled
          className={`${inputClass} opacity-50 cursor-not-allowed`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="fullName" className={labelClass}>Full name</label>
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Jane Smith"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className={labelClass}>Password</label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="confirmPassword" className={labelClass}>Confirm password</label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          className={inputClass}
        />
      </div>

      {formError && (
        <p className="text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl px-4 py-4 text-base tracking-wide shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out bg-accent text-on-accent hover:bg-accent-hover hover:text-canvas"
      >
        {submitting ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  )
}
