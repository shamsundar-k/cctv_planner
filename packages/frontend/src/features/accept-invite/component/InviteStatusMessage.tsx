interface Props {
  stage: 'loading' | 'invalid'
  invalidMsg?: string
}

export default function InviteStatusMessage({ stage, invalidMsg }: Props) {
  if (stage === 'loading') {
    return <p className="text-sm text-gray-500 mt-4">Validating invite…</p>
  }
  return <p className="text-sm text-red-600 mt-4">{invalidMsg}</p>
}
