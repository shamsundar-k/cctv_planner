import { useToast } from '@/components/ui/Toast'
import type { AdminPasswordResetRequest } from '../api/admin.types'
import {
  useRejectPasswordResetRequest,
  useResetRequestedPassword,
} from '../api/admin'

export function usePasswordResetActions() {
  const showToast = useToast()
  const resetPassword = useResetRequestedPassword()
  const rejectRequest = useRejectPasswordResetRequest()

  async function handleReset(request: AdminPasswordResetRequest): Promise<boolean> {
    try {
      await resetPassword.mutateAsync(request.id)
      showToast(`Password reset for ${request.email}`, 'success')
      return true
    } catch {
      showToast('Unable to reset the password. Please try again.', 'error')
      return false
    }
  }

  async function handleReject(request: AdminPasswordResetRequest): Promise<void> {
    try {
      await rejectRequest.mutateAsync(request.id)
      showToast(`Reset request for ${request.email} rejected`, 'success')
    } catch {
      showToast('Unable to reject the request. Please try again.', 'error')
    }
  }

  return {
    handleReset,
    handleReject,
    resetPendingId: resetPassword.isPending ? resetPassword.variables : undefined,
    rejectPendingId: rejectRequest.isPending ? rejectRequest.variables : undefined,
    actionPending: resetPassword.isPending || rejectRequest.isPending,
  }
}
