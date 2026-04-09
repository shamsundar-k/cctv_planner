import { useState } from 'react'
import { useToast } from '../../../components/ui/Toast'
import { useGenerateInvite } from '../api/invites'
import type { LatestInvite } from '../component/InviteGenerateCard'

export function useInvites() {
  const showToast = useToast()
  const generateInvite = useGenerateInvite()

  const [latestCreatedInvite, setLatestCreatedInvite] = useState<LatestInvite | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  async function handleGenerateInvite(email: string): Promise<void> {
    const result = await generateInvite.mutateAsync(email)
    setLatestCreatedInvite({ id: result.id, invite_url: result.invite_url, email })
    showToast(`Invite generated for ${email}`, 'success')
  }

  async function handleCopyInvite(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      showToast('Invite URL copied to clipboard', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      showToast('Failed to copy URL', 'error')
    }
  }

  return {
    latestCreatedInvite,
    copiedId,
    handleGenerateInvite,
    handleCopyInvite,
    generateInvitePending: generateInvite.isPending,
  }
}
