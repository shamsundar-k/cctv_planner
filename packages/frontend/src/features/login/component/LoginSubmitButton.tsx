interface LoginSubmitButtonProps {
  loading: boolean
}

export default function LoginSubmitButton({ loading }: LoginSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-3 disabled:opacity-50 disabled:cursor-not-allowed font-bold rounded-xl px-4 py-4 text-base tracking-wide shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 ease-in-out bg-accent text-on-accent hover:bg-accent-hover hover:text-canvas"
    >
      {loading ? 'Signing in…' : 'Sign in'}
    </button>
  )
}
