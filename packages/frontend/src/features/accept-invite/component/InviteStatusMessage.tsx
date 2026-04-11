interface Props {
  stage: 'loading' | 'invalid'
  invalidMsg?: string
}

export default function InviteStatusMessage({ stage, invalidMsg }: Props) {
  if (stage === 'loading') {
    return <p className="text-sm text-muted mt-2">Validating invite…</p>
  }
  return (
    <p className="text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 mt-2">
      {invalidMsg}
    </p>
  )
}
